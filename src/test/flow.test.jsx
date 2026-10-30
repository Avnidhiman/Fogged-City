import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider, useGame } from '../context/GameContext';
import AppRoutes from '../routes/AppRoutes';
import MysteryPanel from '../components/game/MysteryPanel';
import LeaderboardPage from '../pages/LeaderboardPage';
import DelhiClock from '../components/game/DelhiClock';
import { delhiChapterData } from '../data/cities/delhi';
import { loadLeaderboard } from '../utils/leaderboard';

// WebGL map and the cinematic intro can't run in jsdom; the routing/game logic around them can.
vi.mock('../components/game/RealDelhiMap', () => ({ default: () => <div data-testid="map" /> }));
vi.mock('../components/game/IntroScreen', () => ({ default: () => <div>intro</div> }));

const app = (path = '/delhi', strict = true) => {
  const tree = (
    <MemoryRouter initialEntries={[path]}>
      <GameProvider><AppRoutes /></GameProvider>
    </MemoryRouter>
  );
  return render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);
};

async function fillTeam(user, { name = 'Lantern Keepers', members = [['Asha', 'Cipher'], ['Ravi', 'Seeker']] } = {}) {
  await user.type(screen.getByLabelText('Team name'), name);
  for (let i = 0; i < members.length; i++) {
    if (i >= 2) await user.click(screen.getByRole('button', { name: /add member/i }));
    await user.type(screen.getByLabelText(`Member ${i + 1}`), members[i][0]);
    await user.click(within(screen.getByRole('radiogroup', { name: `Role for member ${i + 1}` })).getByLabelText(new RegExp(members[i][1], 'i')));
  }
}

describe('team setup gate', () => {
  it('redirects /delhi to team setup when no team exists', () => {
    app('/delhi');
    expect(screen.getByRole('heading', { name: /assemble your team/i })).toBeInTheDocument();
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
  });

  it('blocks continuing until name, 2 named members and roles are set, then saves and continues', async () => {
    const user = userEvent.setup();
    app('/delhi');
    const go = screen.getByRole('button', { name: /start the expedition/i });
    expect(go).toHaveAttribute('aria-disabled', 'true');

    await user.click(go);
    expect(screen.getByText('Give your team a name.')).toBeInTheDocument();
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Team name'), 'Lantern Keepers');
    await user.type(screen.getByLabelText('Member 1'), 'Asha');
    await user.type(screen.getByLabelText('Member 2'), 'Ravi');
    await user.click(go); // names present but no roles
    expect(screen.getAllByText('Choose a role.')).toHaveLength(2);
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();

    await user.click(within(screen.getByRole('radiogroup', { name: 'Role for member 1' })).getByLabelText(/cipher/i));
    await user.click(within(screen.getByRole('radiogroup', { name: 'Role for member 2' })).getByLabelText(/voice lore/i));
    expect(go).toHaveAttribute('aria-disabled', 'false');
    await user.click(go);

    expect(await screen.findByTestId('map')).toBeInTheDocument(); // returned to /delhi
    expect(screen.getByText('Lantern Keepers')).toBeInTheDocument(); // team shown in the HUD
    const saved = JSON.parse(localStorage.getItem('the_fogged_city_save_v3'));
    expect(saved.team.members.map((m) => m.role)).toEqual(['cipher', 'voice-lore']);
  });

  it('supports adding and removing members (min 2, max 6)', async () => {
    const user = userEvent.setup();
    app('/team');
    expect(screen.queryByRole('button', { name: /remove member/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /add member/i }));
    expect(screen.getByLabelText('Member 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove member 3/i }));
    expect(screen.queryByLabelText('Member 3')).not.toBeInTheDocument();
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: /add member/i }));
    expect(screen.getByRole('button', { name: /team is full/i })).toBeDisabled();
  });

  it('keeps team details after a reload (persistence) and skips setup', async () => {
    const user = userEvent.setup();
    const first = app('/team');
    await fillTeam(user);
    await user.click(screen.getByRole('button', { name: /start the expedition/i }));
    await screen.findByTestId('map');
    first.unmount();
    app('/delhi');
    expect(await screen.findByTestId('map')).toBeInTheDocument();
    expect(screen.getByText('Lantern Keepers')).toBeInTheDocument();
  });
});

const seedTeam = (members) => localStorage.setItem('the_fogged_city_save_v3', JSON.stringify({ team: { name: 'Crew', members } }));
const L1 = delhiChapterData.levels[0];
const crew = (...roles) => roles.map((r, i) => ({ id: `m${i}`, name: ['Asha', 'Ravi', 'Meera'][i], role: r }));
const panel = (level = L1) => render(<GameProvider><MysteryPanel level={level} onClose={() => {}} /></GameProvider>);

