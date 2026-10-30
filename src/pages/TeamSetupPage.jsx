import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, UserPlus, X, Check, Circle, ArrowRight } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { ROLES } from '../data/roles';
import { SCORING_SUMMARY } from '../data/scoring';
import { audioSystem } from '../utils/audioSystem';
import {
  blankMember, validateTeam, normalizeTeam,
  MIN_MEMBERS, MAX_MEMBERS, TEAM_NAME_MAX, MEMBER_NAME_MAX,
} from '../utils/team';
import '../styles/teamGame.css';

export default function TeamSetupPage() {
  const { team, saveTeam } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = location.state?.from || '/delhi';

  // Start from the saved team (so details persist if the player comes back), else two blank rows.
  const [name, setName] = useState(team?.name || '');
  const [members, setMembers] = useState(() =>
    team?.members?.length ? team.members.map((m) => ({ ...m })) : [blankMember(), blankMember()]
  );
  const [touched, setTouched] = useState({});
  const [tried, setTried] = useState(false);
  const lastAddedRef = useRef(null);

  const result = useMemo(() => validateTeam({ name, members }), [name, members]);
  const touch = (key) => setTouched((t) => ({ ...t, [key]: true }));
  const show = (key) => tried || touched[key];

  useEffect(() => {
    if (lastAddedRef.current) {
      document.getElementById(`member-name-${lastAddedRef.current}`)?.focus();
      lastAddedRef.current = null;
    }
  }, [members.length]);

  const updateMember = (id, patch) => setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    const m = blankMember();
    lastAddedRef.current = m.id;
    setMembers((ms) => [...ms, m]);
    audioSystem.playClick();
  };

  const removeMember = (id) => {
    if (members.length <= MIN_MEMBERS) return;
    setMembers((ms) => ms.filter((m) => m.id !== id));
  };

  const submit = (e) => {
    e.preventDefault();
    setTried(true);
    if (!result.valid) {
      audioSystem.playError();
      return;
    }
    saveTeam(normalizeTeam({ name, members }));
    audioSystem.playClick();
    navigate(goTo, { replace: true });
  };

  const namedCount = members.filter((m) => m.name.trim()).length;
  const rolesDone = members.length > 0 && members.every((m) => m.role);
  const checklist = [
    { ok: !!name.trim(), text: 'Team name' },
    { ok: namedCount >= MIN_MEMBERS, text: `At least ${MIN_MEMBERS} named members` },
    { ok: rolesDone, text: 'A role for every member' },
  ];

  return (
    <main className="team-page">
      <form className="team-card" onSubmit={submit} noValidate aria-labelledby="team-title">
        <header className="team-head">
          <span className="team-eyebrow"><Users size={14} aria-hidden="true" /> Chapter 01 · Delhi</span>
          <h1 id="team-title">Assemble your team</h1>
          <p>Every expedition needs a crew. Name your team and give each member a role before the fog lifts.</p>
        </header>

        <div className="team-field">
          <label htmlFor="team-name">Team name</label>
          <input
            id="team-name"
            type="text"
            value={name}
            maxLength={TEAM_NAME_MAX}
            autoComplete="off"
            placeholder="e.g. The Lantern Keepers"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch('team')}
            aria-invalid={show('team') && !!result.teamName}
            aria-describedby={show('team') && result.teamName ? 'team-name-err' : undefined}
          />
          {show('team') && result.teamName && <p id="team-name-err" className="team-error" role="alert">{result.teamName}</p>}
        </div>

        <fieldset className="team-members">
          <legend>Members <span>({members.length}/{MAX_MEMBERS})</span></legend>

          {members.map((m, i) => {
            const err = result.members[m.id] || {};
            const nameKey = `n-${m.id}`;
            const roleKey = `r-${m.id}`;
            return (
              <div className="member-row" key={m.id}>
                <div className="member-top">
                  <label htmlFor={`member-name-${m.id}`} className="member-label">Member {i + 1}</label>
                  {members.length > MIN_MEMBERS && (
                    <button type="button" className="icon-btn" onClick={() => removeMember(m.id)} aria-label={`Remove member ${i + 1}${m.name.trim() ? `, ${m.name.trim()}` : ''}`}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input
                  id={`member-name-${m.id}`}
                  type="text"
                  value={m.name}
                  maxLength={MEMBER_NAME_MAX}
                  autoComplete="off"
                  placeholder="Player name"
                  onChange={(e) => updateMember(m.id, { name: e.target.value })}
                  onBlur={() => touch(nameKey)}
                  aria-invalid={show(nameKey) && !!err.name}
                  aria-describedby={show(nameKey) && err.name ? `member-name-err-${m.id}` : undefined}
                />
                {show(nameKey) && err.name && <p id={`member-name-err-${m.id}`} className="team-error" role="alert">{err.name}</p>}

                <div role="radiogroup" aria-label={`Role for member ${i + 1}`} aria-describedby={show(roleKey) && err.role ? `member-role-err-${m.id}` : undefined} className="role-picker">
                  {ROLES.map((r) => (
                    <label key={r.id} className={`role-chip${m.role === r.id ? ' is-selected' : ''}`}>
                      <input
                        type="radio"
                        name={`role-${m.id}`}
                        value={r.id}
                        checked={m.role === r.id}
                        onChange={() => { updateMember(m.id, { role: r.id }); touch(roleKey); }}
                      />
                      <span className="role-chip__label">{r.label}</span>
                      <span className="role-chip__tag">{r.tagline}</span>
                    </label>
                  ))}
                </div>
                {show(roleKey) && err.role && <p id={`member-role-err-${m.id}`} className="team-error" role="alert">{err.role}</p>}
              </div>
            );
          })}

          <button type="button" className="btn-ghost" onClick={addMember} disabled={members.length >= MAX_MEMBERS}>
            <UserPlus size={15} aria-hidden="true" />
            <span>{members.length >= MAX_MEMBERS ? 'Team is full' : 'Add member'}</span>
          </button>
        </fieldset>

        <ul className="team-checklist" aria-label="What is still needed" aria-live="polite">
          {checklist.map((c) => (
            <li key={c.text} className={c.ok ? 'is-done' : ''}>
              {c.ok ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
              <span>{c.text}</span>
              <span className="sr-only">{c.ok ? ' (done)' : ' (still needed)'}</span>
            </li>
          ))}
        </ul>

        {tried && !result.valid && result.form && <p className="team-error" role="alert">{result.form}</p>}

        <button type="submit" className={`btn-primary team-submit${result.valid ? '' : ' is-blocked'}`} aria-disabled={!result.valid}>
          <span>{team ? 'Save team & continue' : 'Start the expedition'}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p className="team-note">{SCORING_SUMMARY} Team details are saved on this device.</p>
      </form>
    </main>
  );
}
