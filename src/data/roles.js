/**
 * Team roles. Every team member must pick exactly one.
 * `id` values are stored in saved games, so don't rename them casually.
 */
export const ROLES = [
  {
    id: 'cipher',
    label: 'Cipher',
    tagline: 'Decodes the clues',
    description: 'Breaks the riddle apart: key numbers, dates and terms, plus a notepad to rule options out.',
  },
  {
    id: 'seeker',
    label: 'Seeker',
    tagline: 'Reads the terrain',
    description: 'Keeps the team oriented: where the landmark is, what to look for, and what the brief says.',
  },
  {
    id: 'voice-lore',
    label: 'Voice Lore',
    tagline: 'Keeps the oral history',
    description: 'Plays the audio recording for a riddle, when one exists.',
  },
];

export const ROLE_IDS = ROLES.map((r) => r.id);

export const getRole = (id) => ROLES.find((r) => r.id === id) || null;
