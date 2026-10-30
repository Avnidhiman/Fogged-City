import { ROLE_IDS } from '../data/roles';

export const TEAM_NAME_MAX = 30;
export const MEMBER_NAME_MAX = 24;
export const MIN_MEMBERS = 2;
export const MAX_MEMBERS = 6;

let counter = 0;
export const newMemberId = () => `m-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const blankMember = () => ({ id: newMemberId(), name: '', role: '' });

/**
 * Validate a draft team. Returns { valid, teamName, members: {[id]: {name, role}}, form }.
 * Error strings are empty/undefined when a field is fine.
 */
export function validateTeam(draft) {
  const errors = { teamName: '', members: {}, form: '' };
  const name = (draft.name || '').trim();
  const members = draft.members || [];

  if (!name) errors.teamName = 'Give your team a name.';
  else if (name.length > TEAM_NAME_MAX) errors.teamName = `Keep the team name under ${TEAM_NAME_MAX} characters.`;

  const seen = new Set();
  let named = 0;
  for (const m of members) {
    const e = {};
    const n = (m.name || '').trim();
    if (!n) e.name = 'Enter a name.';
    else if (n.length > MEMBER_NAME_MAX) e.name = `Max ${MEMBER_NAME_MAX} characters.`;
    else if (seen.has(n.toLowerCase())) e.name = 'Each member needs a different name.';
    else {
      seen.add(n.toLowerCase());
      named += 1;
    }
    if (!m.role) e.role = 'Choose a role.';
    else if (!ROLE_IDS.includes(m.role)) e.role = 'Choose a valid role.';
    if (e.name || e.role) errors.members[m.id] = e;
  }

  if (members.length < MIN_MEMBERS || named < MIN_MEMBERS) {
    errors.form = `A team needs at least ${MIN_MEMBERS} named members.`;
  }

  const valid = !errors.teamName && Object.keys(errors.members).length === 0 && named >= MIN_MEMBERS;
  return { valid, ...errors };
}

/** Trimmed, saveable team object from a valid draft. */
export function normalizeTeam(draft) {
  return {
    name: draft.name.trim(),
    members: draft.members.map((m) => ({ id: m.id, name: m.name.trim(), role: m.role })),
  };
}
