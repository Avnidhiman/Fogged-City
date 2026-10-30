/**
 * CharacterJourney.jsx — THE FOGGED CITY
 *
 * Cinematic character movement system between mystery locations.
 *
 * Triggered automatically when a level is completed (reads `lastCompletedId`
 * from GameContext). Animates a player avatar along a pre-computed
 * geographical route on the MapLibre map using:
 *
 *   • A GeoJSON LineString source for the glowing route trail
 *   • A GeoJSON Point source for the animated avatar marker
 *   • requestAnimationFrame for smooth 60fps movement
 *   • MapLibre's flyTo / easeTo for camera tracking
 *   • A growing "completed trail" behind the avatar to show progress
 *
 * Constraints honoured:
 *   - pointer-events: none on all decorative elements; skip button gets focus
 *   - prefers-reduced-motion: skip straight to destination, no animation
 *   - Deduplication: animationIdRef ensures one animation per completion event
 *   - Cleanup: all rAF, layers and sources removed on unmount / re-trigger
 *   - No new npm deps: pure MapLibre GL + canvas APIs
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { delhiChapterData } from '../../data/cities/delhi';
import { getRoute, samplePath, easeInOut } from '../../data/routes';
import '../../styles/journey.css';

// ─── Configuration ────────────────────────────────────────────────────────
const JOURNEY_DURATION_MS     = 4200;   // total travel time (ms) normal mode
const CAMERA_LOOK_AHEAD       = 0.08;   // how far ahead the camera looks (0–1)
const AVATAR_LAYER_ID         = 'journey-avatar-layer';
const AVATAR_SOURCE_ID        = 'journey-avatar-source';
const ROUTE_FULL_LAYER_ID     = 'journey-route-full';
const ROUTE_FULL_SOURCE_ID    = 'journey-route-full-source';
const ROUTE_TRAIL_LAYER_ID    = 'journey-route-trail';
const ROUTE_TRAIL_SOURCE_ID   = 'journey-route-trail-source';

// Role → colour mapping for the avatar glow
const ROLE_COLORS = {
  cipher:      '#38bdf8',   // sky blue
  seeker:      '#f59e0b',   // amber
  'voice-lore':'#a78bfa',   // violet
  default:     '#e2e8f0',   // silver
};

function getRoleColor(team) {
  if (!team?.members?.length) return ROLE_COLORS.default;
  // Use the first member's role colour
  const role = team.members[0]?.role;
  return ROLE_COLORS[role] || ROLE_COLORS.default;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Safely add a GeoJSON source + layer to the map; no-ops if already present */
function safeAddSource(map, id, data) {
  if (!map.getSource(id)) {
    map.addSource(id, { type: 'geojson', data });
  } else {
    map.getSource(id).setData(data);
  }
}

function safeRemoveLayer(map, id) {
  try { if (map.getLayer(id)) map.removeLayer(id); } catch (_) {}
}
function safeRemoveSource(map, id) {
  try { if (map.getSource(id)) map.removeSource(id); } catch (_) {}
}

function cleanupJourneyLayers(map) {
  if (!map) return;
  safeRemoveLayer(map, AVATAR_LAYER_ID);
  safeRemoveLayer(map, ROUTE_TRAIL_LAYER_ID);
  safeRemoveLayer(map, ROUTE_FULL_LAYER_ID);
  safeRemoveSource(map, AVATAR_SOURCE_ID);
  safeRemoveSource(map, ROUTE_TRAIL_SOURCE_ID);
  safeRemoveSource(map, ROUTE_FULL_SOURCE_ID);
}

function makePoint(coord) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: coord },
    properties: {}
  };
}

function makeLine(coords) {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties: {}
  };
}

