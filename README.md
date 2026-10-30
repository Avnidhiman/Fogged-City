# The Fogged City

A React + Vite exploration game. Chapter 01 takes a team through five Delhi landmarks, one riddle each.

```bash
npm install
npm run dev      # http://localhost:5173 (Vite picks the next free port, e.g. 5174, if busy)
npm test         # unit + flow tests (Vitest)
npm run build
```

## Routes

| Path | What it is |
| --- | --- |
| `/` | Cinematic intro |
| `/team` | Team setup (name, members, roles) |
| `/chapters` | Chapter selection |
| `/delhi` | Live Delhi map + riddles. Redirects to `/team` until a team exists |
| `/leaderboard` | Scores of finished runs, stored on this device |
| `/scene` | The original cloud-intro scene |

## Game flow

1. **Team setup.** A team needs a name, at least two uniquely named members (max 6) and one role each: **Cipher**, **Seeker** or **Voice Lore**. The team is saved with the game and kept as you progress. Use the team icon in the HUD to edit it.
2. **Riddles.** Open a landmark on the map. Each riddle has a collapsed **Team toolkit** showing tools only for roles on your team:
   - **Cipher**: key numbers and names pulled from the riddle text, plus ✗ buttons for private "ruled out" notes (notes never affect answers).
   - **Seeker**: district, coordinates, objective and an OpenStreetMap link.
   - **Voice Lore**: play/pause for the riddle's recording. Riddles without audio show a friendly empty state.
3. **Hints** are hidden until requested.
4. **Finish** all levels to see your final score and the leaderboard.

### Scoring

- Each solved level awards its `pointsReward` (250 in Chapter 01, 1,250 total).
- Hints are free and wrong answers are not penalised (the original game had no penalties, so none were added). The rules live in `src/data/scoring.js` and are shown in the app.
- Ties on the leaderboard are broken by fewer hints, then earlier finish.

### Adding role content to a riddle (`src/data/cities/delhi.js`)

All optional, no code changes needed:

```js
riddle: {
  // ...
  audio: { src: '/audio/jantar-mantar.mp3', label: 'The keeper’s tale', transcript: 'Optional text for accessibility' },
  cipherNotes: ['Extra decoding tip'],
  seekerNotes: ['Extra field tip'],
}
```

Put audio files in `public/audio/`. None are included yet.

## Delhi clock and configuration

The map on `/delhi` shows the current time in Delhi (IST). The app asks a public time API once, calculates the difference from the device clock, ticks locally each second and re-syncs every 5 minutes. If the services can't be reached it shows the device clock labelled as such, with a Retry button.

No API key is needed. To use your own endpoint, copy `.env.example` to `.env` and set `VITE_TIME_API_URL` (optional, restart the dev server afterwards). Never put secrets in `VITE_*` variables: they are public in the built app.

## What is stored in your browser (localStorage)

| Key | Contents |
| --- | --- |
| `the_fogged_city_save_v3` | Team, progress, score, hints opened, sound setting |
| `the_fogged_city_leaderboard_v1` | Finished runs: team name, score, hints, date |

There is no backend, so the leaderboard is per browser and per device. "Restart expedition" in the HUD resets score and progress but keeps the team and the leaderboard. "Clear scores" on the leaderboard page erases the saved scores.
