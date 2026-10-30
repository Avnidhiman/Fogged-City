/**
 * Scoring rules, in one place so the UI and the game logic always agree.
 * Points per level come from each level's `pointsReward` (see data/cities/delhi.js).
 * The original game has no penalty for hints or wrong answers, so there is none here.
 */
export const SCORING_RULES = [
  'Each level you solve is worth its listed points (250 in Chapter 01).',
  'Hints are free. Opening one never changes your score.',
  'Wrong answers are not penalised: re-read the clue and try again.',
  'Your team score is the sum of all solved levels.',
];

export const SCORING_SUMMARY = 'Hints are free: they never reduce your score.';
