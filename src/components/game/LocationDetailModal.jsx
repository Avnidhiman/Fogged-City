import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Sparkles, HelpCircle, Award } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/locationModal.css';

export default function LocationDetailModal({ location, onClose }) {
  const { isLocationCompleted, completeLocation } = useGame();
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isWrong, setIsWrong] = useState(false);
  const [hasJustSolved, setHasJustSolved] = useState(false);

  if (!location) return null;

  const isAlreadySolved = isLocationCompleted(location.id);
  const isSolved = isAlreadySolved || hasJustSolved;

  const handleSelectOption = (option) => {
    if (isSolved) return;
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      setIsWrong(false);
      setHasJustSolved(true);
      completeLocation(location.id, location.pointsReward);
    } else {
      setIsWrong(true);
      audioSystem.playError();
      setTimeout(() => {
        setIsWrong(false);
      }, 600);
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
      aria-labelledby="modal-loc-title"
    >
      <div 
        className="location-modal-card"
        style={{ '--modal-accent-glow': location.accentGlow }}
      >
        {/* Visual Hero Header */}
        <div className="modal-visual-hero">
          <img 
            src={location.visualIllustration} 
            alt={location.name} 
            className="modal-hero-image"
          />
          <div className="modal-hero-overlay" />

          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close location detail"
          >
            <X size={20} />
          </button>

          <div className="modal-badge-row">
            <span 
              className="modal-category-tag"
              style={{ color: location.color, borderColor: `${location.color}60` }}
            >
              {location.subCategory}
            </span>

            <span className="modal-points-badge">
              +{location.pointsReward} PTS
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="modal-body">
          <div>
            <h2 id="modal-loc-title" className="modal-title">{location.name}</h2>
            <div className="modal-tagline">{location.tagline}</div>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {location.description}
          </p>

          <div className="modal-lore-quote">
            <strong>Field Expedition Brief: </strong>
            {location.brief}
          </div>

          {/* Interactive Challenge Section */}
          <div className="riddle-challenge-card">
            <div className="riddle-header">
              <HelpCircle size={16} />
              <span>{location.riddle.title}</span>
            </div>

            <div className="riddle-text">
              "{location.riddle.clueText}"
            </div>

            {/* Answer Options */}
            {!isSolved ? (
              <div className="options-grid">
                {location.riddle.options.map((opt) => {
                  const isThisSelected = selectedOptionId === opt.id;
                  const isThisWrong = isThisSelected && isWrong;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`option-btn ${isThisWrong ? 'selected-wrong' : ''}`}
                      onClick={() => handleSelectOption(opt)}
                      aria-label={opt.text}
                    >
                      <span>{opt.text}</span>
                      <ArrowRight size={16} style={{ opacity: 0.6 }} />
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Solved Celebration View */
              <div className="victory-reveal-box">
                <div className="victory-reveal-header">
                  <CheckCircle2 size={20} />
                  <span>Mystery Deciphered • +{location.pointsReward} Points</span>
                </div>

                <div className="victory-fact">
                  <strong>Historical Secret: </strong>
                  {location.riddle.funFact}
                </div>

                <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
                  {location.riddle.loreLore}
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
