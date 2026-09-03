// src/components/ZoneCard.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zones } from '../data/zones';
import Riddle from './Riddle';
import NotFound from './NotFound';

/**
 * Screen 5 & Dynamic Route Container: ZoneCard (/zone/:id)
 * Dynamic route using useParams() for all 5 zones.
 * Displays Mystery District Header & Riddle Solver immediately without spoiling answer titles.
 */
export default function ZoneCard({
  score,
  roles,
  currentZoneIndex,
  onZoneComplete,
  onHintUsed,
  formattedTime
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const zoneId = Number(id);

  // Find exact zone matching the route parameter
  const zone = zones.find((z) => z.id === zoneId);

  // Scroll to top when opening a zone
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // If invalid zone ID, render themed 404
  if (!zone) {
    return <NotFound />;
  }

  const handleSolved = (zId, pointsEarned) => {
    onZoneComplete(zId, pointsEarned);

    if (zId === 5) {
      // Zone 5 completed -> Proceed to story reveal scene (Scene 8)
      navigate('/reveal');
    } else {
      // Navigate back to map so user sees cleared fog & unlocked next zone
      navigate('/map');
    }
  };

  return (
    <div className="screen zone-screen">
      {/* Zone Header Navigation Bar */}
      <header className="zone-top-bar glass-card">
        <button className="btn-secondary back-btn" onClick={() => navigate('/map')}>
          ← Return to Map
        </button>
        
        <div className="zone-header-info">
          <span className="zone-tag">ZONE {zone.id} OF 5</span>
          <h2 className="zone-header-title">DISTRICT 0{zone.id} INVESTIGATION</h2>
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

      {/* Main Zone Content Area — Location & Riddle Solver Rendered Directly */}
      <main className="zone-content-area">
        <div className="card glass-card location-banner">
          <div className="location-icon-container">
            <span className="location-emoji">🔍</span>
          </div>
          
          <span className="arrival-subtitle">MYSTERY AREA DISCOVERED</span>
          <h1 className="arrival-title">DISTRICT 0{zone.id}</h1>
          <p className="arrival-fact">{zone.fact}</p>
        </div>

        <div className="riddle-container-card">
          <Riddle
            zoneData={zone}
            score={score}
            onZoneSolved={handleSolved}
            onHintUsed={onHintUsed}
            roles={roles}
          />
        </div>
      </main>
    </div>
  );
}
