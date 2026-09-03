// src/components/ZoneArrival.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zones } from '../data/zones';
import NotFound from './NotFound';

/**
 * Screen 5A: Zone Arrival (/zone/:id)
 * Clean, static arrival confirmation screen. Player taps "I'VE ARRIVED AT LOCATION →" to navigate to the next page (/zone/:id/riddle).
 */
export default function ZoneArrival({ score, formattedTime }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const zoneId = Number(id);

  const zone = zones.find((z) => z.id === zoneId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!zone) {
    return <NotFound />;
  }

  const handleGoToRiddlePage = () => {
    navigate(`/zone/${zoneId}/riddle`);
  };

  return (
    <div className="screen zone-screen">
      {/* Top Header Bar */}
      <header className="zone-top-bar glass-card">
        <button className="btn-secondary back-btn" onClick={() => navigate('/map')}>
          ← Return to Map
        </button>
        
        <div className="zone-header-info">
          <span className="zone-tag">ZONE {zone.id} OF 5</span>
          <h2 className="zone-header-title">{zone.title}</h2>
        </div>

        <div className="zone-stats-header">
          {formattedTime && (
            <div className="timer-badge">
              ⏱️ {formattedTime}
            </div>
          )}
          <div className="zone-score-pill">
            Score: {score} pts
          </div>
        </div>
      </header>

      {/* Main Arrival Card */}
      <main className="zone-content-area">
        <div className="card glass-card arrival-card">
          <div className="location-icon-container">
            <span className="location-emoji">
              {zone.id === 1 ? '🕰️' : zone.id === 2 ? '🪧' : zone.id === 3 ? '🪑' : zone.id === 4 ? '⛲' : '🏛️'}
            </span>
          </div>
          
          <span className="arrival-subtitle">LOCATION DISCOVERED</span>
          <h1 className="arrival-title">{zone.location}</h1>
          <p className="arrival-fact">{zone.fact}</p>
          
          <div className="arrival-instruction-box">
            <p>📍 Confirm your team has arrived at {zone.location} to open the mystery riddle page.</p>
          </div>

          <button
            type="button"
            className="btn-primary arrived-btn"
            onClick={handleGoToRiddlePage}
            aria-label="Confirm arrival and navigate to riddle page"
          >
            I'VE ARRIVED AT LOCATION →
          </button>
        </div>
      </main>
    </div>
  );
}
