import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudFog, Volume2, VolumeX, RotateCcw, Award, Compass } from 'lucide-react';
import { useGame } from '../../hooks/useGame';

export default function Header() {
  const { score, completedCount, totalZones, soundEnabled, toggleSound, resetProgress } = useGame();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="game-header" role="banner">
      <div className="header-inner">
        <Link to="/" className="brand-link" aria-label="Fogged City Home">
          <CloudFog className="text-amber" size={26} color="var(--accent-amber)" />
          <span>Fogged City</span>
          <span className="brand-badge">Delhi Chapter</span>
        </Link>

        <div className="header-stats">
          {!isHome && (
            <>
              <Link to="/delhi" className="stat-pill" aria-label="Delhi Map Overview">
                <Compass size={15} color="var(--accent-cyan)" />
                <span>Delhi Map</span>
              </Link>

              <div className="stat-pill" title={`${completedCount} of ${totalZones} zones unlocked & cleared`}>
                <span>Cleared:</span>
                <strong>{completedCount}/{totalZones}</strong>
              </div>
            </>
          )}

          <div className="stat-pill score-pill" title="Current Score">
            <Award size={16} color="var(--accent-amber)" />
            <span>Score:</span>
            <strong>{score}</strong>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => {
              if (window.confirm('Reset all exploration progress and scores?')) {
                resetProgress();
              }
            }}
            aria-label="Reset game progress"
            title="Reset Game"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
