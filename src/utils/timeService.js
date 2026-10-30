/**
 * Delhi time source.
 *
 * Strategy: ask a public time API for the real current time once, work out how far the
 * device clock is from it (the "offset"), then tick locally every second using that offset.
 * Re-sync every few minutes. If every API fails, fall back to the device clock and say so.
 *
 * No API key is needed. To point at your own endpoint, set VITE_TIME_API_URL (see .env.example).
 * Never put secrets in VITE_* variables: they are bundled into the client.
 */
export const DELHI_TZ = 'Asia/Kolkata';
const IST_OFFSET = '+05:30'; // India does not observe daylight saving time.
const REQUEST_TIMEOUT_MS = 6000;

/** Each adapter turns a JSON response into a UTC epoch (ms), or throws. */
export const ADAPTERS = {
  // worldtimeapi.org-style: { unixtime, utc_datetime, datetime }
  worldtime: (j) => {
    if (Number.isFinite(j.unixtime)) return j.unixtime * 1000;
    const iso = j.utc_datetime || j.datetime;
    const ms = Date.parse(iso);
    if (Number.isNaN(ms)) throw new Error('Unrecognised worldtime response');
    return ms;
  },
  // timeapi.io-style: { dateTime: '2026-10-29T15:42:07.1234567' } in the requested zone.
  timeapi: (j) => {
    if (!j.dateTime) throw new Error('Unrecognised timeapi response');
    const trimmed = String(j.dateTime).replace(/(\.\d{3})\d*$/, '$1');
    const ms = Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(trimmed) ? trimmed : trimmed + IST_OFFSET);
    if (Number.isNaN(ms)) throw new Error('Unparseable timeapi dateTime');
    return ms;
  },
};

function getSources() {
  const custom = (import.meta.env?.VITE_TIME_API_URL || '').trim();
  const sources = [];
  if (custom) sources.push({ url: custom, parse: (j) => (j.dateTime && !j.unixtime ? ADAPTERS.timeapi(j) : ADAPTERS.worldtime(j)) });
  sources.push(
    { url: `https://timeapi.io/api/Time/current/zone?timeZone=${DELHI_TZ}`, parse: ADAPTERS.timeapi },
    { url: `https://worldtimeapi.org/api/timezone/${DELHI_TZ}`, parse: ADAPTERS.worldtime }
  );
  return sources;
}

async function fetchWithTimeout(url, ms, fetchImpl) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolves { offsetMs, source } where offsetMs = apiTime - deviceTime.
 * Rejects if no source works (the caller then falls back to the device clock).
 */
export async function syncDelhiTime({ fetchImpl = globalThis.fetch, now = () => Date.now(), sources = getSources() } = {}) {
  let lastError = new Error('No time source configured');
  for (const s of sources) {
    try {
      const t0 = now();
      const json = await fetchWithTimeout(s.url, REQUEST_TIMEOUT_MS, fetchImpl);
      const t1 = now();
      const apiMs = s.parse(json);
      // Assume the server stamped the time mid-flight.
      const offsetMs = apiMs - (t0 + t1) / 2;
      return { offsetMs, source: new URL(s.url).hostname };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

const timeFmt = new Intl.DateTimeFormat('en-IN', { timeZone: DELHI_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const dateFmt = new Intl.DateTimeFormat('en-IN', { timeZone: DELHI_TZ, weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

export function formatDelhi(epochMs) {
  const d = new Date(epochMs);
  return { time: timeFmt.format(d), date: dateFmt.format(d), iso: d.toISOString() };
}
