import { describe, it, expect, vi } from 'vitest';
import { validateTeam, normalizeTeam } from '../utils/team';
import { addLeaderboardEntry, loadLeaderboard, LEADERBOARD_KEY, clearLeaderboard } from '../utils/leaderboard';
import { ADAPTERS, syncDelhiTime, formatDelhi } from '../utils/timeService';
import { extractClues } from '../components/game/RoleTools';
import { delhiChapterData } from '../data/cities/delhi';

const m = (id, name, role) => ({ id, name, role });

describe('validateTeam', () => {
  it('requires a team name, two named members and a role each', () => {
    expect(validateTeam({ name: '', members: [] }).valid).toBe(false);
    expect(validateTeam({ name: 'Foggers', members: [m('1', 'Asha', 'cipher')] }).valid).toBe(false);
    expect(validateTeam({ name: 'Foggers', members: [m('1', 'Asha', 'cipher'), m('2', 'Ravi', '')] }).valid).toBe(false);
    expect(validateTeam({ name: 'Foggers', members: [m('1', 'Asha', 'cipher'), m('2', '   ', 'seeker')] }).valid).toBe(false);
    expect(validateTeam({ name: 'Foggers', members: [m('1', 'Asha', 'cipher'), m('2', 'Ravi', 'seeker')] }).valid).toBe(true);
  });
  it('rejects unknown roles and duplicate names', () => {
    expect(validateTeam({ name: 'T', members: [m('1', 'A', 'cipher'), m('2', 'B', 'wizard')] }).valid).toBe(false);
    expect(validateTeam({ name: 'T', members: [m('1', 'Asha', 'cipher'), m('2', ' asha ', 'seeker')] }).valid).toBe(false);
  });
  it('trims on save', () => {
    const t = normalizeTeam({ name: '  X ', members: [m('1', ' A ', 'cipher')] });
    expect(t).toEqual({ name: 'X', members: [{ id: '1', name: 'A', role: 'cipher' }] });
  });
});

describe('leaderboard', () => {
  const e = (id, score, hints = 0, at = '2026-01-01T00:00:00Z') => ({ id, teamName: id, memberCount: 2, score, hintsUsed: hints, completedAt: at });
  it('sorts by score, then fewer hints, and never adds the same run twice', () => {
    addLeaderboardEntry(e('a', 500));
    addLeaderboardEntry(e('b', 1250, 3));
    addLeaderboardEntry(e('c', 1250, 1));
    addLeaderboardEntry(e('c', 9999)); // duplicate id ignored
    expect(loadLeaderboard().map((x) => x.id)).toEqual(['c', 'b', 'a']);
    clearLeaderboard();
    expect(loadLeaderboard()).toEqual([]);
  });
  it('survives corrupt storage', () => {
    localStorage.setItem(LEADERBOARD_KEY, '{not json');
    expect(loadLeaderboard()).toEqual([]);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([{ nope: 1 }, e('ok', 10)]));
    expect(loadLeaderboard().map((x) => x.id)).toEqual(['ok']);
  });
});

describe('time service', () => {
  it('parses both response shapes into a UTC instant', () => {
    expect(ADAPTERS.worldtime({ unixtime: 1790000000 })).toBe(1790000000000);
    // 15:42:07 IST is 10:12:07 UTC
    expect(ADAPTERS.timeapi({ dateTime: '2026-10-29T15:42:07.1234567' })).toBe(Date.UTC(2026, 9, 29, 10, 12, 7, 123));
    expect(() => ADAPTERS.timeapi({})).toThrow();
  });
  const ok = (body) => vi.fn(async () => ({ ok: true, json: async () => body }));
  it('computes the offset from the API and reports the source', async () => {
    const r = await syncDelhiTime({ fetchImpl: ok({ unixtime: 2000 }), now: () => 1_000_000, sources: [{ url: 'https://example.test/t', parse: ADAPTERS.worldtime }] });
    expect(r.offsetMs).toBe(2_000_000 - 1_000_000);
    expect(r.source).toBe('example.test');
  });
  it('falls through to the next source, then rejects when all fail', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ unixtime: 5 }) });
    const sources = [{ url: 'https://a.test', parse: ADAPTERS.worldtime }, { url: 'https://b.test', parse: ADAPTERS.worldtime }];
    expect((await syncDelhiTime({ fetchImpl: f, sources })).source).toBe('b.test');
    await expect(syncDelhiTime({ fetchImpl: vi.fn().mockRejectedValue(new Error('offline')), sources })).rejects.toThrow('offline');
  });
  it('formats in India time', () => {
    expect(formatDelhi(Date.UTC(2026, 9, 29, 10, 12, 7)).time).toBe('15:42:07');
  });
});

describe('Cipher clue extraction', () => {
  it('surfaces numbers and names from the riddle text without using the answer fields', () => {
    const lvl = delhiChapterData.levels[0];
    const clues = extractClues(lvl.riddle.question);
    expect(clues).toEqual(expect.arrayContaining(['27 meters', 'North Pole']));
    const answer = lvl.riddle.options.find((o) => o.isCorrect).text;
    expect(clues.join(' ')).not.toContain('Samrat');
    expect(answer).toContain('Samrat'); // sanity: the answer exists but is not in the clues
  });
});