describe('role tools in a riddle', () => {
  it('shows tools only for roles on the team, collapsed by default', () => {
    seedTeam(crew('cipher', 'seeker'));
    panel();
    const summary = screen.getByText('Team toolkit');
    expect(summary.closest('details')).not.toHaveAttribute('open');
    expect(screen.getByRole('region', { name: 'Cipher tools' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Seeker tools' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Voice Lore tools' })).not.toBeInTheDocument();
  });

  it('Cipher can rule options out as private notes without touching the answer flow', async () => {
    const user = userEvent.setup();
    seedTeam(crew('cipher', 'seeker'));
    panel();
    await user.click(screen.getByRole('button', { name: /rule out option: ram yantra/i }));
    expect(screen.getByRole('button', { name: /restore option: ram yantra/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/1 option noted as ruled out/i)).toBeInTheDocument();
    expect(screen.queryByText(/mystery uncovered/i)).not.toBeInTheDocument();
  });

  it('no rule-out controls when the team has no Cipher', () => {
    seedTeam(crew('seeker', 'voice-lore'));
    panel();
    expect(screen.queryByRole('button', { name: /rule out option/i })).not.toBeInTheDocument();
  });

  it('Seeker sees district and an external map link that opens safely', () => {
    seedTeam(crew('seeker', 'cipher'));
    panel();
    const link = screen.getByRole('link', { name: /view on openstreetmap/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.getAttribute('href')).toContain('mlat=28.6271');
  });

  it('Voice Lore shows a graceful empty state when the riddle has no audio', () => {
    seedTeam(crew('voice-lore', 'seeker'));
    panel();
    expect(screen.getByText(/no audio recording for this riddle yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /play audio/i })).not.toBeInTheDocument();
  });

  it('Voice Lore gets labelled play/pause controls when a riddle has audio', async () => {
    const user = userEvent.setup();
    seedTeam(crew('voice-lore', 'seeker'));
    const withAudio = { ...L1, riddle: { ...L1.riddle, audio: { src: '/audio/x.mp3', label: 'Keeper’s tale', transcript: 'Once upon a fog…' } } };
    panel(withAudio);
    const play = screen.getByRole('button', { name: 'Play audio: Keeper’s tale' });
    await user.click(play);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pause audio: Keeper’s tale' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /pause audio/i }));
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  it('Voice Lore reports an audio load failure instead of failing silently', async () => {
    seedTeam(crew('voice-lore', 'seeker'));
    const { container } = panel({ ...L1, riddle: { ...L1.riddle, audio: { src: '/missing.mp3' } } });
    await act(async () => { container.querySelector('audio').dispatchEvent(new Event('error')); });
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t be loaded/i);
  });
});

describe('hints and scoring', () => {
  it('hint is hidden until requested, is recorded, and does not change the score', async () => {
    const user = userEvent.setup();
    seedTeam(crew('cipher', 'seeker'));
    panel();
    expect(screen.queryByText(L1.riddle.hint)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /request hint/i }));
    expect(document.getElementById('riddle-hint')).toHaveTextContent(/supreme instrument/i);
    expect(screen.getAllByText(/hints are free/i).length).toBeGreaterThan(0);
    const saved = JSON.parse(localStorage.getItem('the_fogged_city_save_v3'));
    expect(saved.hintsUsed).toEqual({ 'jantar-mantar': true });
    expect(saved.score).toBe(0);
  });

  it('awards the level points on a correct answer and nothing on a wrong one', async () => {
    const user = userEvent.setup();
    seedTeam(crew('cipher', 'seeker'));
    panel();
    await user.click(screen.getByRole('button', { name: /^ram yantra/i }));
    expect(JSON.parse(localStorage.getItem('the_fogged_city_save_v3')).score).toBe(0);
    await user.click(screen.getByRole('button', { name: /^samrat yantra/i }));
    expect(screen.getByText(/mystery uncovered • \+250 pts/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('the_fogged_city_save_v3')).score).toBe(250);
  });
});

describe('finishing the game', () => {
  function Finisher() {
    const g = useGame();
    return <button onClick={() => delhiChapterData.levels.forEach((l) => g.completeLevel(l.id, l.pointsReward))}>finish</button>;
  }
  it('saves the team to the leaderboard exactly once (even under StrictMode) and shows it', async () => {
    const user = userEvent.setup();
    seedTeam(crew('cipher', 'seeker'));
    render(<React.StrictMode><MemoryRouter><GameProvider><Finisher /><LeaderboardPage /></GameProvider></MemoryRouter></React.StrictMode>);
    expect(screen.getByText(/no scores yet/i)).toBeInTheDocument();
    await user.click(screen.getByText('finish'));
    const board = loadLeaderboard();
    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ teamName: 'Crew', score: 1250, memberCount: 2 });
    const table = await screen.findByRole('table');
    expect(within(table).getByText(/crew/i)).toBeInTheDocument();
    expect(within(table).getByText('1250')).toBeInTheDocument();
    expect(screen.getByText(/stored in this browser on this device only/i)).toBeInTheDocument();
  });
});

describe('Delhi clock states', () => {
  it('shows a loading state, then the synced time', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ unixtime: Date.UTC(2026, 9, 29, 10, 12, 7) / 1000 }) })));
    vi.setSystemTime(new Date(Date.UTC(2026, 9, 29, 10, 12, 7)));
    render(<DelhiClock />);
    expect(screen.getByText('--:--:--')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(screen.getByRole('timer')).toHaveTextContent('15:42:0');
    expect(screen.getByText(/live · synced via/i)).toBeInTheDocument();
    vi.useRealTimers(); vi.unstubAllGlobals();
  });
  it('falls back to the device clock with a retry when the API is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    render(<DelhiClock />);
    expect(await screen.findByText(/live time service unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('timer').textContent).toMatch(/^\d\d:\d\d:\d\d$/);
    vi.unstubAllGlobals();
  });
});
