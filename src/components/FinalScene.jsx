// src/components/FinalScene.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from './Leaderboard';

/**
 * Screen 9: Final Scene (Build Spec v2)
 * Complete performance breakdown for the investigative team across all 5 zones,
 * including total completion time, global rank card, and access to the Hall of Seekers leaderboard.
 */
export default function FinalScene({
  teamName,
  players,
  roles,
  score,
  cluesCollected,
  hintsUsed,
  formattedTime,
  onResetGame
}) {
  const navigate = useNavigate();
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  const handlePlayAgain = () => {
    onResetGame();
    navigate('/setup');
  };

  return (
    <div className="screen final-screen">
      <div className="card glass-card final-card">
        <span className="victory-badge">🏆 ALL 5 ZONES UNCOVERED</span>
        <h1 className="screen-title">THE CITY IS YOURS TO SEE.</h1>
        <p className="screen-desc">
          The supernatural fog has lifted completely across all five districts of the city.
        </p>

        {/* Global Rank & Stats Grid (Spec v2) */}
        <div className="rank-summary-card glass-card">
          <span className="rank-tag">YOUR RANKING</span>
          <h2 className="rank-score">GLOBAL RANK: #1 🥇</h2>
          <p className="rank-subtext">Score: {score} PTS | Time: {formattedTime || '00:00'}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card-label">INVESTIGATIVE TEAM</span>
            <span className="stat-card-value text-accent">{teamName || 'Fog Walkers'}</span>
          </div>

          <div className="stat-card">
            <span className="stat-card-label">TOTAL SCORE</span>
            <span className="stat-card-value highlight-score">{score} PTS</span>
          </div>

          <div className="stat-card">
            <span className="stat-card-label">COMPLETION TIME</span>
            <span className="stat-card-value text-cyan">{formattedTime || '00:00'}</span>
          </div>

          <div className="stat-card">
            <span className="stat-card-label">CLUES COLLECTED</span>
            <span className="stat-card-value">{cluesCollected || 5} / 5</span>
          </div>
        </div>

        {roles && roles.length > 0 && (
          <div className="team-roster-summary">
            <h3>ROSTER & ROLES</h3>
            <div className="roster-pills">
              {roles.map((r, i) => (
                <div key={i} className="roster-pill">
                  <span className="roster-name">{r.name}</span>
                  <span className="roster-role">{r.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="final-actions">
          <button className="btn-primary" onClick={() => setShowLeaderboardModal(true)}>
            🏆 VIEW HALL OF SEEKERS LEADERBOARD
          </button>
          
          <button className="btn-secondary play-again-btn" onClick={handlePlayAgain}>
            ↺ START NEW GAME (RESET)
          </button>

          <button className="btn-secondary" onClick={() => navigate('/map')}>
            🗺️ VIEW UNCOVERED MAP
          </button>
        </div>
      </div>

      {showLeaderboardModal && (
        <Leaderboard
          onClose={() => setShowLeaderboardModal(false)}
          currentTeamName={teamName}
          currentScore={score}
        />
      )}
    </div>
  );
}
