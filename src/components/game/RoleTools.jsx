import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, ExternalLink, Eraser, AudioLines } from 'lucide-react';
import { ROLES } from '../../data/roles';

/**
 * Optional riddle fields this component understands (all can be added later in data/cities/*.js):
 *   riddle.audio        { src: '/audio/jantar-mantar.mp3', label?: string, transcript?: string }
 *   riddle.cipherNotes  string[]   extra decoding tips written by the level author
 *   riddle.seekerNotes  string[]   extra field tips written by the level author
 * Nothing here ever reveals the answer: clues are pulled from the riddle text the player already sees.
 */

const STOP = new Set(['What', 'Which', 'Who', 'Where', 'When', 'Why', 'How', 'I', 'The', 'A', 'An', 'It', 'Its', 'Despite', 'Within', 'Beneath', 'Directly', 'Today', 'In']);

/** Numbers/measurements and proper names from the riddle text. */
export function extractClues(text = '') {
  const clues = [];
  const add = (c) => { const t = c.trim().replace(/[.,;:]$/, ''); if (t && !clues.includes(t)) clues.push(t); };

  const numRe = /\b\d[\d,.]*(?:st|nd|rd|th)?(?:\s?(?:meters?|metres?|km|years?|centuries|century|decades?|seconds?|CE|BCE|AD))*/gi;
  (text.match(numRe) || []).forEach(add);

  const nameRe = /\b[A-Z][a-zA-Z’']+(?:\s[A-Z][a-zA-Z’']+)*/g;
  for (const m of text.matchAll(nameRe)) {
    const words = m[0].split(/\s+/).filter((w) => !STOP.has(w));
    if (words.length) add(words.join(' '));
  }
  return clues.slice(0, 8);
}

const fmtTime = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

function VoiceLoreTool({ audio }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  useEffect(() => () => ref.current?.pause(), []);
  // A different riddle means a different recording.
  useEffect(() => { setPlaying(false); setFailed(false); setTime({ cur: 0, dur: 0 }); }, [audio?.src]);

  if (!audio?.src) {
    return <p className="role-empty">No audio recording for this riddle yet. When one is added, play and pause controls appear here.</p>;
  }
  const label = audio.label || 'Riddle recording';

  const toggle = async () => {
    const el = ref.current;
    if (!el) return;
    try {
      if (el.paused) await el.play(); else el.pause();
    } catch {
      setFailed(true);
      setPlaying(false);
    }
  };

  return (
    <div className="voice-tool">
      <audio
        ref={ref}
        src={audio.src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => { setFailed(true); setPlaying(false); }}
        onTimeUpdate={(e) => setTime({ cur: e.currentTarget.currentTime, dur: e.currentTarget.duration })}
      />
      <button type="button" className="voice-btn" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} audio: ${label}`} aria-pressed={playing}>
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>
      <span className="voice-meta">{label}{time.dur ? ` · ${fmtTime(time.cur)} / ${fmtTime(time.dur)}` : ''}</span>
      {failed && <p className="role-empty" role="alert">The recording couldn’t be loaded. Check your connection and try again.</p>}
      {audio.transcript && (
        <details className="voice-transcript"><summary>Transcript</summary><p>{audio.transcript}</p></details>
      )}
    </div>
  );
}

function CipherTool({ riddle, ruledOutCount, onClear }) {
  const clues = useMemo(() => extractClues(riddle.question), [riddle.question]);
  return (
    <div>
      <p className="role-tip">Underline every number and name, then ask which options each one rules out. Use the ✗ beside an option to keep your own notes.</p>
      {clues.length > 0 ? (
        <ul className="clue-chips" aria-label="Key clues from the riddle">
          {clues.map((c) => <li key={c}>{c}</li>)}
        </ul>
      ) : (
        <p className="role-empty">No numbers or names stand out in this riddle. Read it slowly for wordplay.</p>
      )}
      {riddle.cipherNotes?.length > 0 && <ul className="role-notes">{riddle.cipherNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
      <p className="role-meta">
        {ruledOutCount} option{ruledOutCount === 1 ? '' : 's'} noted as ruled out
        {ruledOutCount > 0 && (
          <button type="button" className="link-btn" onClick={onClear}><Eraser size={12} aria-hidden="true" /> Clear notes</button>
        )}
      </p>
    </div>
  );
}

function SeekerTool({ level }) {
  const [lng, lat] = level.coordinates || [];
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  return (
    <div>
      <p className="role-tip">Match the Expedition Brief to the riddle: the landmark’s features and history are usually described there.</p>
      <dl className="seeker-facts">
        <div><dt>District</dt><dd>{level.district}</dd></div>
        {hasCoords && <div><dt>Coordinates</dt><dd>{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</dd></div>}
        <div><dt>Objective</dt><dd>{level.objective}</dd></div>
      </dl>
      {level.riddle.seekerNotes?.length > 0 && <ul className="role-notes">{level.riddle.seekerNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
      {hasCoords && (
        <a className="link-btn" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}>
          <ExternalLink size={12} aria-hidden="true" /> View on OpenStreetMap<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

export default function RoleTools({ team, level, ruledOutCount = 0, onClearRuledOut }) {
  if (!team?.members?.length) return null;
  const byRole = ROLES.map((r) => ({ role: r, names: team.members.filter((m) => m.role === r.id).map((m) => m.name) })).filter((x) => x.names.length);
  if (!byRole.length) return null;

  return (
    <details className="role-tools">
      <summary>
        <AudioLines size={14} aria-hidden="true" />
        <span>Team toolkit</span>
        <span className="role-tools__roles">{byRole.map((x) => x.role.label).join(' · ')}</span>
      </summary>
      <div className="role-tools__body">
        {byRole.map(({ role, names }) => (
          <section key={role.id} className="role-section" aria-label={`${role.label} tools`}>
            <h4>{role.label} <small>for {names.join(', ')}</small></h4>
            {role.id === 'cipher' && <CipherTool riddle={level.riddle} ruledOutCount={ruledOutCount} onClear={onClearRuledOut} />}
            {role.id === 'seeker' && <SeekerTool level={level} />}
            {role.id === 'voice-lore' && <VoiceLoreTool audio={level.riddle.audio} />}
          </section>
        ))}
      </div>
    </details>
  );
}