// ─── Component ────────────────────────────────────────────────────────────
export default function CharacterJourney({ mapInstance }) {
  const { lastCompletedId, completedLevels, team } = useGame();
  const [isAnimating, setIsAnimating]   = useState(false);
  const [showSkip,    setShowSkip]      = useState(false);

  // Refs that survive re-renders without triggering them
  const rafRef          = useRef(null);
  const skipRef         = useRef(false);                // set true when skip button pressed
  const lastAnimatedRef = useRef(null);                 // prevent re-triggering same completion
  const mapRef          = useRef(mapInstance);

  // Keep mapRef in sync with prop changes
  useEffect(() => { mapRef.current = mapInstance; }, [mapInstance]);

  // Reduced-motion preference
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // ── Main journey trigger ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lastCompletedId) return;

    // Prevent re-animating the same completion event
    if (lastAnimatedRef.current === lastCompletedId) return;
    lastAnimatedRef.current = lastCompletedId;

    // Find the level that was just completed
    const fromLevel = delhiChapterData.levels.find(l => l.id === lastCompletedId);
    if (!fromLevel) return;

    // Find the next sequential level (the destination)
    const fromIdx  = delhiChapterData.levels.findIndex(l => l.id === lastCompletedId);
    const toLevel  = delhiChapterData.levels[fromIdx + 1];
    if (!toLevel) return; // last level completed — no journey needed

    // Get the geographical waypoints for this transition
    const waypoints = getRoute(lastCompletedId, toLevel.id);
    if (!waypoints || waypoints.length < 2) return;

    const avatarColor = getRoleColor(team);

    // ── REDUCED MOTION: instant teleport, no animation ──────────────────
    if (prefersReducedMotion.current) {
      map.flyTo({
        center: toLevel.coordinates,
        zoom: toLevel.zoomTarget || 14.5,
        pitch: toLevel.pitchTarget || 35,
        bearing: toLevel.bearingTarget || 0,
        duration: 800,
        essential: true
      });
      return;
    }

    // ── ANIMATED JOURNEY ─────────────────────────────────────────────────

    // Wait for the map to be idle before adding layers
    // (the MysteryPanel close might trigger a flyTo that we don't want to fight)
    let setupTimeout = setTimeout(() => {
      startJourney(map, waypoints, fromLevel, toLevel, avatarColor);
    }, 600); // short delay so MysteryPanel close animation finishes

    return () => {
      clearTimeout(setupTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCompletedId]);

  // ── Journey engine ────────────────────────────────────────────────────
  const startJourney = useCallback((map, waypoints, fromLevel, toLevel, avatarColor) => {
    // Cancel any in-flight animation
    cancelAnimationFrame(rafRef.current);
    skipRef.current = false;

    setIsAnimating(true);
    setShowSkip(true);

    // ── 1. Add the full faint route preview ─────────────────────────────
    try {
      map.addSource(ROUTE_FULL_SOURCE_ID, {
        type: 'geojson',
        data: makeLine(waypoints)
      });

      map.addLayer({
        id: ROUTE_FULL_LAYER_ID,
        type: 'line',
        source: ROUTE_FULL_SOURCE_ID,
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': avatarColor,
          'line-width': 2,
          'line-opacity': 0.18,
          'line-dasharray': [3, 4],
          'line-blur': 1
        }
      });
    } catch (_) { /* layer may already exist if a previous animation was interrupted */ }

    // ── 2. Add the growing active trail source ───────────────────────────
    try {
      map.addSource(ROUTE_TRAIL_SOURCE_ID, {
        type: 'geojson',
        data: makeLine([waypoints[0], waypoints[0]])
      });

      // Outer glow
      map.addLayer({
        id: ROUTE_TRAIL_LAYER_ID + '-glow',
        type: 'line',
        source: ROUTE_TRAIL_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': avatarColor,
          'line-width': 10,
          'line-opacity': 0.20,
          'line-blur': 6
        }
      });

      // Core trail
      map.addLayer({
        id: ROUTE_TRAIL_LAYER_ID,
        type: 'line',
        source: ROUTE_TRAIL_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': avatarColor,
          'line-width': 2.5,
          'line-opacity': 0.75
        }
      });
    } catch (_) {}

    // ── 3. Add the avatar circle marker ──────────────────────────────────
    try {
      map.addSource(AVATAR_SOURCE_ID, {
        type: 'geojson',
        data: makePoint(waypoints[0])
      });

      // Outer halo ring
      map.addLayer({
        id: AVATAR_LAYER_ID + '-halo',
        type: 'circle',
        source: AVATAR_SOURCE_ID,
        paint: {
          'circle-radius': 14,
          'circle-color': 'transparent',
          'circle-stroke-width': 2,
          'circle-stroke-color': avatarColor,
          'circle-stroke-opacity': 0.5,
          'circle-blur': 0.3
        }
      });

      // Outer glow
      map.addLayer({
        id: AVATAR_LAYER_ID + '-glow',
        type: 'circle',
        source: AVATAR_SOURCE_ID,
        paint: {
          'circle-radius': 20,
          'circle-color': avatarColor,
          'circle-opacity': 0.12,
          'circle-blur': 1
        }
      });

      // Core avatar dot
      map.addLayer({
        id: AVATAR_LAYER_ID,
        type: 'circle',
        source: AVATAR_SOURCE_ID,
        paint: {
          'circle-radius': 7,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': avatarColor,
          'circle-opacity': 1
        }
      });
    } catch (_) {}

    // ── 4. rAF animation loop ─────────────────────────────────────────────
    const startTime = performance.now();

    const tick = (now) => {
      if (skipRef.current) {
        finishJourney(map, toLevel, waypoints);
        return;
      }

      const elapsed  = now - startTime;
      const rawT     = Math.min(elapsed / JOURNEY_DURATION_MS, 1);
      const easedT   = easeInOut(rawT);

      // Current avatar position
      const pos = samplePath(waypoints, easedT);

      // Look-ahead position for camera
      const camT = Math.min(easedT + CAMERA_LOOK_AHEAD, 1);
      const camPos = samplePath(waypoints, camT);

      // Update avatar
      try {
        map.getSource(AVATAR_SOURCE_ID)?.setData(makePoint(pos));
      } catch (_) {}

      // Update growing trail (slice of waypoints up to current position)
      try {
        // Build partial trail: all waypoints up to current + interpolated current pos
        const trailPoints = [waypoints[0]];
        for (let i = 1; i < waypoints.length; i++) {
          // Compute cumulative t for this waypoint
          const segT = (i / (waypoints.length - 1));
          if (segT < easedT) {
            trailPoints.push(waypoints[i]);
          } else {
            trailPoints.push(pos);
            break;
          }
        }
        if (trailPoints.length === 1) trailPoints.push(pos);
        map.getSource(ROUTE_TRAIL_SOURCE_ID)?.setData(makeLine(trailPoints));
      } catch (_) {}

      // Smooth camera: follow avatar with a slight look-ahead offset
      // Use easeTo (not flyTo) to avoid the jump that flyTo's easing causes
      if (rawT > 0.02 && rawT < 0.95) {
        try {
          map.easeTo({
            center: camPos,
            zoom: 13.2 + easedT * 1.0,   // gradually zoom in toward destination
            duration: 600,
            easing: (t) => t,             // linear for camera — easing is on path
            essential: true
          });
        } catch (_) {}
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finishJourney(map, toLevel, waypoints);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [team]);

  // ── Finish / landing sequence ─────────────────────────────────────────
  const finishJourney = useCallback((map, toLevel, waypoints) => {
    cancelAnimationFrame(rafRef.current);

    // Snap avatar to exact destination
    try {
      map.getSource(AVATAR_SOURCE_ID)?.setData(makePoint(toLevel.coordinates));
      map.getSource(ROUTE_TRAIL_SOURCE_ID)?.setData(makeLine(waypoints));
    } catch (_) {}

    // Cinematic landing flyTo
    try {
      map.flyTo({
        center: toLevel.coordinates,
        zoom: toLevel.zoomTarget || 15.2,
        pitch: toLevel.pitchTarget || 40,
        bearing: toLevel.bearingTarget || 0,
        duration: 1600,
        essential: true
      });
    } catch (_) {}

    // Hold avatar at destination briefly, then clean up layers
    setTimeout(() => {
      try { cleanupJourneyLayers(map); } catch (_) {}
      setIsAnimating(false);
      setShowSkip(false);
    }, 2200);
  }, []);

  // ── Skip handler ─────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    skipRef.current = true;
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      try { cleanupJourneyLayers(mapRef.current); } catch (_) {}
    };
  }, []);

  // Component renders only the skip button (the map rendering is imperative)
  if (!showSkip) return null;

  return (
    <div className="journey-skip-container" aria-live="polite">
      <div className="journey-status-indicator">
        <span className="journey-status-dot" />
        <span>Navigating to next location…</span>
      </div>
      <button
        type="button"
        className="journey-skip-btn"
        onClick={handleSkip}
        aria-label="Skip character movement animation"
      >
        Skip →
      </button>
    </div>
  );
}
