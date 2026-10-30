import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ListOrdered } from 'lucide-react';
import { useGame } from '../../hooks/useGame';

/** Shown when every level is solved. The score is already saved to the on-device leaderboard by GameContext. */
export default function FinaleModal({ onClose }) {
  const { team, score, hintsUsedCount, totalLevels } = useGame();
  const navigate = useNavigate();
  return (
    <div className="finale-backdrop" role="dialog" aria-modal="true" aria-labelledby="finale-title">
      <div className="finale-card">
        <Trophy size={34} aria-hidden="true" color="var(--accent-amber)" />
        <h2 id="finale-title">The fog has lifted</h2>
        <p className="finale-team">{team?.name || 'Your team'} solved all {totalLevels} mysteries of Delhi.</p>
        <div className="finale-score" aria-label={`Final score ${score} points`}>{score}<small> pts</small></div>
        <p className="finale-meta">Hints opened: {hintsUsedCount} (hints never cost points)</p>
        <p className="finale-meta">Your score was saved to the leaderboard on this device.</p>
        <div className="finale-actions">
          <button type="button" className="btn-primary" onClick={() => navigate('/leaderboard')}>
            <ListOrdered size={16} aria-hidden="true" /><span>View leaderboard</span>
          </button>
          <button type="button" className="btn-ghost" onClick={onClose}>Back to the map</button>
        </div>
      </div>
    </div>
  );
}
