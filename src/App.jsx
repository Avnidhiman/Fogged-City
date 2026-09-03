// src/App.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';

// Components
import ColdOpen from './components/ColdOpen';
import TeamSetup from './components/TeamSetup';
import RoleSelect from './components/RoleSelect';
import FoggedMap from './components/FoggedMap';
import ZoneCard from './components/ZoneCard';
import RevealScene from './components/RevealScene';
import FinalScene from './components/FinalScene';
import NotFound from './components/NotFound';
import FogEffect from './components/FogEffect';


/**
 * Top-Level Protected Route Component: ProtectedZoneRoute
 * Defined OUTSIDE of App component to prevent component remounting on timer ticks,
 * ensuring input state (e.g. what player is typing) is NEVER erased!
 */
function ProtectedZoneRoute({
  isTeamSetupComplete,
  currentZoneIndex,
  score,
  roles,
  onZoneComplete,
  onHintUsed,
  formattedTime
}) {
  const { id } = useParams();
  const zoneId = Number(id);

  if (!isTeamSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  if (zoneId > currentZoneIndex) {
    return <Navigate to="/map" replace />;
  }

  return (
    <ZoneCard
      score={score}
      roles={roles}
      currentZoneIndex={currentZoneIndex}
      onZoneComplete={onZoneComplete}
      onHintUsed={onHintUsed}
      formattedTime={formattedTime}
    />
  );
}

/**
 * Build Spec v2: 5 Zone Game Flow
 */
export default function App() {
  // -------------------------------------------------------------
  // LIFTED GAME STATE (Managed via custom hook useLocalStorage)
  // -------------------------------------------------------------
  const [gameState, setGameState] = useLocalStorage('fogged_city_state', {
    teamName: '',
    players: [],
    roles: [],
    currentZoneIndex: 1, // 1: Zone 1, 2: Zone 2, 3: Zone 3, 4: Zone 4, 5: Zone 5
    completedZones: [],  // Array of zone IDs solved e.g. [1, 2, 3, 4, 5]
    score: 0,
    cluesCollected: 0,
    hintsUsed: 0,
    timeInSeconds: 0,
    isTimerRunning: false,
    hasSavedLeaderboard: false
  });

  // Destructure state for readable prop drilling
  const {
    teamName,
    players,
    roles,
    currentZoneIndex,
    completedZones,
    score,
    cluesCollected,
    hintsUsed,
    timeInSeconds,
    isTimerRunning,
    hasSavedLeaderboard
  } = gameState;

  // -------------------------------------------------------------
  // TIMER SYLLABUS DEMO: Live Game Timer using useEffect & setInterval
  // -------------------------------------------------------------
  useEffect(() => {
    let timerInterval = null;

    if (isTimerRunning && cluesCollected < 5) {
      timerInterval = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeInSeconds: prev.timeInSeconds + 1
        }));
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTimerRunning, cluesCollected, setGameState]);

  // Format seconds to MM:SS string
  const formattedTime = useMemo(() => {
    const mins = Math.floor((timeInSeconds || 0) / 60);
    const secs = (timeInSeconds || 0) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [timeInSeconds]);

  // -------------------------------------------------------------
  // LEADERBOARD SAVING: Save team run to localStorage on completion of 5 zones
  // -------------------------------------------------------------
  useEffect(() => {
    if (cluesCollected === 5 && teamName && !hasSavedLeaderboard) {
      try {
        const storedLeaderboard = localStorage.getItem('fogged_city_leaderboard');
        const leaderboardList = storedLeaderboard ? JSON.parse(storedLeaderboard) : [];

        const newEntry = {
          teamName,
          score,
          timeInSeconds,
          cluesCollected: 5,
          completedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };

        leaderboardList.push(newEntry);
        localStorage.setItem('fogged_city_leaderboard', JSON.stringify(leaderboardList));

        setGameState((prev) => ({
          ...prev,
          hasSavedLeaderboard: true,
          isTimerRunning: false
        }));
      } catch (e) {
        console.warn('Error saving leaderboard entry', e);
      }
    }
  }, [cluesCollected, teamName, score, timeInSeconds, hasSavedLeaderboard, setGameState]);

  // -------------------------------------------------------------
  // USEMEMO SYLLABUS DEMO: Calculate derived game metrics
  // -------------------------------------------------------------
  const isTeamSetupComplete = useMemo(() => {
    return Boolean(teamName.trim() && players && players.length >= 2);
  }, [teamName, players]);

  // -------------------------------------------------------------
  // USECALLBACK SYLLABUS DEMO: State update callbacks
  // -------------------------------------------------------------
  const handleSaveTeam = useCallback((newTeamName, newPlayers) => {
    setGameState((prev) => ({
      ...prev,
      teamName: newTeamName,
      players: newPlayers,
      isTimerRunning: true // Start timer when team is created
    }));
  }, [setGameState]);

  const handleSaveRoles = useCallback((newRoles) => {
    setGameState((prev) => ({
      ...prev,
      roles: newRoles
    }));
  }, [setGameState]);

  const handleZoneComplete = useCallback((zoneId, pointsEarned) => {
    setGameState((prev) => {
      // Prevent double completion scoring
      if (prev.completedZones.includes(zoneId)) return prev;

      const nextCompleted = [...prev.completedZones, zoneId];
      const nextClues = nextCompleted.length;
      const nextZoneIdx = Math.max(prev.currentZoneIndex, zoneId + 1);
      const nextScore = prev.score + pointsEarned;

      return {
        ...prev,
        completedZones: nextCompleted,
        currentZoneIndex: nextZoneIdx,
        score: nextScore,
        cluesCollected: nextClues
      };
    });
  }, [setGameState]);

  const handleHintUsed = useCallback((cost) => {
    setGameState((prev) => ({
      ...prev,
      score: Math.max(0, prev.score - cost),
      hintsUsed: prev.hintsUsed + 1
    }));
  }, [setGameState]);

  const handleResetGame = useCallback(() => {
    setGameState({
      teamName: '',
      players: [],
      roles: [],
      currentZoneIndex: 1,
      completedZones: [],
      score: 0,
      cluesCollected: 0,
      hintsUsed: 0,
      timeInSeconds: 0,
      isTimerRunning: false,
      hasSavedLeaderboard: false
    });
  }, [setGameState]);

  return (
    <div className="app-main-layout">
      <FogEffect density="medium" />
  <Routes>
        {/* Screen 1: Cold Open */}
        <Route path="/" element={<ColdOpen />} />

        {/* Screen 2: Team Setup */}
        <Route
          path="/setup"
          element={
            <TeamSetup
              initialTeamName={teamName}
              initialPlayers={players}
              onSaveTeam={handleSaveTeam}
            />
          }
        />

        {/* Screen 3: Role Select (Protected) */}
        <Route
          path="/role"
          element={
            isTeamSetupComplete ? (
              <RoleSelect
                players={players}
                initialRoles={roles}
                onSaveRoles={handleSaveRoles}
              />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />

        {/* Screen 4: Fogged Map (Protected) */}
        <Route
          path="/map"
          element={
            isTeamSetupComplete ? (
              <FoggedMap
                teamName={teamName}
                score={score}
                cluesCollected={cluesCollected}
                currentZoneIndex={currentZoneIndex}
                completedZones={completedZones}
                onResetGame={handleResetGame}
                formattedTime={formattedTime}
              />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />

        {/* Screen 5: Dynamic Zone Route (/zone/:id) -> Direct Riddle Solver */}
        <Route
          path="/zone/:id"
          element={
            <ProtectedZoneRoute
              isTeamSetupComplete={isTeamSetupComplete}
              currentZoneIndex={currentZoneIndex}
              score={score}
              roles={roles}
              onZoneComplete={handleZoneComplete}
              onHintUsed={handleHintUsed}
              formattedTime={formattedTime}
            />
          }
        />

        {/* Screen 8: Reveal Scene (Protected - requires 5 clues solved) */}
        <Route
          path="/reveal"
          element={
            cluesCollected === 5 ? (
              <RevealScene />
            ) : (
              <Navigate to="/map" replace />
            )
          }
        />

        {/* Screen 9: Final Scene (Protected - requires 5 clues solved) */}
        <Route
          path="/final"
          element={
            cluesCollected === 5 ? (
              <FinalScene
                teamName={teamName}
                players={players}
                roles={roles}
                score={score}
                cluesCollected={cluesCollected}
                hintsUsed={hintsUsed}
                formattedTime={formattedTime}
                onResetGame={handleResetGame}
              />
            ) : (
              <Navigate to="/map" replace />
            )
          }
        />

        {/* Screen 10: Atmospheric 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
