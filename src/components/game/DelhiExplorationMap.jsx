import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Compass, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Lock, 
  Landmark, 
  ShieldAlert, 
  UtensilsCrossed, 
  Trees 
} from 'lucide-react';
import { delhiCityData } from '../../data/cities/delhi';
import { useGame } from '../../hooks/useGame';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/mapGame.css';

// Icon map for landmarks
const categoryIconMap = {
  heritage: Landmark,
  protest: ShieldAlert,
  markets: UtensilsCrossed,
  nature: Trees,
  culture: Sparkles
};

export default function DelhiExplorationMap({ onSelectLocation }) {
  const { isLocationCompleted, isLocationUnlocked, completedLocations } = useGame();
  const stageRef = useRef(null);
  const fogCanvasRef = useRef(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Pan interaction handlers
  const handleMouseDown = (e) => {
    // Only drag with left mouse button and not on interactive buttons
    if (e.button !== 0 || e.target.closest('button')) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.75), 2.2));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2.2));
    audioSystem.playClick();
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.75));
    audioSystem.playClick();
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    audioSystem.playClick();
  };

  // Center camera onto a specific location
  const focusOnLocation = (loc) => {
    if (!isLocationUnlocked(loc.id)) {
      audioSystem.playError();
      return;
    }

    audioSystem.playClick();

    // Map artwork is 1800x1200. Convert coordinate percentage to offset from center.
    const targetX = ((loc.coordinates.x / 100) - 0.5) * 1800 * zoom;
    const targetY = ((loc.coordinates.y / 100) - 0.5) * 1200 * zoom;

    setPan({ x: -targetX, y: -targetY });

    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  // --- Dynamic Fog of War Canvas Rendering ---
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1800;
    canvas.height = 1200;

    let animId;
    let time = 0;

    const renderFog = () => {
      time += 0.008;
      ctx.clearRect(0, 0, 1800, 1200);

      // Atmospheric mist over unexplored locations
      delhiCityData.locations.forEach((loc, idx) => {
        const isDone = isLocationCompleted(loc.id);
        const px = (loc.coordinates.x / 100) * 1800;
        const py = (loc.coordinates.y / 100) * 1200;

        // If not completed, draw billowing cloud layer over this zone
        if (!isDone) {
          const mistRadius = 140 + Math.sin(time + idx) * 20;
          const grad = ctx.createRadialGradient(px, py, 20, px, py, mistRadius);
          grad.addColorStop(0, 'rgba(180, 200, 225, 0.45)');
          grad.addColorStop(0.5, 'rgba(148, 175, 210, 0.25)');
          grad.addColorStop(1, 'rgba(100, 130, 175, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, mistRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(renderFog);
    };

    renderFog();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [completedLocations, isLocationCompleted]);

  return (
    <div 
      className="map-game-viewport" 
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      role="region"
      aria-label="Interactive Delhi Exploration Map"
    >
      {/* Draggable & Scalable Stage */}
      <div 
        className="map-interactive-stage"
        ref={stageRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isDraggingRef.current ? 'none' : 'transform 250ms cubic-bezier(0.1, 0.8, 0.2, 1)'
        }}
      >
        <div className="map-artwork-wrapper">
          {/* Base Illustrated Map Artwork */}
          <img 
            src="/assets/delhi_map_illustrated.jpg" 
            alt="The Fogged City - Delhi Illustrated Adventure Map" 
            className="map-artwork-image" 
          />

          {/* Dynamic Procedural Fog of War Overlay */}
          <canvas ref={fogCanvasRef} className="map-fog-canvas" />

          {/* Interactive Location Beacons */}
          {delhiCityData.locations.map((loc) => {
            const isCompleted = isLocationCompleted(loc.id);
            const isUnlocked = isLocationUnlocked(loc.id);
            const isJantarMantar = loc.id === 'jantar-mantar';
            const Icon = categoryIconMap[loc.category] || Landmark;

            let beaconState = 'locked';
            if (isCompleted) beaconState = 'completed';
            else if (isUnlocked) beaconState = 'unlocked';

            return (
              <button
                key={loc.id}
                type="button"
                className={`location-beacon ${beaconState} ${isJantarMantar && !isCompleted ? 'is-first-target' : ''}`}
                style={{
                  left: `${loc.coordinates.x}%`,
                  top: `${loc.coordinates.y}%`,
                  '--beacon-glow': loc.accentGlow
                }}
                onClick={() => focusOnLocation(loc)}
                onMouseEnter={() => {
                  if (isUnlocked) audioSystem.playBeaconHover();
                }}
                aria-label={`${loc.name} (${loc.subCategory}) - ${isCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}`}
              >
                {/* Golden Guide Spotlight Beam for First Playable Destination (Jantar Mantar) */}
                {isJantarMantar && !isCompleted && (
                  <div className="beacon-spotlight" />
                )}

                {/* Animated Pulsing Rings for Unlocked Destinations */}
                {isUnlocked && !isCompleted && (
                  <>
                    <div className="beacon-pulse-ring" />
                    <div className="beacon-pulse-ring beacon-pulse-ring-delayed" />
                  </>
                )}

                {/* Core Circular Marker */}
                <div 
                  className="beacon-core"
                  style={{
                    borderColor: isCompleted ? '#10b981' : isUnlocked ? loc.color : 'rgba(255, 255, 255, 0.3)',
                    color: isCompleted ? '#ffffff' : loc.color
                  }}
                >
                  {isCompleted ? (
                    <Check size={22} strokeWidth={2.8} />
                  ) : isUnlocked ? (
                    <Icon size={20} />
                  ) : (
                    <Lock size={18} color="#94a3b8" />
                  )}
                </div>

                {/* Thematic Location Tag Label */}
                <div className="beacon-label">
                  <span className="beacon-name">{loc.name}</span>
                  <span className="beacon-category" style={{ color: loc.color }}>
                    {loc.subCategory}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Compass Rose Indicator */}
      <div className="map-compass-indicator" aria-hidden="true">
        <Compass size={18} color="var(--accent-amber)" />
        <span>DELHI EXPLORATION MAP</span>
      </div>

      {/* Floating Zoom & Camera Controls */}
      <nav className="map-controls-panel" aria-label="Map navigation controls">
        <button 
          type="button" 
          className="map-control-btn" 
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in on map"
        >
          <Plus size={18} />
        </button>
        <button 
          type="button" 
          className="map-control-btn" 
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out on map"
        >
          <Minus size={18} />
        </button>
        <button 
          type="button" 
          className="map-control-btn" 
          onClick={handleResetView}
          title="Reset View"
          aria-label="Reset map view to center"
        >
          <RotateCcw size={16} />
        </button>
      </nav>
    </div>
  );
}
