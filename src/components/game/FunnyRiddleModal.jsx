import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/locationModal.css';

export default function FunnyRiddleModal({ level, onClose }) {
  const { isLevelCompleted, completeLevel } = useGame();
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [funnyFeedback, setFunnyFeedback] = useState(null);
  const [hasJustSolved, setHasJustSolved] = useState(false);

  if (!level) return null;

  const isAlreadySolved = isLevelCompleted(level.id);
  const isSolved = isAlreadySolved || hasJustSolved;
  const scene = level.sceneData;

  const handleSelectOption = (opt) => {
    if (isSolved) return;
    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      setFunnyFeedback(null);
      setHasJustSolved(true);
      completeLevel(level.id, level.pointsReward);
    } else {
      setFunnyFeedback(opt.feedback || 'That doesn’t seem quite right, give it another spin!');
      audioSystem.playError();
    }
  };

  return (
    <div 
      className="location-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="funny-riddle-title"
    >
      <div 
        className="location-modal-card"
        style={{ '--modal-accent-glow': level.accentGlow }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: level.color,
              background: `${level.color}20`,
              border: `1px solid ${level.color}50`,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)'
            }}>
              LEVEL 0{level.levelNumber}
            </span>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
              {level.theme}
            </span>
          </div>

          <button 
            type="button" 
            className="hud-btn-icon" 
            onClick={onClose}
            aria-label="Close Level"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          <div>
            <h2 id="funny-riddle-title" className="modal-title">{level.name}</h2>
            <div className="modal-tagline">{level.subtitle}</div>
          </div>

          {/* Dialogue Box */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderLeft: `4px solid ${level.color}`,
            borderRadius: '0 12px 12px 0',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: level.color, fontSize: '0.85rem', fontWeight: 700 }}>
              <MessageCircle size={16} />
              <span>THE ENCOUNTER</span>
            </div>
            <p style={{ color: '#f8fafc', fontSize: '0.96rem', fontStyle: 'italic', margin: 0, lineHeight: '1.6' }}>
              {scene.dialogue}
            </p>
          </div>

          {/* Challenge Section */}
          <div className="riddle-challenge-card">
            <div className="riddle-header" style={{ color: level.color }}>
              <HelpCircle size={16} />
              <span>Solve the Riddle</span>
            </div>

            {funnyFeedback && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#fecaca',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{funnyFeedback}</span>
              </div>
            )}

            {!isSolved ? (
              <div className="options-grid">
                {scene.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="option-btn"
                    onClick={() => handleSelectOption(opt)}
                  >
                    <span>{opt.text}</span>
                    <ArrowRight size={16} style={{ opacity: 0.6 }} />
                  </button>
                ))}
              </div>
            ) : (
              /* Success Card */
              <div className="victory-reveal-box">
                <div className="victory-reveal-header">
                  <CheckCircle2 size={20} />
                  <span>Riddle Solved! • +{level.pointsReward} Points</span>
                </div>

                <div className="victory-fact">
                  {scene.successDialogue}
                </div>

                <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
                  {scene.unlockedLore}
                </div>

                <button 
                  type="button" 
                  className="btn-continue-explore"
                  onClick={onClose}
                >
                  <Sparkles size={18} />
                  <span>Return to Delhi Map</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
