// src/components/TeamSetup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Screen 2: Team Setup
 * Collects Team Name and at least 2 Player names using basic React state & JS validation.
 * Includes duplicate player name checks and clean state trimming.
 */
export default function TeamSetup({ initialTeamName, initialPlayers, onSaveTeam }) {
  const [teamName, setTeamName] = useState(initialTeamName || '');
  const [players, setPlayers] = useState(
    initialPlayers && initialPlayers.length >= 2 ? initialPlayers : ['', '']
  );
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Add new player field
  const handleAddPlayer = () => {
    setPlayers([...players, '']);
  };

  // Remove player field
  const handleRemovePlayer = (index) => {
    if (players.length <= 2) {
      setErrorMessage('A team must have at least 2 players.');
      return;
    }
    const updated = players.filter((_, idx) => idx !== index);
    setPlayers(updated);
    setErrorMessage('');
  };

  // Change individual player name
  const handlePlayerChange = (index, value) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  // Validation & Save
  const handleContinue = (e) => {
    e.preventDefault();

    // Standard JavaScript validation (No form validation libraries used)
    if (!teamName.trim()) {
      setErrorMessage('Please enter a valid team name.');
      return;
    }

    const validPlayers = players.map((p) => p.trim()).filter(Boolean);

    if (validPlayers.length < 2) {
      setErrorMessage('Please enter at least 2 player names.');
      return;
    }

    // Check for duplicate player names
    const uniqueNames = new Set(validPlayers.map((name) => name.toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      setErrorMessage('Each player must have a unique name.');
      return;
    }

    setErrorMessage('');
    onSaveTeam(teamName.trim(), validPlayers);
    navigate('/role');
  };

  return (
    <div className="screen setup-screen">
      <div className="card glass-card setup-card">
        <h2 className="screen-subtitle">STEP 01</h2>
        <h1 className="screen-title">WHO'S WITH YOU?</h1>
        <p className="screen-desc">Assemble your investigative team before entering the fog.</p>

        {errorMessage && <div className="alert-box error">{errorMessage}</div>}

        <form onSubmit={handleContinue} className="setup-form">
          <div className="form-group">
            <label htmlFor="teamName" className="form-label">TEAM NAME</label>
            <input
              id="teamName"
              type="text"
              className="form-input"
              placeholder="e.g. Fog Walkers"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">PLAYERS (MINIMUM 2)</label>
            <div className="players-list">
              {players.map((player, idx) => (
                <div key={idx} className="player-input-row">
                  <input
                    type="text"
                    className="form-input player-input"
                    placeholder={`Player ${idx + 1} Name`}
                    value={player}
                    onChange={(e) => handlePlayerChange(idx, e.target.value)}
                    aria-label={`Player ${idx + 1} Name`}
                  />
                  {players.length > 2 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemovePlayer(idx)}
                      title="Remove player"
                      aria-label={`Remove Player ${idx + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-secondary add-player-btn"
              onClick={handleAddPlayer}
            >
              + Add Player
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary continue-btn">
              Continue to Role Selection →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
