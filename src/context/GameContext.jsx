import React, { createContext, useContext, useState, useEffect } from 'react';
import { delhiChapterData } from '../data/cities/delhi';
import { audioSystem } from '../utils/audioSystem';
import { addLeaderboardEntry, loadLeaderboard } from '../utils/leaderboard';
import { ROLE_IDS } from '../data/roles';

const LOCAL_STORAGE_KEY = 'the_fogged_city_save_v3';

const newRunId = () => `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// A saved team is only trusted if it still has the expected shape.
const sanitizeTeam = (t) => {
  if (!t || typeof t.name !== 'string' || !Array.isArray(t.members)) return null;
  const members = t.members.filter((m) => m && typeof m.name === 'string' && ROLE_IDS.includes(m.role));
  return t.name.trim() && members.length >= 2 ? { name: t.name, members } : null;
};

const makeInitialState = () => ({
  team: null, // { name, members: [{ id, name, role }] } — set on the team setup screen
  runId: newRunId(), // identifies one playthrough, so a finished run is only ranked once
  hintsUsed: {}, // { [levelId]: true } — informational only, hints carry no penalty
  leaderboardSaved: false,
  score: 0,
  completedLevels: [], // e.g. ['jantar-mantar']
  levelScores: {},
  currentChapterId: 'delhi',
  soundEnabled: true,
  lastCompletedId: null,
  chapterFinished: false
});

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...makeInitialState(), ...parsed, team: sanitizeTeam(parsed.team) };
      }
    } catch (e) {
      console.warn('Failed to hydrate state from localStorage:', e);
    }
    return makeInitialState();
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Failed to persist state to localStorage:', e);
    }
  }, [gameState]);

  // Sync audio mute
  useEffect(() => {
    audioSystem.setMuted(!gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // When the chapter is finished, record the team on this device's leaderboard (once per run).
  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());
  useEffect(() => {
    if (!gameState.chapterFinished || !gameState.team || gameState.leaderboardSaved) return;
    const next = addLeaderboardEntry({
      id: gameState.runId, // idempotent: StrictMode or a refresh can't create duplicates
      teamName: gameState.team.name,
      memberCount: gameState.team.members.length,
      score: gameState.score,
      hintsUsed: Object.keys(gameState.hintsUsed).length,
      completedAt: new Date().toISOString(),
    });
    setLeaderboard(next);
    setGameState((prev) => (prev.runId === gameState.runId ? { ...prev, leaderboardSaved: true } : prev));
  }, [gameState.chapterFinished, gameState.team, gameState.leaderboardSaved, gameState.runId, gameState.score, gameState.hintsUsed]);

  // Derived values
  const totalLevels = delhiChapterData.levels.length;
  const completedCount = gameState.completedLevels.length;
  const progressPercentage = Math.round((completedCount / totalLevels) * 100);

  // Check if a level is completed
  const isLevelCompleted = (levelId) => {
    return gameState.completedLevels.includes(levelId);
  };

  // Check if a level is unlocked
  const isLevelUnlocked = (levelId) => {
    const target = delhiChapterData.levels.find(l => l.id === levelId);
    if (!target) return false;
    if (target.isDefaultUnlocked) return true;
    if (target.unlockRequirementId) {
      return gameState.completedLevels.includes(target.unlockRequirementId);
    }
    const idx = delhiChapterData.levels.findIndex(l => l.id === levelId);
    if (idx <= 0) return true;
    const prev = delhiChapterData.levels[idx - 1];
    return gameState.completedLevels.includes(prev.id);
  };

  // Complete level
  const completeLevel = (levelId, points = 250) => {
    setGameState(prev => {
      const already = prev.completedLevels.includes(levelId);
      const newCompleted = already ? prev.completedLevels : [...prev.completedLevels, levelId];
      const newScores = {
        ...prev.levelScores,
        [levelId]: Math.max(prev.levelScores[levelId] || 0, points)
      };
      const newScore = Object.values(newScores).reduce((sum, v) => sum + v, 0);
      const isFinished = newCompleted.length >= totalLevels;

      return {
        ...prev,
        score: newScore,
        completedLevels: newCompleted,
        levelScores: newScores,
        lastCompletedId: levelId,
        chapterFinished: isFinished
      };
    });

    audioSystem.playVictory();
  };

  // Save (or edit) the team. Progress is kept: changing a name or role mid-game is allowed.
  const saveTeam = (team) => {
    setGameState(prev => ({ ...prev, team }));
  };

  // Remember that a hint was opened on this level (no score effect).
  const recordHint = (levelId) => {
    setGameState(prev => (prev.hintsUsed[levelId] ? prev : { ...prev, hintsUsed: { ...prev.hintsUsed, [levelId]: true } }));
  };

  const refreshLeaderboard = () => setLeaderboard(loadLeaderboard());

  // Audio toggle
  const toggleSound = () => {
    setGameState(prev => {
      const next = !prev.soundEnabled;
      audioSystem.setMuted(!next);
      return { ...prev, soundEnabled: next };
    });
  };

  // Reset entire expedition
  // The team is kept; score, progress and hints start over as a new run.
  const resetProgress = () => {
    setGameState(prev => ({ ...makeInitialState(), team: prev.team, soundEnabled: prev.soundEnabled }));
    audioSystem.playClick();
  };

  // Dynamic active mission text
  const getActiveObjective = () => {
    if (completedCount >= totalLevels) {
      return 'CHAPTER COMPLETE • Delhi fog fully pierced! All historical secrets unlocked.';
    }
    const nextLvl = delhiChapterData.levels.find(l => !gameState.completedLevels.includes(l.id));
    if (nextLvl) {
      return `LEVEL 0${nextLvl.levelNumber}: ${nextLvl.name.toUpperCase()} • ${nextLvl.objective}`;
    }
    return 'Explore the city map and resolve the shrouded mysteries.';
  };

  const value = {
    score: gameState.score,
    completedLevels: gameState.completedLevels,
    levelScores: gameState.levelScores,
    currentChapterId: gameState.currentChapterId,
    soundEnabled: gameState.soundEnabled,
    chapterFinished: gameState.chapterFinished,
    team: gameState.team,
    runId: gameState.runId,
    hintsUsed: gameState.hintsUsed,
    hintsUsedCount: Object.keys(gameState.hintsUsed).length,
    leaderboard,
    saveTeam,
    recordHint,
    refreshLeaderboard,
    totalLevels,
    completedCount,
    progressPercentage,
    activeObjective: getActiveObjective(),
    isLevelCompleted,
    isLevelUnlocked,
    completeLevel,
    toggleSound,
    resetProgress,

    // Aliases for compatibility
    completedLocations: gameState.completedLevels,
    isLocationCompleted: isLevelCompleted,
    isLocationUnlocked: isLevelUnlocked,
    completeLocation: completeLevel
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
