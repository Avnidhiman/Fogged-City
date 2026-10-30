import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { 
  Plus, 
  Minus, 
  Compass, 
  RotateCcw, 
  Check, 
  Lock, 
  Target, 
  Landmark, 
  Sparkles 
} from 'lucide-react';
import { delhiChapterData } from '../../data/cities/delhi';
import { useGame } from '../../hooks/useGame';
import { audioSystem } from '../../utils/audioSystem';
import FogSystem from './FogSystem';
import '../../styles/maplibreStyles.css';

// OpenStreetMap tiles styled with MapLibre raster paint properties
// to create a cinematic midnight navy aesthetic.
const cartoDarkStyle = {
  version: 8,

  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors"
    }
  },

  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        // Dim overall brightness — keeps roads readable while feeling like midnight
        "raster-brightness-min": 0.0,
        "raster-brightness-max": 0.42,
        // Slight desaturation so colours shift toward charcoal/navy
        "raster-saturation": -0.72,
        // Gentle contrast bump so streets pop against dark zones
        "raster-contrast": 0.18,
        // Hue-shift toward blue-navy to reinforce the cinematic night palette
        "raster-hue-rotate": 195,
        // Small fade-in on tile load to avoid harsh pop-in
        "raster-fade-duration": 300
      }
    }
  ]
};

export default function RealDelhiMap({ onSelectLevel }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  // Expose the live maplibregl.Map instance to FogSystem via state.
  // We need a state (not just ref) so FogSystem re-receives it after mount.
  const [mapInstance, setMapInstance] = useState(null);

  const { isLevelCompleted, isLevelUnlocked, completedLevels } = useGame();

  // Helper to fly to a location
  const flyToLevel = useCallback((level) => {
    if (!mapInstanceRef.current) return;
    audioSystem.playClick();

    mapInstanceRef.current.flyTo({
      center: level.coordinates,
      zoom: level.zoomTarget || 15.5,
      pitch: level.pitchTarget || 45,
      bearing: level.bearingTarget || 0,
      essential: true,
      duration: 1800
    });

    if (onSelectLevel) {
      setTimeout(() => {
        onSelectLevel(level);
      }, 700);
    }
  }, [onSelectLevel]);

  // --- 1. Initialize MapLibre GL Map ---
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: cartoDarkStyle,
      center: delhiChapterData.mapConfig.initialCenter,
      zoom: delhiChapterData.mapConfig.initialZoom,
      minZoom: delhiChapterData.mapConfig.minZoom,
      maxZoom: delhiChapterData.mapConfig.maxZoom,
      pitch: delhiChapterData.mapConfig.pitch,
      bearing: delhiChapterData.mapConfig.bearing,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Signal React that the map is ready so FogSystem can start rendering
    map.once('load', () => {
      setMapReady(true);
      setMapInstance(map);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
      setMapInstance(null);
    };
  }, []);

  // --- 2. Create / Update Markers ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    delhiChapterData.levels.forEach((level) => {
      const isCompleted = isLevelCompleted(level.id);
      const isUnlocked = isLevelUnlocked(level.id);

      // Create custom DOM element for marker
      const el = document.createElement('div');
      let statusClass = 'locked-beacon';
      if (isCompleted) statusClass = 'completed-beacon';
      else if (isUnlocked) statusClass = 'active-beacon';

      el.className = `custom-map-marker ${statusClass}`;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${level.name} - ${isCompleted ? 'Cleared' : isUnlocked ? 'Unlocked' : 'Locked'}`);

      // Internal pin head
      el.innerHTML = `
        ${isUnlocked && !isCompleted ? '<div class="marker-beacon-halo"></div>' : ''}
        <div class="marker-pin-head">
          ${isCompleted 
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : isUnlocked 
              ? `<span style="font-family: var(--font-display); font-weight: 800; font-size: 15px;">0${level.levelNumber}</span>`
              : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
          }
        </div>
        <div class="marker-pin-tip"></div>
        <div class="marker-floating-label">
          <span class="marker-title">${level.name}</span>
          <span class="marker-district">${level.district}</span>
        </div>
      `;

      el.addEventListener('click', () => {
        if (!isUnlocked) {
          audioSystem.playError();
          return;
        }
        flyToLevel(level);
      });

      el.addEventListener('mouseenter', () => {
        if (isUnlocked) audioSystem.playBeaconHover();
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(level.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [completedLevels, isLevelCompleted, isLevelUnlocked, flyToLevel]);

  // Fog rendering is handled by the separate <FogSystem> component,
  // which receives the live mapInstance and manages its own canvas.

  // Floating map zoom & view controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      audioSystem.playClick();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      audioSystem.playClick();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: delhiChapterData.mapConfig.initialCenter,
        zoom: delhiChapterData.mapConfig.initialZoom,
        pitch: delhiChapterData.mapConfig.pitch,
        bearing: delhiChapterData.mapConfig.bearing,
        duration: 1600
      });
      audioSystem.playClick();
    }
  };

  const handleFlyToActiveTarget = () => {
    const activeLevel = delhiChapterData.levels.find(l => isLevelUnlocked(l.id) && !isLevelCompleted(l.id)) 
      || delhiChapterData.levels[0];
    flyToLevel(activeLevel);
  };

  return (
    <div className="real-map-container" role="region" aria-label="Geographic Delhi Map">
      {/* MapLibre WebGL Viewport */}
      <div ref={mapContainerRef} className="maplibre-viewport" />

      {/*
        Atmospheric Fog System:
        • FogSystem — canvas-driven, game-state-reactive fog (z-index 3)
        • fog-css-layer — pure-CSS animating mist wisps (z-index 4)
        Both are pointer-events: none — map interaction flows through freely.
        Only rendered after the map has loaded to avoid projection errors.
      */}
      {mapReady && (
        <>
          <FogSystem mapInstance={mapInstance} />
          <div className="fog-css-layer" aria-hidden="true" />
        </>
      )}

      {/* Floating Map Navigation Panel — z-index 40, always above fog */}
      <nav className="real-map-controls-panel" aria-label="Map Controls">
        <button 
          type="button" 
          className="real-map-control-btn" 
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus size={18} />
        </button>
        <button 
          type="button" 
          className="real-map-control-btn" 
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus size={18} />
        </button>
        <button 
          type="button" 
          className="real-map-control-btn" 
          onClick={handleResetView}
          title="Reset View"
          aria-label="Reset map view"
        >
          <RotateCcw size={16} />
        </button>
        <button 
          type="button" 
          className="real-map-control-btn" 
          onClick={handleFlyToActiveTarget}
          title="Fly to Active Objective"
          aria-label="Fly to active objective"
          style={{ color: 'var(--accent-amber-light)' }}
        >
          <Target size={18} />
        </button>
      </nav>
    </div>
  );
}
