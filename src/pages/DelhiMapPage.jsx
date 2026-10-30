import React, { useState } from 'react';
import RealDelhiMap from '../components/game/RealDelhiMap';
import GameDashboard from '../components/game/GameDashboard';
import MysteryPanel from '../components/game/MysteryPanel';
import DelhiClock from '../components/game/DelhiClock';
import FinaleModal from '../components/game/FinaleModal';
import { useGame } from '../hooks/useGame';
import '../styles/teamGame.css';

export default function DelhiMapPage() {
  const [activeLevel, setActiveLevel] = useState(null);
  const [showFinale, setShowFinale] = useState(false);
  const { chapterFinished } = useGame();

  const handleSelectLevel = (level) => {
    setActiveLevel(level);
  };

  const handleCloseMystery = () => {
    setActiveLevel(null);
    // Closing the last solved riddle ends the game: show the final score and leaderboard link.
    if (chapterFinished) setShowFinale(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Real Geographic MapLibre GL Map with Fog of War */}
      <RealDelhiMap onSelectLevel={handleSelectLevel} />

      {/* Live Delhi time */}
      <DelhiClock />

      {/* Floating Game Dashboard HUD */}
      <GameDashboard />

      {/* Premium Mystery Riddle Panel */}
      {activeLevel && (
        <MysteryPanel 
          key={activeLevel.id}
          level={activeLevel} 
          onClose={handleCloseMystery} 
        />
      )}

      {showFinale && <FinaleModal onClose={() => setShowFinale(false)} />}
    </div>
  );
}
