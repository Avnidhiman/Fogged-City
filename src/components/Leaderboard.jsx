// src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';

/**
 * Leaderboard Component ("Hall of Seekers")
 * Displays city high scores stored locally in localStorage ('fogged_city_leaderboard').
 * Fully syllabus-compliant (State + Props + localStorage). Zero backend/Firebase needed for student fallback!
 */
export default function Leaderboard({ onClose, currentTeamName, currentScore }) {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fogged_city_leaderboard');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort teams by highest score first, then lowest time
        parsed.sort((a, b) => b.score - a.score || a.timeInSeconds - b.timeInSeconds);
        setLeaderboardData(parsed);
      }
    } catch (e) {
      console.warn('Error reading leaderboard from localStorage', e);
    }
  }, []);

  // Keyboard Escape Key Handler for Accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear the local Hall of Seekers records?')) {
      localStorage.removeItem('fogged_city_leaderboard');
      setLeaderboardData([]);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('leaderboard-modal-overlay') && onClose) {
      onClose();
    }
  };

  return (
    <div className="leaderboard-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <div className="card glass-card leaderboard-card">
        <div className="leaderboard-header">
          <div>
            <span className="screen-subtitle">HALL OF SEEKERS</span>
            <h2 id="leaderboard-title" className="screen-title">GLOBAL LEADERBOARD</h2>
          </div>
          {onClose && (
            <button className="btn-remove close-modal-btn" onClick={onClose} title="Close Leaderboard" aria-label="Close Leaderboard">
              ✕
            </button>
          )}
        </div>

        <p className="screen-desc">
          Top investigative units that uncovered all 5 zones of the fogged city.
        </p>

        {leaderboardData.length === 0 ? (
          <div className="empty-leaderboard">
            <span className="empty-icon">📜</span>
            <p>No recorded investigations yet. Complete all 5 zones to enter the Hall of Seekers!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>TEAM NAME</th>
                  <th>SCORE</th>
                  <th>TIME</th>
                  <th>CLUES</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, idx) => {
                  const isCurrentTeam =
                    currentTeamName &&
                    entry.teamName.toLowerCase() === currentTeamName.toLowerCase() &&
                    entry.score === currentScore;

                  return (
                    <tr
                      key={idx}
                      className={`${isCurrentTeam ? 'current-team-row' : ''} ${
                        idx === 0 ? 'top-rank-1' : idx === 1 ? 'top-rank-2' : idx === 2 ? 'top-rank-3' : ''
                      }`}
                    >
                      <td className="rank-cell">
                        {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                      </td>
                      <td className="team-cell">
                        <strong>{entry.teamName}</strong>
                        {isCurrentTeam && <span className="you-badge">YOU</span>}
                      </td>
                      <td className="score-cell">{entry.score} PTS</td>
                      <td className="time-cell">{formatTime(entry.timeInSeconds)}</td>
                      <td className="clues-cell">{entry.cluesCollected || 5}/5</td>
                      <td className="date-cell">{entry.completedAt || 'Recent'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="leaderboard-actions">
          {leaderboardData.length > 0 && (
            <button className="btn-reset-sm" onClick={handleClearLeaderboard}>
              🗑️ Clear Records
            </button>
          )}
          {onClose && (
            <button className="btn-primary" onClick={onClose}>
              Back to Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
