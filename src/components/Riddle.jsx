// src/components/Riddle.jsx
import React, { useState, useRef, useEffect } from 'react';
import HintButton from './HintButton';

/**
 * Screen 6 / Component: Riddle (Build Spec v2)
 * Features role-based conditional rendering (Seeker, Cipher, Voice perspectives),
 * flexible answer matching, instant hint reveals, auto-focus answer ref.
 */
export default function Riddle({
  zoneData,
  score,
  onZoneSolved,
  onHintUsed,
  roles
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('CIPHER');

  // Auto-focus input ref
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleHintUsedInternal = (cost) => {
    if (onHintUsed) {
      onHintUsed(cost);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Flexible cleaning: trim, lower-case, and strip punctuation (. , ! ? ' ")
    const cleanAnswer = userAnswer
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/gi, '');

    if (!cleanAnswer) {
      setFeedback({ type: 'error', text: 'Please enter an answer before submitting.' });
      return;
    }

    // Flexible answer matching: matches clean string, or checks keyword containment
    const validAnswersList = zoneData?.answers || [];
    const isCorrect = validAnswersList.some((validAns) => {
      const cleanValid = validAns.toLowerCase().replace(/[^\w\s]/gi, '');
      return (
        cleanValid === cleanAnswer ||
        cleanAnswer.includes(cleanValid) ||
        cleanValid.includes(cleanAnswer)
      );
    });

    if (isCorrect) {
      setIsSolved(true);
      setFeedback({
        type: 'success',
        text: 'THE FOG REMEMBERS. ZONE UNCOVERED!'
      });

      let bonus = 50;
      if (hintLevel === 1) bonus = 25;
      else if (hintLevel === 2) bonus = 10;
      else if (hintLevel === 3) bonus = 0;

      const totalEarned = 100 + bonus;

      setTimeout(() => {
        if (onZoneSolved) {
          onZoneSolved(zoneData.id, totalEarned);
        }
      }, 1600);
    } else {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);

      // Auto reveal hint 1 if player fails 2 times
      if (newFails >= 2 && hintLevel < 1) {
        setHintLevel(1);
        if (onHintUsed) {
          onHintUsed(0); // Free hint
        }
        setFeedback({
          type: 'error',
          text: `"${userAnswer}" is incorrect. The fog reveals a free hint to guide your team!`
        });
      } else {
        setFeedback({
          type: 'error',
          text: `"${userAnswer}" is incorrect. Read the riddle carefully and try again.`
        });
      }
    }
  };

  return (
    <div className="riddle-section glass-card">
      {/* Role Perspective Switcher Tabs */}
      <div className="role-tab-bar">
        <span className="role-tab-title">TEAM PERSPECTIVES:</span>
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'SEEKER' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('SEEKER')}
          >
            🔍 SEEKER VIEW
          </button>
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'CIPHER' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('CIPHER')}
          >
            🗝️ CIPHER RIDDLE
          </button>
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'VOICE' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('VOICE')}
          >
            🗣️ VOICE LORE
          </button>
        </div>
      </div>

      {/* Role Perspective Content Box */}
      <div className="riddle-box role-perspective-box">
        {activeRoleTab === 'SEEKER' && (
          <div className="perspective-content seeker-perspective">
            <span className="perspective-badge">🔍 SEEKER PERSPECTIVE (VISUAL CLUE)</span>
            <p className="riddle-text">"{zoneData?.seekerClue || zoneData?.fact}"</p>
          </div>
        )}

        {activeRoleTab === 'CIPHER' && (
          <div className="perspective-content cipher-perspective">
            <span className="perspective-badge">🗝️ CIPHER PERSPECTIVE (ENCODED RIDDLE)</span>
            <p className="riddle-text">"{zoneData?.riddle}"</p>
          </div>
        )}

        {activeRoleTab === 'VOICE' && (
          <div className="perspective-content voice-perspective">
            <span className="perspective-badge">🗣️ VOICE PERSPECTIVE (FOG MEMORY)</span>
            <p className="riddle-text">"{zoneData?.voiceClue || zoneData?.fact}"</p>
          </div>
        )}
      </div>

      {feedback.text && (
        <div className={`alert-box ${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      {!isSolved ? (
        <form onSubmit={handleSubmit} className="riddle-form">
          <div className="form-group">
            <label htmlFor="riddleAnswer" className="form-label">ENTER YOUR ANSWER</label>
            <input
              id="riddleAnswer"
              ref={inputRef}
              type="text"
              className="form-input riddle-input"
              placeholder="Type your team answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary submit-ans-btn">
              SUBMIT ANSWER
            </button>
          </div>
        </form>
      ) : (
        <div className="success-banner">
          <h3>✨ ZONE {zoneData?.id} UNCOVERED!</h3>
          <p>Transitioning to city map...</p>
        </div>
      )}

      <HintButton
        zoneData={zoneData}
        score={score}
        onHintUsed={handleHintUsedInternal}
        currentHintLevel={hintLevel}
      />
    </div>
  );
}
