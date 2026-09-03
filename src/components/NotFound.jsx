// src/components/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Screen 10: Themed 404 Page (NotFound)
 * Displays atmospheric message when navigating to non-existent or locked routes.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="screen not-found-screen">
      <div className="card glass-card not-found-card">
        <span className="error-code">404</span>
        <h1 className="screen-title">THE FOG HAS SWALLOWED THIS PATH.</h1>
        <p className="screen-desc">
          You haven't uncovered this part of the city yet, or the route has faded into the mist.
        </p>

        <button className="btn-primary" onClick={() => navigate('/map')}>
          🗺️ RETURN TO THE MAP
        </button>
      </div>
    </div>
  );
}
