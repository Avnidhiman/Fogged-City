import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Lock, 
  Megaphone, 
  Landmark, 
  ShieldAlert, 
  UtensilsCrossed, 
  Compass,
  ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { delhiCityData } from '../../data/cities/delhi';
import { useGame } from '../../hooks/useGame';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/livingMap.css';

export default function LivingCityMap({ onSelectLevel }) {
  const navigate = useNavigate();
  const { isLevelCompleted, isLevelUnlocked, completedLevels } = useGame();
  
  const stageRef = useRef(null);
  const fogCanvasRef = useRef(null);

  // Pan & Zoom State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Pan event handlers
  const handleMouseDown = (e) => {
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
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * factor, 0.75), 2.2));
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

  // Center camera onto landmark
  const handleLandmarkClick = (lvl) => {
    if (!isLevelUnlocked(lvl.id)) {
      audioSystem.playError();
      return;
    }

    audioSystem.playClick();

    // Smoothly pan camera to center the chosen landmark
    // Canvas is 2400x1600. Center is (1200, 800)
    const targetX = -(lvl.coordinates.x - 1200) * zoom;
    const targetY = -(lvl.coordinates.y - 800) * zoom;
    setPan({ x: targetX, y: targetY });

    if (onSelectLevel) {
      onSelectLevel(lvl);
    }
  };

  // --- Dynamic Procedural Fog of War Canvas Rendering ---
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 2400;
    canvas.height = 1600;

    let animId;
    let time = 0;

    const renderFog = () => {
      time += 0.01;
      ctx.clearRect(0, 0, 2400, 1600);

      // Render drifting fog clusters over locked levels
      delhiCityData.levels.forEach((lvl, idx) => {
        const isDone = isLevelCompleted(lvl.id);
        const isUnlocked = isLevelUnlocked(lvl.id);

        // If not completed, draw billowing atmospheric fog
        if (!isDone) {
          const radius = (isUnlocked ? 110 : 180) + Math.sin(time + idx) * 20;
          const grad = ctx.createRadialGradient(
            lvl.coordinates.x, lvl.coordinates.y, 20,
            lvl.coordinates.x, lvl.coordinates.y, radius
          );
          grad.addColorStop(0, isUnlocked ? 'rgba(180, 200, 230, 0.3)' : 'rgba(148, 163, 184, 0.6)');
          grad.addColorStop(0.6, 'rgba(100, 125, 160, 0.35)');
          grad.addColorStop(1, 'rgba(50, 75, 110, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(lvl.coordinates.x, lvl.coordinates.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(renderFog);
    };

    renderFog();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [completedLevels, isLevelCompleted, isLevelUnlocked]);

  return (
    <div 
      className="living-map-viewport" 
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      role="region"
      aria-label="Living Miniature Delhi Map"
    >
      {/* Chapter Tag on Top Left */}
      <div className="living-map-chapter-tag">
        <button 
          type="button" 
          onClick={() => navigate('/chapters')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}
          title="Return to Chapter Selection"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="chapter-tag-name">CHAPTER 01</span>
        <span className="chapter-tag-badge">DELHI</span>
      </div>

      {/* Stage Container */}
      <div 
        className="living-map-stage"
        ref={stageRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isDraggingRef.current ? 'none' : 'transform 260ms cubic-bezier(0.1, 0.8, 0.2, 1)'
        }}
      >
        <div className="living-city-canvas">
          {/* Base SVG Layer: River, Metro Tracks, Roads, Miniature Buildings */}
          <svg 
            width="2400" 
            height="1600" 
            viewBox="0 0 2400 1600" 
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              {/* River Gradient */}
              <linearGradient id="yamunaWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f4c6e" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
              </linearGradient>

              {/* Metro Viaduct Gradient */}
              <linearGradient id="metroPillar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Warm Streetlight Glow Filter */}
              <filter id="lampGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
              </filter>
            </defs>

            {/* 1. Base District Parcels & Parks */}
            <g id="city-districts" opacity="0.9">
              {/* Central Green Belt (Lutyens/Lodhi) */}
              <path d="M 500,450 Q 800,400 1100,550 T 1500,900 Q 1100,1100 650,950 Z" fill="#0d2b24" />
              {/* Northern Ridge Forest */}
              <path d="M 350,150 Q 700,100 1000,220 T 1200,450 Q 600,350 350,150 Z" fill="#09241b" />
              {/* Old Delhi Walled City Area */}
              <path d="M 800,200 Q 1200,180 1400,320 T 1100,450 Z" fill="#2d1d17" opacity="0.8" />
              {/* Connaught Place Ring Grid */}
              <circle cx="380" cy="560" r="130" fill="#1b253d" stroke="#334155" strokeWidth="3" />
              <circle cx="380" cy="560" r="80" fill="#162035" stroke="#475569" strokeWidth="2" />
              <circle cx="380" cy="560" r="35" fill="#10b981" opacity="0.3" />
            </g>

            {/* 2. Flowing Yamuna River */}
            <g id="yamuna-river">
              {/* River Bed */}
              <path 
                d="M 1850,0 Q 1700,400 1820,800 T 1750,1600 L 1950,1600 Q 2020,800 1900,400 T 2050,0 Z" 
                fill="url(#yamunaWater)" 
              />
              {/* Animated Current Waves */}
              <path 
                d="M 1860,20 Q 1710,420 1830,820 T 1760,1580" 
                fill="none" 
                stroke="#7dd3fc" 
                strokeWidth="4" 
                className="river-current-wave"
                opacity="0.65"
              />
              <path 
                d="M 1930,40 Q 1780,440 1890,840 T 1820,1590" 
                fill="none" 
                stroke="#bae6fd" 
                strokeWidth="3" 
                className="river-current-wave"
                opacity="0.45"
                style={{ animationDuration: '9s' }}
              />

              {/* Bridges Across River */}
              {/* Signature Bridge */}
              <rect x="1710" y="380" width="220" height="16" rx="4" fill="#64748b" stroke="#94a3b8" />
              <line x1="1820" y1="340" x2="1820" y2="400" stroke="#f59e0b" strokeWidth="5" />
              {/* Old Yamuna Bridge */}
              <rect x="1750" y="780" width="180" height="14" rx="3" fill="#475569" />
              <rect x="1730" y="1180" width="190" height="14" rx="3" fill="#475569" />
            </g>

            {/* 3. Road Network */}
            <g id="road-network" stroke="#2a374f" strokeWidth="18" fill="none" strokeLinecap="round">
              {/* Ring Road Loop */}
              <path d="M 400,300 Q 1200,200 1600,400 T 1600,1200 Q 1000,1400 400,1100 Z" />
              {/* Kartavya Path Arterial Axis */}
              <path d="M 380,560 L 780,460 L 1750,780" stroke="#374763" strokeWidth="22" />
              {/* Radial Roads from CP */}
              <line x1="380" y1="560" x2="480" y2="380" stroke="#334155" strokeWidth="14" />
              <line x1="380" y1="560" x2="620" y2="520" stroke="#334155" strokeWidth="14" />
              <line x1="480" y1="380" x2="920" y2="280" stroke="#334155" strokeWidth="14" />
            </g>

            {/* Road Lane Markings */}
            <g id="road-dashes" stroke="#94a3b8" strokeWidth="2" strokeDasharray="12 12" fill="none" opacity="0.35">
              <path d="M 400,300 Q 1200,200 1600,400 T 1600,1200 Q 1000,1400 400,1100 Z" />
              <path d="M 380,560 L 780,460 L 1750,780" />
            </g>

            {/* 4. Moving Vehicles (Miniature Auto-rickshaws, Buses, Cabs) */}
            <g id="moving-traffic">
              {/* Auto Rickshaw 1 */}
              <g className="auto-rickshaw-sprite">
                <rect x="-12" y="-7" width="24" height="14" rx="4" fill="#eab308" stroke="#16a34a" strokeWidth="2" />
                <circle cx="8" cy="-4" r="2" fill="#ffffff" filter="url(#lampGlow)" />
                <circle cx="8" cy="4" r="2" fill="#ffffff" filter="url(#lampGlow)" />
              </g>

              {/* Red DTC Bus */}
              <g className="bus-sprite">
                <rect x="-24" y="-8" width="48" height="16" rx="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                <rect x="-20" y="-6" width="38" height="4" fill="#93c5fd" opacity="0.8" />
              </g>
            </g>

            {/* 5. Delhi Metro Elevated Viaduct & Moving Trains */}
            <g id="metro-system">
              {/* Viaduct Line (Red/Yellow Line track) */}
              <path 
                d="M 300,1400 Q 700,900 1200,850 T 2100,300" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="10" 
                strokeDasharray="2 6"
              />
              <path 
                d="M 300,1400 Q 700,900 1200,850 T 2100,300" 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="4" 
                opacity="0.8"
              />

              {/* Metro Train 1 (Yellow Line Express) */}
              <g className="metro-train-sprite">
                <rect x="-40" y="-6" width="80" height="12" rx="4" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
                <circle cx="36" cy="0" r="3" fill="#38bdf8" filter="url(#lampGlow)" />
                {/* Windows */}
                <rect x="-34" y="-4" width="12" height="4" fill="#0284c7" />
                <rect x="-18" y="-4" width="12" height="4" fill="#0284c7" />
                <rect x="-2" y="-4" width="12" height="4" fill="#0284c7" />
                <rect x="14" y="-4" width="12" height="4" fill="#0284c7" />
              </g>

              {/* Metro Blue Line Crossing */}
              <path 
                d="M 200,600 Q 1100,750 2200,850" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="4" 
                opacity="0.75"
              />
              <g className="metro-train-sprite-blue">
                <rect x="-35" y="-5" width="70" height="10" rx="3" fill="#f8fafc" stroke="#2563eb" strokeWidth="2" />
                <circle cx="32" cy="0" r="3" fill="#60a5fa" filter="url(#lampGlow)" />
              </g>
            </g>

            {/* 6. Street Chai Stall with Steam */}
            <g id="chai-stall" transform="translate(680, 580)">
              {/* Stall Roof */}
              <polygon points="0,0 35,0 42,12 -7,12" fill="#f59e0b" />
              {/* Kadhai & Stove */}
              <circle cx="16" cy="18" r="8" fill="#475569" />
              {/* Rising Steam */}
              <circle cx="16" cy="12" r="4" fill="#ffffff" className="chai-steam" />
            </g>

            {/* 7. Soaring Birds Flock Overhead */}
            <g id="birds" className="bird-flock">
              <path d="M 0,0 Q 5,-4 10,0 Q 15,-4 20,0" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              <path d="M 25,-15 Q 30,-19 35,-15 Q 40,-19 45,-15" fill="none" stroke="#e2e8f0" strokeWidth="1.8" />
              <path d="M -20,18 Q -15,14 -10,18 Q -5,14 0,18" fill="none" stroke="#e2e8f0" strokeWidth="1.8" />
            </g>

            {/* ========================================================== */}
            {/* 8. ILLUSTRATED MINIATURE LANDMARKS & INTERACTIVE LEVEL NODES */}
            {/* ========================================================== */}

            {/* --- LEVEL 01: PROTEST ZONE (UNLOCKED & ACTIVE) --- */}
            <g 
              id="node-protest-zone"
              className="miniature-landmark-node"
              transform="translate(480, 380)"
              onClick={() => handleLandmarkClick(delhiCityData.levels[0])}
            >
              {/* Golden Guide Spotlight Shining Down */}
              {!isLevelCompleted('protest-zone') && (
                <polygon 
                  points="-40,-350 40,-350 120,40 -120,40" 
                  fill="url(#spotlightGrad)"
                  className="spotlight-beam-level1"
                  pointerEvents="none"
                />
              )}

              {/* Animated Gathering Crowd */}
              <g id="protest-crowd">
                {/* Placard 1 */}
                <g className="protest-placard-animated">
                  <line x1="-30" y1="-2" x2="-30" y2="-32" stroke="#d97706" strokeWidth="3" />
                  <rect x="-48" y="-48" width="36" height="20" rx="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="-30" y="-35" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">JUSTICE</text>
                </g>

                {/* Placard 2: The Slogan Banner Clue */}
                <g className="protest-placard-animated protest-placard-delayed">
                  <line x1="28" y1="-2" x2="28" y2="-34" stroke="#d97706" strokeWidth="3" />
                  <rect x="8" y="-52" width="46" height="22" rx="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="31" y="-38" textAnchor="middle" fill="#070a12" fontSize="9" fontWeight="900">2 KACHODI?</text>
                </g>

                {/* Animated Crowd Figures */}
                <circle cx="-35" cy="8" r="6" fill="#38bdf8" className="crowd-char-bob" />
                <circle cx="-18" cy="12" r="6" fill="#f43f5e" className="crowd-char-bob" style={{ animationDelay: '0.3s' }} />
                <circle cx="0" cy="10" r="7" fill="#fbbf24" className="crowd-char-bob" style={{ animationDelay: '0.6s' }} />
                <circle cx="18" cy="14" r="6" fill="#a855f7" className="crowd-char-bob" style={{ animationDelay: '0.2s' }} />
                <circle cx="35" cy="8" r="6" fill="#10b981" className="crowd-char-bob" style={{ animationDelay: '0.5s' }} />
              </g>

              {/* Central Pulsing Beacon Core */}
              <circle 
                cx="0" cy="0" r="28" 
                fill="#ef4444" 
                stroke="#ffffff" 
                strokeWidth="3" 
                filter="url(#lampGlow)" 
                opacity="0.8" 
              />
              <circle cx="0" cy="0" r="22" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
              <text x="0" y="7" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">01</text>

              {/* Badge Tag */}
              <rect x="-65" y="32" width="130" height="24" rx="12" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
              <text x="0" y="48" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
                PROTEST ZONE
              </text>
            </g>

            {/* --- LEVEL 02: JANTAR MANTAR --- */}
            <g 
              id="node-jantar-mantar"
              className="miniature-landmark-node"
              transform="translate(620, 520)"
              onClick={() => handleLandmarkClick(delhiCityData.levels[1])}
            >
              {/* Miniature Terracotta Sundial Staircase */}
              <polygon points="-25,15 25,15 25,-25" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
              <path d="M 25,15 Q 45,5 50,-15" fill="none" stroke="#d97706" strokeWidth="3" />
              <path d="M -25,15 Q -45,5 -50,-15" fill="none" stroke="#d97706" strokeWidth="3" />

              {/* Core Beacon Marker */}
              <circle 
                cx="0" cy="0" r="20" 
                fill={isLevelCompleted('jantar-mantar') ? '#10b981' : isLevelUnlocked('jantar-mantar') ? '#f59e0b' : '#334155'} 
                stroke="#ffffff" 
                strokeWidth="2.5" 
              />
              <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">02</text>

              <rect x="-60" y="24" width="120" height="22" rx="11" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="0" y="39" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                Jantar Mantar
              </text>
            </g>

            {/* --- LEVEL 03: INDIA GATE --- */}
            <g 
              id="node-india-gate"
              className="miniature-landmark-node"
              transform="translate(780, 460)"
              onClick={() => handleLandmarkClick(delhiCityData.levels[2])}
            >
              {/* Miniature Arch Silhouette */}
              <path d="M -22,18 L -22,-25 Q 0,-32 22,-25 L 22,18 L 10,18 L 10,-8 Q 0,-15 -10,-8 L -10,18 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              {/* Flame */}
              <circle cx="0" cy="6" r="3" fill="#f59e0b" filter="url(#lampGlow)" />

              <circle 
                cx="0" cy="0" r="20" 
                fill={isLevelCompleted('india-gate') ? '#10b981' : isLevelUnlocked('india-gate') ? '#38bdf8' : '#334155'} 
                stroke="#ffffff" 
                strokeWidth="2.5" 
              />
              <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">03</text>

              <rect x="-55" y="24" width="110" height="22" rx="11" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="0" y="39" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                India Gate
              </text>
            </g>

            {/* --- LEVEL 04: CONNAUGHT PLACE --- */}
            <g 
              id="node-connaught-place"
              className="miniature-landmark-node"
              transform="translate(380, 560)"
              onClick={() => handleLandmarkClick(delhiCityData.levels[3])}
            >
              <circle 
                cx="0" cy="0" r="20" 
                fill={isLevelCompleted('connaught-place') ? '#10b981' : isLevelUnlocked('connaught-place') ? '#e2e8f0' : '#334155'} 
                stroke="#ffffff" 
                strokeWidth="2.5" 
              />
              <text x="0" y="6" textAnchor="middle" fill={isLevelUnlocked('connaught-place') ? '#070a12' : '#ffffff'} fontSize="13" fontWeight="bold">04</text>

              <rect x="-60" y="24" width="120" height="22" rx="11" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="0" y="39" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                Connaught Place
              </text>
            </g>

            {/* --- LEVEL 05: OLD DELHI --- */}
            <g 
              id="node-old-delhi"
              className="miniature-landmark-node"
              transform="translate(920, 280)"
              onClick={() => handleLandmarkClick(delhiCityData.levels[4])}
            >
              {/* Miniature Red Sandstone Fort Gate */}
              <rect x="-30" y="-18" width="60" height="30" rx="3" fill="#b91c1c" />
              <polygon points="-30,-18 -20,-30 -10,-18" fill="#991b1b" />
              <polygon points="10,-18 20,-30 30,-18" fill="#991b1b" />

              <circle 
                cx="0" cy="0" r="20" 
                fill={isLevelCompleted('old-delhi') ? '#10b981' : isLevelUnlocked('old-delhi') ? '#f97316' : '#334155'} 
                stroke="#ffffff" 
                strokeWidth="2.5" 
              />
              <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">05</text>

              <rect x="-55" y="24" width="110" height="22" rx="11" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="0" y="39" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                Old Delhi
              </text>
            </g>

            {/* Spotlight Gradient Definition */}
            <linearGradient id="spotlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.35" />
            </linearGradient>
          </svg>

          {/* Dynamic Fog of War Canvas Layer */}
          <canvas ref={fogCanvasRef} className="living-map-fog-overlay" />
        </div>
      </div>

      {/* Floating Zoom & Camera Reset Controls */}
      <nav className="living-map-controls" aria-label="Map camera controls">
        <button 
          type="button" 
          className="living-control-btn" 
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus size={18} />
        </button>
        <button 
          type="button" 
          className="living-control-btn" 
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus size={18} />
        </button>
        <button 
          type="button" 
          className="living-control-btn" 
          onClick={handleResetView}
          title="Reset View"
          aria-label="Reset camera view"
        >
          <RotateCcw size={16} />
        </button>
      </nav>
    </div>
  );
}
