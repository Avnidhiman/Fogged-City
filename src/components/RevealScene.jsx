// src/components/RevealScene.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Screen 8: Reveal Scene
 * Cinematic story transition displayed after completing Zone 3.
 */
export default function RevealScene() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/final');
  };

  return (
    <div className="screen reveal-screen" onClick={handleContinue}>
      <div className="cinematic-overlay reveal-bg"></div>
      <div className="fog-layer heavy-fog"></div>

      <div className="reveal-content">
        <p className="story-line story-1">YOU THOUGHT THE FOG WAS HIDING THE CITY.</p>
        <p className="story-line story-2">YOU WERE WRONG.</p>
        <p className="story-line story-3">IT WAS PROTECTING IT.</p>
        <h1 className="story-climax">FROM YOU.</h1>

        <div className="continue-prompt">
          <button className="btn-primary reveal-continue-btn" onClick={handleContinue}>
            CONTINUE TO FINAL SUMMARY →
          </button>
        </div>
      </div>
    </div>
  );
}
