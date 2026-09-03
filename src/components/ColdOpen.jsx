import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ColdOpen() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/setup');
  };

  return (
    <div className="screen cold-open-screen">
      <div className="cinematic-overlay"></div>

      <div className="cold-open-content">
        <p className="typewriter-line">
          THE CITY WAS NEVER EMPTY.
        </p>

        <p className="typewriter-line">
          IT WAS ONLY HIDDEN.
        </p>

        <p className="typewriter-line">
          THE FOG IS LIFTING.
        </p>

        <h1 className="title-glitch">
          THE FOGGED CITY
        </h1>

        <button
          className="tap-to-begin-btn"
          onClick={handleStart}
        >
          TAP TO BEGIN
        </button>
      </div>
    </div>
  );
}