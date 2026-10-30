import React from 'react';
import { useNavigate } from 'react-router-dom';
import IntroScreen from '../components/game/IntroScreen';

export default function HomePage() {
  const navigate = useNavigate();

  const handleEnterUnknown = () => {
    // /delhi sends players without a team to team setup first.
    navigate('/delhi');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <IntroScreen onEnterUnknown={handleEnterUnknown} />
    </div>
  );
}
