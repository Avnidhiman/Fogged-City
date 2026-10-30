import React, { useState } from 'react';
import { 
  CloudFog, 
  Award, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw, 
  Compass, 
  Flame,
  X 
} from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import '../../styles/hud.css';

export default function GameHUD() {
  const { 
    score, 
    completedCount, 
    totalLevels, 
    progressPercentage, 
    activeObjective, 
    soundEnabled, 
    toggleSound, 
    resetProgress 
  } = useGame();

  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className="game-hud-overlay" role="toolbar" aria-label="Game HUD">
        {/* Top Floating Bar */}
        <div className="hud-top-bar">
          <div className="hud-emblem">
            <CloudFog size={22} color="var(--accent-amber)" />
            <span>THE FOGGED CITY</span>
            <span className="hud-emblem-badge">Chapter 01: Delhi</span>
          </div>

          <div className="hud-controls-cluster">
            {/* Score Metric */}
            <div className="hud-pill hud-score-pill" title="Total Exploration Score">
              <Award size={16} color="var(--accent-amber)" />
              <span>Score:</span>
              <strong>{score}</strong>
            </div>

            {/* Fog Cleared Metric */}
            <div className="hud-pill hud-progress-pill" title="Fog Cleared Progress">
              <span>Fog Cleared:</span>
              <strong>{progressPercentage}%</strong>
              <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({completedCount}/{totalLevels})</span>
            </div>

            {/* Sound Toggle Button */}
            <button
              type="button"
              className="hud-btn-icon"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute City Audio' : 'Unmute City Audio'}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Field Handbook Button */}
            <button
              type="button"
              className="hud-btn-icon"
              onClick={() => setShowHelp(true)}
              title="Field Instructions"
              aria-label="View exploration handbook"
            >
              <HelpCircle size={18} />
            </button>

            {/* Restart Expedition Option */}
            <button
              type="button"
              className="hud-btn-icon"
              onClick={() => {
                if (window.confirm('Restart Delhi Chapter and reset all cleared fog?')) {
                  resetProgress();
                }
              }}
              title="Restart Chapter"
              aria-label="Restart chapter progress"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Floating Objective Bar */}
        <div className="hud-mission-bar">
          <Flame size={18} color="var(--accent-amber)" />
          <span>
            <strong>Current Objective: </strong>
            {activeObjective}
          </span>
        </div>
      </div>

      {/* Field Instructions Modal */}
      {showHelp && (
        <div 
          className="hud-help-modal" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelp(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="hud-help-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Compass size={22} color="var(--accent-amber)" />
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.35rem' }}>
                  The Fogged City Handbook
                </h3>
              </div>
              <button 
                type="button" 
                className="hud-btn-icon" 
                onClick={() => setShowHelp(false)}
                aria-label="Close handbook"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <p>
                <strong>1. Living Miniature City:</strong> Click and drag anywhere to pan around the city. Use your mouse scroll wheel or bottom-right buttons to zoom in and out. Watch for moving Delhi Metro trains, flowing Yamuna waters, and busy traffic!
              </p>
              <p>
                <strong>2. Level 01 — Protest Zone:</strong> Look for the active crowd waving banners illuminated by the golden guide beam. Click on Protest Zone to start the missing slogan challenge!
              </p>
              <p>
                <strong>3. Funny Contemporary Riddles:</strong> Each level features clever riddles inspired by modern Indian city life. Solving each mystery clears a patch of fog, awards +250 PTS, and unlocks the next neighborhood.
              </p>
            </div>

            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => setShowHelp(false)}
            >
              <span>Back to Exploration</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
