import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useDelhiTime } from '../../hooks/useDelhiTime';

/** Live Delhi (IST) clock for the map. Time comes from a public time API, with a device-clock fallback. */
export default function DelhiClock() {
  const { time, date, status, source, retry } = useDelhiTime();
  const loading = status === 'loading';

  return (
    <section className="delhi-clock" aria-label="Current time in Delhi, India" aria-busy={loading}>
      <div className="delhi-clock__row">
        <Clock size={14} aria-hidden="true" />
        <span className="delhi-clock__city">New Delhi · IST</span>
      </div>
      {/* aria-live is off on purpose: a clock that announces every second is unusable with a screen reader */}
      <div className="delhi-clock__time" role="timer" aria-live="off">{loading ? '--:--:--' : time}</div>
      {!loading && <div className="delhi-clock__date">{date}</div>}
      <div className={`delhi-clock__status is-${status}`}>
        {loading && 'Syncing with time service…'}
        {status === 'synced' && `Live · synced via ${source}`}
        {status === 'fallback' && (
          <>
            <span>Device clock · live time service unavailable</span>
            <button type="button" className="link-btn" onClick={retry}><RefreshCw size={11} aria-hidden="true" /> Retry</button>
          </>
        )}
      </div>
    </section>
  );
}
