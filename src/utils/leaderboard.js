/**
 * Device-local leaderboard. There is no backend in this project, so scores live in
 * this browser's localStorage and are NOT shared with other devices or browsers.
 */
export const LEADERBOARD_KEY = 'the_fogged_city_leaderboard_v1';
const MAX_ENTRIES = 100;

export function sortEntries(entries) {
  return [...entries].sort(
    (a, b) =>
      b.score - a.score ||
      (a.hintsUsed || 0) - (b.hintsUsed || 0) ||
      new Date(a.completedAt) - new Date(b.completedAt)
  );
}

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortEntries(
      parsed.filter((e) => e && typeof e.id === 'string' && typeof e.teamName === 'string' && Number.isFinite(e.score))
    );
  } catch {
    return [];
  }
}

/** Adds an entry. Idempotent: an entry with the same id is never added twice. */
export function addLeaderboardEntry(entry) {
  const current = loadLeaderboard();
  if (current.some((e) => e.id === entry.id)) return current;
  const next = sortEntries([...current, entry]).slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Could not save leaderboard (storage unavailable):', e);
  }
  return next;
}

export function clearLeaderboard() {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (e) {
    console.warn('Could not clear leaderboard:', e);
  }
}
