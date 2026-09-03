// src/components/ZoneRiddle.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zones } from '../data/zones';
import Riddle from './Riddle';
import NotFound from './NotFound';

/**
 * Screen 5B: Dedicated Riddle Solver Page (/zone/:id/riddle)
 * Dedicated route opened when player taps "I'VE ARRIVED AT LOCATION →".
 */
export default function ZoneRiddle({
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

  const zone = zones.find((z) => z.id === zoneId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
      {/* Top Header Navigation Bar */}
      <header className="zone-top-bar glass-card">
        <button className="btn-secondary back-btn" onClick={() => navigate(`/zone/${zoneId}`)}>
          ← Location Info
        </button>
        
        <div className="zone-header-info">
          <span className="zone-tag">ZONE {zone.id} RIDDLE</span>
          <h2 className="zone-header-title">{zone.location}</h2>
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

      {/* Main Riddle Page Container */}
      <main className="zone-content-area">
        <div className="riddle-container-card">
          <div className="arrival-confirmed-badge">
            <span>📍 ARRIVAL CONFIRMED: {zone.location.toUpperCase()}</span>
          </div>
          
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
