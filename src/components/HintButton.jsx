// src/components/HintButton.jsx
import React, { useState } from 'react';

/**
 * Supporting Component: HintButton
 * Instant Interactive Hint System:
 * Renders 3 dedicated buttons for Hint 1, Hint 2, and Hint 3.
 * Tapping any hint button unlocks and displays that hint text immediately!
 */
export default function HintButton({ zoneData, score, onHintUsed }) {
  const [revealedHints, setRevealedHints] = useState({
    hint1: false,
    hint2: false,
    hint3: false
  });

  const toggleHint = (hintNum, cost) => {
    setRevealedHints((prev) => {
      const isAlreadyRevealed = prev[`hint${hintNum}`];
      if (!isAlreadyRevealed && onHintUsed) {
        onHintUsed(cost);
      }
      return {
        ...prev,
        [`hint${hintNum}`]: true
      };
    });
  };

  return (
    <div className="hint-container glass-card">
      <div className="hint-header">
        <div className="hint-title-group">
          <span className="hint-icon">💡</span>
          <h3>HINT SYSTEM</h3>
        </div>
        <span className="hint-score-tag">Current Score: {score || 0} pts</span>
      </div>

      <div className="hint-buttons-row">
        <button
          type="button"
          className={`hint-btn-pill ${revealedHints.hint1 ? 'unlocked' : ''}`}
          onClick={() => toggleHint(1, 0)}
        >
          {revealedHints.hint1 ? '✓ HINT 1 (FREE)' : '💡 UNLOCK HINT 1 (FREE)'}
        </button>

        <button
          type="button"
          className={`hint-btn-pill ${revealedHints.hint2 ? 'unlocked' : ''}`}
          onClick={() => toggleHint(2, 25)}
        >
          {revealedHints.hint2 ? '✓ HINT 2 (-25 PTS)' : '💡 UNLOCK HINT 2 (-25 PTS)'}
        </button>

        <button
          type="button"
          className={`hint-btn-pill ${revealedHints.hint3 ? 'unlocked' : ''}`}
          onClick={() => toggleHint(3, 50)}
        >
          {revealedHints.hint3 ? '✓ HINT 3 (-50 PTS)' : '💡 UNLOCK HINT 3 (-50 PTS)'}
        </button>
      </div>

      <div className="hint-display-area">
        {revealedHints.hint1 && (
          <div className="hint-box hint-1">
            <span className="hint-badge free">HINT 1 (FREE)</span>
            <p>{zoneData?.hint1 || 'Look for something round, usually on a wall or tower.'}</p>
          </div>
        )}

        {revealedHints.hint2 && (
          <div className="hint-box hint-2">
            <span className="hint-badge cost">HINT 2 (-25 PTS)</span>
            <p>{zoneData?.hint2 || 'It tells you the time.'}</p>
          </div>
        )}

        {revealedHints.hint3 && (
          <div className="hint-box hint-3">
            <span className="hint-badge cost">HINT 3 (-50 PTS)</span>
            <p>{zoneData?.hint3 || 'It is a clock.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
