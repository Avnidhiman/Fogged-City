import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import HomePage from '../pages/HomePage';
import ChapterSelectionPage from '../pages/ChapterSelectionPage';
import DelhiMapPage from '../pages/DelhiMapPage';
import TeamSetupPage from '../pages/TeamSetupPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useGame } from '../hooks/useGame';

// The original cloud-intro scene (src/App.jsx). Lazy so its CSS and three.js only load if visited.
const CloudScene = lazy(() => import('../App'));

/** Riddles are only reachable once a team exists; otherwise send the player to team setup first. */
function RequireTeam({ children }) {
  const { team } = useGame();
  const location = useLocation();
  if (!team) return <Navigate to="/team" replace state={{ from: location.pathname }} />;
  return children;
}

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Cinematic Main Landing Page (THE FOGGED CITY) */}
        <Route path="/" element={<HomePage />} />

        {/* Team name, members and roles — required before any riddle */}
        <Route path="/team" element={<TeamSetupPage />} />

        {/* Chapter Selection Screen (Chapter 01: Delhi + Future Cities) */}
        <Route path="/chapters" element={<ChapterSelectionPage />} />

        {/* Chapter 01: Delhi Living Interactive Map */}
        <Route path="/delhi" element={<RequireTeam><DelhiMapPage /></RequireTeam>} />

        {/* End-of-game leaderboard (stored on this device) */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Original cloud-intro scene, kept reachable */}
        <Route path="/scene" element={<Suspense fallback={null}><CloudScene /></Suspense>} />

        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
