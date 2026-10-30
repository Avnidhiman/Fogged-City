import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/protestScene.css';

export default function ProtestZoneScene({ onClose }) {
  const { isLevelCompleted, completeLevel } = useGame();
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [funnyFeedback, setFunnyFeedback] = useState(null);
  const [hasJustSolved, setHasJustSolved] = useState(false);

  const isAlreadySolved = isLevelCompleted('protest-zone');
  const isSolved = isAlreadySolved || hasJustSolved;

  const options = [
    { 
      id: 'opt-1', 
      letter: 'A', 
      text: 'Inn mardo ka kya bharosa', 
      isCorrect: true 
    },
    { 
      id: 'opt-2', 
      letter: 'B', 
      text: 'Bhaiya, extra dena samosa', 
      isCorrect: false, 
      feedback: 'A vendor chuckles: "Arre bhaiya, pehle slogan lagao, samosa counter protest ke baad khulega!"' 
    },
    { 
      id: 'opt-3', 
      letter: 'C', 
      text: 'Kachodi mein nikla aloo thoda sa', 
      isCorrect: false, 
      feedback: 'A student activist protests: "Halwai ke khilaaf dharne par nahi baithe hum log!"' 
    },
    { 
      id: 'opt-4', 
      letter: 'D', 
      text: 'Yeh protest hai ya nashta corner?', 
      isCorrect: false, 
      feedback: 'The crowd laughs: "Dono hai bhai, par pehle rhyme toh sahi baithao!"' 
    }
  ];

  const handleSelectOption = (opt) => {
    if (isSolved) return;
    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      setFunnyFeedback(null);
      setHasJustSolved(true);
      completeLevel('protest-zone', 250);
    } else {
      setFunnyFeedback(opt.feedback);
      audioSystem.playError();
    }
  };

  return (
    <div 
      className="protest-scene-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="protest-title"
    >
      <div className="protest-scene-container">
        {/* Header */}
        <div className="protest-scene-header">
          <div>
            <div className="protest-badge-cluster">
              <span className="protest-lvl-badge">LEVEL 01</span>
              <span style={{ color: 'var(--accent-amber-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                DELHI CHAPTER
              </span>
            </div>
            <h2 id="protest-title" className="protest-scene-title">Protest Square: The Missing Slogan</h2>
          </div>

          <button 
            type="button" 
            className="hud-btn-icon" 
            onClick={onClose}
            aria-label="Close Protest Zone"
          >
            <X size={18} />
          </button>
        </div>

        {/* Animated Protest Stage Area */}
        <div className="protest-interactive-stage">
          {/* Incomplete Slogan Banner */}
          <div className="slogan-hero-banner">
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#78350f', marginBottom: '0.4rem' }}>
              OFFICIAL RALLY PLACARD
            </div>
            <h3 className="slogan-banner-text">
              "2 kachodi, ek samosa...
              <span className="missing-slot-tag">
                {isSolved ? 'inn mardo ka kya bharosa!' : '[ COMPLETE THE SLOGAN ]'}
              </span>"
            </h3>
          </div>

          {/* Animated Crowd Figures holding miniature placards */}
          <div className="crowd-spectators-row">
            <div className="mini-crowd-figure">
              <div className="protest-mini-placard placard-red">JUSTICE</div>
              <div className="protest-placard-stick" />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#38bdf8' }} />
            </div>

            <div className="mini-crowd-figure">
              <div className="protest-mini-placard placard-amber">KACHODI?</div>
              <div className="protest-placard-stick" />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f43f5e' }} />
            </div>

            <div className="mini-crowd-figure">
              <div className="protest-mini-placard placard-cyan">AZAADI</div>
              <div className="protest-placard-stick" />
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fbbf24' }} />
            </div>

            <div className="mini-crowd-figure">
              <div className="protest-mini-placard placard-red">SAMOSA!</div>
              <div className="protest-placard-stick" />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#a855f7' }} />
            </div>

            <div className="mini-crowd-figure">
              <div className="protest-mini-placard placard-amber">RHYME!</div>
              <div className="protest-placard-stick" />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981' }} />
            </div>
          </div>
        </div>

        {/* Interactive Options Section */}
        <div className="protest-placard-options-section">
          {!isSolved ? (
            <>
              <div className="protest-prompt-title">
                <HelpCircle size={18} color="var(--accent-amber)" />
                <span>Select the authentic, legendary Delhi protest rhyme:</span>
              </div>

              {funnyFeedback && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#fecaca',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{funnyFeedback}</span>
                </div>
              )}

              <div className="placard-options-grid">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="placard-choice-btn"
                    onClick={() => handleSelectOption(opt)}
                  >
                    <span className="choice-letter">{opt.letter}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Solved Celebration View */
            <div className="protest-celebration-card">
              <div className="celebration-title-row">
                <CheckCircle2 size={24} color="#34d399" />
                <span>SLOGAN RESTORED! • +250 EXPEDITION POINTS</span>
              </div>

              <p style={{ color: '#f8fafc', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                The crowd roars in synchronized celebration! Banners and flags wave frantically as the full couplet reverberates across the square.
              </p>

              <div style={{ color: '#cbd5e1', fontSize: '0.92rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                <strong>Fog Clearing: </strong>
                The heavy morning smog dissipates from Protest Square and rolls back towards the central district. 
                <strong style={{ color: 'var(--accent-amber-light)' }}> LEVEL 02: JANTAR MANTAR IS NOW UNLOCKED!</strong>
              </div>

              <button 
                type="button" 
                className="btn-proceed-exploration"
                onClick={onClose}
              >
                <Sparkles size={20} />
                <span>RETURN TO MAP (EXPLORE LEVEL 02)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
