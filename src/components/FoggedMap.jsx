// src/components/FoggedMap.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from './Leaderboard';

/**
 * Screen 4: Fogged Map (Build Spec v2)
 * Clean map interface displaying 5 mystery level zones (ZONE 1 to ZONE 5).
 * Answer location names are hidden to prevent spoils.
 */
export default function FoggedMap({
  teamName,
  score,
  cluesCollected,
  currentZoneIndex,
  completedZones,
  onResetGame,
  formattedTime
}) {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Zone status helpers
  const getZoneStatus = (zoneId) => {
    if (completedZones && completedZones.includes(zoneId)) {
      return 'uncovered'; // Solved zone
    }
    if (zoneId <= currentZoneIndex) {
      return 'active'; // Currently accessible zone
    }
    return 'locked'; // Locked zone
  };

  const handleZoneClick = (zoneId, status) => {
    if (status === 'locked') return;
    navigate(`/zone/${zoneId}`);
  };

  const handleKeyDown = (e, zoneId, status) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleZoneClick(zoneId, status);
    }
  };

  return (
    <div className="screen map-screen">
      {/* Top Header Navigation & Status Bar */}
      <header className="map-header glass-card">
        <div className="map-title-group">
          <h1 className="city-title">THE FOGGED CITY</h1>
          <span className="team-badge">TEAM: {teamName || 'Investigative Unit'}</span>
        </div>

        <div className="map-stats-group">
          {formattedTime && (
            <div className="stat-pill timer-pill">
              <span className="stat-label">TIME:</span>
              <span className="stat-value">{formattedTime}</span>
            </div>
          )}
          <div className="stat-pill">
            <span className="stat-label">CLUES:</span>
            <span className="stat-value">{cluesCollected}/5</span>
          </div>
          <div className="stat-pill highlight">
            <span className="stat-label">SCORE:</span>
            <span className="stat-value">{score} PTS</span>
          </div>
          <button
            className="btn-secondary leaderboard-trigger-btn"
            onClick={() => setShowLeaderboard(true)}
            aria-label="View Hall of Seekers Leaderboard"
          >
            🏆 Records
          </button>
          <button className="btn-reset-sm" onClick={onResetGame} title="Reset Progress" aria-label="Reset Game Progress">
            ↺ Reset
          </button>
        </div>
      </header>

      {/* Stylized City Map Canvas */}
      <main className="map-container glass-card">
        <div className="map-background">
          {/* SVG Grid, Fictional River & Connecting Pathways for 5 Zones */}
          <svg className="city-svg-grid" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />

            {/* Fictional River */}
            <path d="M 0 180 Q 250 120 500 300 T 1000 250" fill="none" stroke="rgba(0, 200, 255, 0.15)" strokeWidth="18" />
            <path d="M 0 180 Q 250 120 500 300 T 1000 250" fill="none" stroke="rgba(0, 200, 255, 0.3)" strokeWidth="2" strokeDasharray="6 4" />

            {/* Connecting Pathway Lines Between Zones 1 -> 2 -> 3 -> 4 -> 5 */}
            <path
              d="M 180 120 L 750 130"
              fill="none"
              stroke={completedZones.includes(1) ? "rgba(0, 242, 254, 0.6)" : "rgba(255, 255, 255, 0.15)"}
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            <path
              d="M 750 130 L 450 360"
              fill="none"
              stroke={completedZones.includes(2) ? "rgba(0, 242, 254, 0.6)" : "rgba(255, 255, 255, 0.15)"}
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            <path
              d="M 450 360 L 220 300"
              fill="none"
              stroke={completedZones.includes(3) ? "rgba(0, 242, 254, 0.6)" : "rgba(255, 255, 255, 0.15)"}
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            <path
              d="M 220 300 L 800 350"
              fill="none"
              stroke={completedZones.includes(4) ? "rgba(0, 242, 254, 0.6)" : "rgba(255, 255, 255, 0.15)"}
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          </svg>

          {/* Dynamic Fog Overlay for each District */}
          <div className={`fog-overlay zone-1-fog ${completedZones.includes(1) ? 'cleared' : ''}`}></div>
          <div className={`fog-overlay zone-2-fog ${completedZones.includes(2) ? 'cleared' : ''}`}></div>
          <div className={`fog-overlay zone-3-fog ${completedZones.includes(3) ? 'cleared' : ''}`}></div>
          <div className={`fog-overlay zone-4-fog ${completedZones.includes(4) ? 'cleared' : ''}`}></div>
          <div className={`fog-overlay zone-5-fog ${completedZones.includes(5) ? 'cleared' : ''}`}></div>

          {/* Interactive Zone Markers (Zones 1 to 5) - Clean Labels Without Answer Spoilers */}
          {/* ZONE 1 */}
          {(() => {
            const status1 = getZoneStatus(1);
            return (
              <div
                className={`zone-marker marker-1 status-${status1}`}
                onClick={() => handleZoneClick(1, status1)}
                onKeyDown={(e) => handleKeyDown(e, 1, status1)}
                role="button"
                tabIndex={status1 === 'locked' ? -1 : 0}
                aria-label="Zone 1"
              >
                <div className="marker-pin">
                  <span className="marker-icon">
                    {status1 === 'uncovered' ? '✨' : status1 === 'active' ? '🔓' : '🔒'}
                  </span>
                </div>
                <div className="marker-label">
                  <span className="zone-number">ZONE 1</span>
                  {status1 === 'uncovered' && <span className="zone-status-tag">UNCOVERED</span>}
                </div>
              </div>
            );
          })()}

          {/* ZONE 2 */}
          {(() => {
            const status2 = getZoneStatus(2);
            return (
              <div
                className={`zone-marker marker-2 status-${status2}`}
                onClick={() => handleZoneClick(2, status2)}
                onKeyDown={(e) => handleKeyDown(e, 2, status2)}
                role="button"
                tabIndex={status2 === 'locked' ? -1 : 0}
                aria-label="Zone 2"
              >
                <div className="marker-pin">
                  <span className="marker-icon">
                    {status2 === 'uncovered' ? '✨' : status2 === 'active' ? '🔓' : '🔒'}
                  </span>
                </div>
                <div className="marker-label">
                  <span className="zone-number">ZONE 2</span>
                  {status2 === 'uncovered' && <span className="zone-status-tag">UNCOVERED</span>}
                </div>
              </div>
            );
          })()}

          {/* ZONE 3 */}
          {(() => {
            const status3 = getZoneStatus(3);
            return (
              <div
                className={`zone-marker marker-3 status-${status3}`}
                onClick={() => handleZoneClick(3, status3)}
                onKeyDown={(e) => handleKeyDown(e, 3, status3)}
                role="button"
                tabIndex={status3 === 'locked' ? -1 : 0}
                aria-label="Zone 3"
              >
                <div className="marker-pin">
                  <span className="marker-icon">
                    {status3 === 'uncovered' ? '✨' : status3 === 'active' ? '🔓' : '🔒'}
                  </span>
                </div>
                <div className="marker-label">
                  <span className="zone-number">ZONE 3</span>
                  {status3 === 'uncovered' && <span className="zone-status-tag">UNCOVERED</span>}
                </div>
              </div>
            );
          })()}

          {/* ZONE 4 */}
          {(() => {
            const status4 = getZoneStatus(4);
            return (
              <div
                className={`zone-marker marker-4 status-${status4}`}
                onClick={() => handleZoneClick(4, status4)}
                onKeyDown={(e) => handleKeyDown(e, 4, status4)}
                role="button"
                tabIndex={status4 === 'locked' ? -1 : 0}
                aria-label="Zone 4"
              >
                <div className="marker-pin">
                  <span className="marker-icon">
                    {status4 === 'uncovered' ? '✨' : status4 === 'active' ? '🔓' : '🔒'}
                  </span>
                </div>
                <div className="marker-label">
                  <span className="zone-number">ZONE 4</span>
                  {status4 === 'uncovered' && <span className="zone-status-tag">UNCOVERED</span>}
                </div>
              </div>
            );
          })()}

          {/* ZONE 5 */}
          {(() => {
            const status5 = getZoneStatus(5);
            return (
              <div
                className={`zone-marker marker-5 status-${status5}`}
                onClick={() => handleZoneClick(5, status5)}
                onKeyDown={(e) => handleKeyDown(e, 5, status5)}
                role="button"
                tabIndex={status5 === 'locked' ? -1 : 0}
                aria-label="Zone 5"
              >
                <div className="marker-pin">
                  <span className="marker-icon">
                    {status5 === 'uncovered' ? '✨' : status5 === 'active' ? '🔓' : '🔒'}
                  </span>
                </div>
                <div className="marker-label">
                  <span className="zone-number">ZONE 5</span>
                  {status5 === 'uncovered' && <span className="zone-status-tag">UNCOVERED</span>}
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      <footer className="map-footer">
        <p className="hint-banner">
          {cluesCollected === 5
            ? 'All 5 zones uncovered! Click "Proceed to Story Reveal" to finish.'
            : `Select an unlocked zone marker (🔓) to investigate.`}
        </p>
        {cluesCollected === 5 && (
          <button className="btn-primary pulse-btn" onClick={() => navigate('/reveal')}>
            Proceed to Story Reveal →
          </button>
        )}
      </footer>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          currentTeamName={teamName}
          currentScore={score}
        />
      )}
    </div>
  );
}
