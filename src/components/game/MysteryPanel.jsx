import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  BookOpen,
  X as XMark
} from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import RoleTools from './RoleTools';
import { SCORING_SUMMARY } from '../../data/scoring';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/mysteryPanel.css';
import '../../styles/teamGame.css';

export default function MysteryPanel({ level, onClose }) {
  const { isLevelCompleted, completeLevel, team, recordHint } = useGame();
  const [showHint, setShowHint] = useState(false);
  const [ruledOut, setRuledOut] = useState([]); // Cipher's private notes; never affects the answer
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [wrongExplanation, setWrongExplanation] = useState(null);
  const [hasJustSolved, setHasJustSolved] = useState(false);

  if (!level) return null;

  const isAlreadySolved = isLevelCompleted(level.id);
  const isSolved = isAlreadySolved || hasJustSolved;
  const riddle = level.riddle;
  const hasCipher = !!team?.members?.some((m) => m.role === 'cipher');

  const toggleHint = () => {
    if (!showHint) recordHint(level.id);
    setShowHint(prev => !prev);
  };

  const toggleRuledOut = (id) =>
    setRuledOut(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]));

  const handleSelectOption = (opt) => {
    if (isSolved) return;
    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      setWrongExplanation(null);
      setHasJustSolved(true);
      completeLevel(level.id, level.pointsReward);
    } else {
      setWrongExplanation(opt.explanation || 'Incorrect deduction. Re-examine the clue and try again.');
      audioSystem.playError();
    }
  };

  return (
    <div className="mystery-panel-container" role="dialog" aria-modal="true" aria-labelledby="mystery-title">
      <div 
        className="mystery-panel-card"
        style={{ '--panel-glow': level.accentGlow }}
      >
        {/* Header Bar */}
        <div className="mystery-header-bar">
          <div 
            className="mystery-level-pill"
            style={{ 
              background: `${level.accentColor}20`, 
              color: level.accentColor,
              border: `1px solid ${level.accentColor}50`
            }}
          >
            <span>LEVEL 0{level.levelNumber}</span>
            <span>•</span>
            <span>{isSolved ? 'DISCOVERED' : 'UNSOLVED MYSTERY'}</span>
          </div>

          <button 
            type="button" 
            className="mystery-close-btn" 
            onClick={onClose}
            aria-label="Close mystery panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="mystery-panel-body">
          {/* Title & District */}
          <div className="mystery-title-block">
            <div className="mystery-district-tag">{level.district}</div>
            <h2 id="mystery-title">{level.name}</h2>
            <div style={{ color: '#94a3b8', fontSize: '0.92rem', fontWeight: 500 }}>
              {level.subtitle}
            </div>
          </div>

          {/* Historical Narrative Card */}
          <div className="mystery-narrative-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber-light)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <BookOpen size={14} />
              <span>EXPEDITION BRIEF</span>
            </div>
            {level.narrative}
          </div>

          {/* Riddle Section */}
          <div className="riddle-box">
            <div className="riddle-header-row">
              <span className="riddle-label">
                <HelpCircle size={15} />
                <span>{riddle.title}</span>
              </span>

              {!isSolved && (
                <button 
                  type="button" 
                  className="btn-hint-toggle"
                  onClick={toggleHint}
                  aria-expanded={showHint}
                  aria-controls="riddle-hint"
                >
                  <Lightbulb size={13} />
                  <span>{showHint ? 'Hide Hint' : 'Request Hint'}</span>
                </button>
              )}
            </div>

            {/* Revealed Hint */}
            {showHint && !isSolved && (
              <div className="hint-revealed-box" id="riddle-hint">
                <strong>Clue Hint: </strong>
                {riddle.hint}
              </div>
            )}

            {!isSolved && (
              <div className="riddle-worth">Worth +{level.pointsReward} pts · {SCORING_SUMMARY}</div>
            )}

            {/* Riddle Question Text */}
            <div className="riddle-question-text">
              "{riddle.question}"
            </div>

            {/* Incorrect Answer Feedback */}
            {wrongExplanation && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#fecaca',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{wrongExplanation}</span>
              </div>
            )}

            {/* Answer Choices */}
            {!isSolved ? (
              <div className="riddle-options-list">
                {riddle.options.map((opt) => {
                  const isThisSelected = selectedOptionId === opt.id;
                  const isWrong = isThisSelected && wrongExplanation;
                  const isRuledOut = ruledOut.includes(opt.id);

                  return (
                    <div key={opt.id} className={`option-row${isRuledOut ? ' is-ruled-out' : ''}`}>
                      <button
                        type="button"
                        className={`riddle-option-button ${isWrong ? 'wrong-shake' : ''}`}
                        onClick={() => handleSelectOption(opt)}
                      >
                        <span>{opt.text}</span>
                        <ArrowRight size={15} style={{ opacity: 0.5 }} />
                      </button>
                      {hasCipher && (
                        <button
                          type="button"
                          className="rule-out-btn"
                          onClick={() => toggleRuledOut(opt.id)}
                          aria-pressed={isRuledOut}
                          aria-label={`${isRuledOut ? 'Restore' : 'Rule out'} option: ${opt.text}`}
                          title={isRuledOut ? 'Restore option (note only)' : 'Rule out (note only)'}
                        >
                          <XMark size={14} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Discovery Celebration Card */
              <div className="discovery-success-card">
                <div className="discovery-title-row">
                  <CheckCircle2 size={20} />
                  <span>MYSTERY UNCOVERED • +{level.pointsReward} PTS</span>
                </div>

                <div className="discovery-fact-box">
                  <p style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>
                    {riddle.discoveryLore}
                  </p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    <strong>Historical Insight: </strong>
                    {riddle.historicalFact}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-proceed-map"
                  onClick={onClose}
                >
                  <Sparkles size={16} />
                  <span>CONTINUE EXPEDITION</span>
                </button>
              </div>
            )}
          </div>

          {/* Role tools for the assigned team members (collapsed by default, never reveal the answer) */}
          <RoleTools
            team={team}
            level={level}
            ruledOutCount={ruledOut.length}
            onClearRuledOut={() => setRuledOut([])}
          />
        </div>
      </div>
    </div>
  );
}
