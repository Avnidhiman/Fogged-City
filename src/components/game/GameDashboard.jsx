import React, { useState } from 'react';
import { 
  CloudFog, 
  Award, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw, 
  Compass, 
  Target, 
  X,
  Users,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { SCORING_RULES } from '../../data/scoring';
import '../../styles/dashboard.css';
import '../../styles/teamGame.css';

export default function GameDashboard() {
  const { 
    score, 
    completedCount, 
    totalLevels, 
    progressPercentage, 
    activeObjective, 
    soundEnabled, 
    toggleSound, 
    resetProgress,
    team
  } = useGame();
  const navigate = useNavigate();

  const [showHandbook, setShowHandbook] = useState(false);

  return (
    <>
      <aside className="pro-dashboard-layer" role="toolbar" aria-label="Game Dashboard">
        {/* Top Navigation Row */}
        <header className="pro-dashboard-top">
          <div className="pro-brand-cluster">
            <CloudFog size={20} color="var(--accent-amber)" />
            <span className="pro-brand-title">THE FOGGED CITY</span>
            <span className="pro-chapter-pill">Chapter 01 — Delhi</span>
          </div>

          <div className="pro-metrics-cluster">
            {/* Score Metric */}
            <div className="pro-metric-pill pro-score-pill" title="Total Exploration Score">
              <Award size={15} color="var(--accent-amber)" />
              <span>Score:</span>
              <strong>{score}</strong>
            </div>

            {/* Team */}
            {team && (
              <div className="pro-metric-pill pro-team-pill" title={`Team: ${team.name}`}>
                <Users size={15} color="var(--accent-cyan-light)" aria-hidden="true" />
                <strong>{team.name}</strong>
              </div>
            )}

            {/* Fog Cleared Progress */}
            <div className="pro-metric-pill pro-progress-pill" title="Fog-of-War Clearance">
              <span>Fog Pierced:</span>
              <strong>{progressPercentage}%</strong>
              <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({completedCount}/{totalLevels})</span>
            </div>

            {/* Team & Leaderboard */}
            <button type="button" className="pro-btn-icon" onClick={() => navigate('/team', { state: { from: '/delhi' } })} title="Edit team" aria-label="Edit team and roles">
              <Users size={16} />
            </button>
            <button type="button" className="pro-btn-icon" onClick={() => navigate('/leaderboard')} title="Leaderboard" aria-label="View leaderboard">
              <Trophy size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              className="pro-btn-icon"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Atmosphere Audio' : 'Unmute Atmosphere Audio'}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>

            {/* Handbook / Help */}
            <button
              type="button"
              className="pro-btn-icon"
              onClick={() => setShowHandbook(true)}
              title="Field Instructions"
              aria-label="View exploration handbook"
            >
              <HelpCircle size={17} />
            </button>

            {/* Restart Expedition */}
            <button
              type="button"
              className="pro-btn-icon"
              onClick={() => {
                if (window.confirm('Restart Delhi expedition and re-cloak the city in fog?')) {
                  resetProgress();
                }
              }}
              title="Restart Chapter"
              aria-label="Restart expedition"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </header>

        {/* Bottom Compact Mission Card */}
        <footer className="pro-bottom-mission-row">
          <div className="pro-mission-card">
            <span className="pro-mission-tag">ACTIVE OBJECTIVE</span>
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {activeObjective}
            </span>
          </div>
        </footer>
      </aside>

      {/* Field Handbook Modal */}
      {showHandbook && (
        <div 
          className="hud-help-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHandbook(false);
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
                onClick={() => setShowHandbook(false)}
                aria-label="Close handbook"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <p>
                <strong>1. Geographically Accurate Exploration:</strong> Explore the real street grid and landmarks of Delhi using MapLibre GL. Drag to pan, scroll to zoom, and right-click drag to pitch/rotate.
              </p>
              <p>
                <strong>2. The Fog of War:</strong> Unexplored sectors remain obscured beneath dense atmospheric mist. Clicking an active beacon guides the camera directly to that landmark and opens the mystery panel.
              </p>
              <p>
                <strong>3. Uncovering Mysteries:</strong> Solve the historical riddle to pierce the fog, reveal the real streets beneath, earn +250 PTS, and unlock the next landmark along the expedition path.
              </p>
              <div>
                <strong>4. Scoring:</strong>
                <ul className="scoring-list">
                  {SCORING_RULES.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
              <p>
                <strong>5. Team toolkit:</strong> Each riddle has a collapsed “Team toolkit” with tips for your Cipher, Seeker and Voice Lore members. The leaderboard is stored on this device only.
              </p>
            </div>

            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => setShowHandbook(false)}
            >
              <span>Back to Expedition</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
