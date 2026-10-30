import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Trash2 } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { clearLeaderboard } from '../utils/leaderboard';
import '../styles/teamGame.css';

const fmtDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function LeaderboardPage() {
  const { leaderboard, runId, refreshLeaderboard } = useGame();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const clear = () => {
    clearLeaderboard();
    refreshLeaderboard();
    setConfirming(false);
  };

  return (
    <main className="team-page">
      <section className="team-card lb-card" aria-labelledby="lb-title">
        <header className="team-head">
          <span className="team-eyebrow"><Trophy size={14} aria-hidden="true" /> Chapter 01 · Delhi</span>
          <h1 id="lb-title">Leaderboard</h1>
          <p>Scores are stored in this browser on this device only. They are not shared with other devices.</p>
        </header>

        {leaderboard.length === 0 ? (
          <p className="lb-empty">No scores yet. Finish all five levels and your team will appear here.</p>
        ) : (
          <div className="lb-scroll">
            <table className="lb-table">
              <caption className="sr-only">Teams ranked by score, highest first</caption>
              <thead>
                <tr><th scope="col">#</th><th scope="col">Team</th><th scope="col" className="num">Score</th><th scope="col" className="num lb-hide-sm">Hints</th><th scope="col" className="lb-hide-sm">Date</th></tr>
              </thead>
              <tbody>
                {leaderboard.map((e, i) => (
                  <tr key={e.id} className={e.id === runId ? 'is-you' : ''}>
                    <td>{i + 1}</td>
                    <th scope="row">{e.teamName}{e.id === runId && <span className="you-tag"> (this run)</span>}<small>{e.memberCount} members</small></th>
                    <td className="num">{e.score}</td>
                    <td className="num lb-hide-sm">{e.hintsUsed ?? 0}</td>
                    <td className="lb-hide-sm">{fmtDate(e.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="finale-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate('/delhi')}><ArrowLeft size={15} aria-hidden="true" /><span>Back to the map</span></button>
          {leaderboard.length > 0 && (confirming ? (
            <>
              <button type="button" className="btn-ghost danger" onClick={clear}><Trash2 size={14} aria-hidden="true" /><span>Yes, erase all scores on this device</span></button>
              <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => setConfirming(true)}><Trash2 size={14} aria-hidden="true" /><span>Clear scores</span></button>
          ))}
        </div>
      </section>
    </main>
  );
}
