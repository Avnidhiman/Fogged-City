// src/components/RoleSelect.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Screen 3: Role Select
 * Assigns one of 3 roles (Seeker, Cipher, Voice) to each team player.
 */
const ROLES = [
  {
    title: 'SEEKER',
    tagline: 'Find what the city wants you to see.',
    icon: '🔍'
  },
  {
    title: 'CIPHER',
    tagline: 'Decode what the city refuses to say.',
    icon: '🗝️'
  },
  {
    title: 'VOICE',
    tagline: 'Listen to what the fog remembers.',
    icon: '🗣️'
  }
];

export default function RoleSelect({ players, initialRoles, onSaveRoles }) {
  const navigate = useNavigate();

  // Initialize roles mapping for each player
  const [roleAssignments, setRoleAssignments] = useState(() => {
    if (initialRoles && initialRoles.length === players.length) {
      return initialRoles;
    }
    // Default default roles distributed
    return players.map((name, idx) => ({
      name,
      role: ROLES[idx % ROLES.length].title
    }));
  });

  const [error, setError] = useState('');

  const handleRoleChange = (playerName, selectedRoleTitle) => {
    setRoleAssignments((prev) =>
      prev.map((item) =>
        item.name === playerName ? { ...item, role: selectedRoleTitle } : item
      )
    );
  };

  const handleConfirm = () => {
    // Ensure every player has a selected role
    const unassigned = roleAssignments.some((r) => !r.role);
    if (unassigned) {
      setError('Every player must select a role before continuing.');
      return;
    }

    onSaveRoles(roleAssignments);
    navigate('/map');
  };

  return (
    <div className="screen role-screen">
      <div className="role-header">
        <h2 className="screen-subtitle">STEP 02</h2>
        <h1 className="screen-title">CHOOSE YOUR ROLES</h1>
        <p className="screen-desc">Each player brings a vital instinct to the fog.</p>
      </div>

      {error && <div className="alert-box error">{error}</div>}

      <div className="players-role-container">
        {roleAssignments.map((assignment, pIdx) => (
          <div key={pIdx} className="player-role-card glass-card">
            <h3 className="player-name-badge">
              <span className="badge-icon">👤</span> {assignment.name}
            </h3>

            <div className="roles-grid">
              {ROLES.map((r) => {
                const isSelected = assignment.role === r.title;
                return (
                  <div
                    key={r.title}
                    className={`role-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleRoleChange(assignment.name, r.title)}
                  >
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-title">{r.title}</div>
                    <p className="role-tagline">"{r.tagline}"</p>
                    {isSelected && <span className="selected-indicator">✓ SELECTED</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn-primary continue-btn" onClick={handleConfirm}>
          Enter The Fogged City →
        </button>
      </div>
    </div>
  );
}
