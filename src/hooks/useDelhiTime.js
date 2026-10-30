import { useCallback, useEffect, useRef, useState } from 'react';
import { syncDelhiTime, formatDelhi } from '../utils/timeService';

const RESYNC_MS = 5 * 60 * 1000;

/**
 * status: 'loading' (first sync in flight) | 'synced' (API time) | 'fallback' (device clock; API failed)
 * Ticks once a second locally, so it costs one request every few minutes, not one per second.
 */
export function useDelhiTime() {
  const offsetRef = useRef(0);
  const [status, setStatus] = useState('loading');
  const [source, setSource] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [nonce, setNonce] = useState(0); // bump to re-run the sync (Retry button)

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const r = await syncDelhiTime();
        if (cancelled) return;
        offsetRef.current = r.offsetMs;
        setNow(Date.now() + r.offsetMs);
        setSource(r.source);
        setStatus('synced');
      } catch {
        if (cancelled) return;
        // Keep any earlier good offset; otherwise the device clock is used.
        setStatus((s) => (s === 'synced' ? 'synced' : 'fallback'));
      }
    };

    sync();
    const resync = setInterval(sync, RESYNC_MS);
    const tick = setInterval(() => setNow(Date.now() + offsetRef.current), 1000);
    return () => {
      cancelled = true;
      clearInterval(resync);
      clearInterval(tick);
    };
  }, [nonce]);

  const retry = useCallback(() => { setStatus('loading'); setNonce((n) => n + 1); }, []);

  return { ...formatDelhi(now), status, source, retry };
}
