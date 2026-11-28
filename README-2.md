# Play with Friends

A browser-based multi-game party platform. Open the site, pick a game, play. No install, no account, no login.

> **Status: foundation complete (Phases 01–02), minimal UI canvas in progress.** The app opens on a blank, responsive full-screen canvas with a menu in the top-left corner for appearance settings (light/dark/system, background and accent colour). No games are playable in the React app yet. The seven planned games are registered as metadata only and show as "coming soon". All seven games can be opened in the [playground](#playground-playgroundhtml).

## Playground (`playground.html`)

`playground.html` is a single self-contained file where the games are built and tried out before they move into the React app. Open it straight in a browser (double-clicking it works): no install, no build, no network and no dependencies. Game state stays in memory for that tab only (no cookies, no local storage). It has the same appearance settings as the app and works on phones, tablets and desktops, in portrait and landscape, with touch, mouse, keyboard and screen readers. Animations respect the reduced-motion setting.

| Game                  | What you can play now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Truth or Dare         | Three popups first. **How to play:** _Spin one card_ (the card spins fast, slows down and stops on Truth or Dare; the game picks 50/50, but never the same side three times in a row) or _Pick a card_ (Truth on top, Dare below, and the player taps one). **Who asks:** _Random ask_ (the game gives a truth or dare from the chosen level, each once before any repeat) or _Ask by friends_ (the other players make one up). **Level:** _Easy_, _Medium_ or _Ultimate_ (the toughest, 18+ only, asks for confirmation). All can be changed during the game. |
| Never Have I Ever     | A popup asks how many are playing (2–20, with − and + buttons or typed in). The questions come next.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Who's Most Likely To? | 2–12 players, then a level: **Easy**, **Ultimate** or **Toughest** (18+, asks for confirmation, and players can add their own questions). Each round the phone is passed around so everyone votes in private, then the results show bars and ties, plus a running vote tally.                                                                                                                                                                                                                                                                                  |
| Random Picker         | Card (a classic deck dealt to 2–12 players, or custom challenge cards with a red "done" line), a spinning wheel with 2–50 options, a random number (1–10, or 1 to any number up to 1,000,000) and a random letter.                                                                                                                                                                                                                                                                                                                                             |
| Dumb Charades         | 2–12 players. Categories: Bollywood, Hollywood, Cartoons & Characters, Celebrities, Objects & Things, Animals & Nature, 18+ (asks for confirmation) and your own words. Choose a difficulty and a timer; the game keeps score.                                                                                                                                                                                                                                                                                                                                 |
| Rolling Dice          | Roll 1–3 3D dice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Hot Seat              | A random letter is drawn, and whoever's name starts with it takes the Hot Seat. Questions come from everyone in turn or from the player next to them, using built-in questions and your own.                                                                                                                                                                                                                                                                                                                                                                   |

In the playground, Hot Seat has taken Pick a Card's place in the game list.

## Planned games

| Game                  | Folder                        | Interaction            |
| --------------------- | ----------------------------- | ---------------------- |
| Truth or Dare         | `src/games/truth-or-dare`     | turn-based             |
| Never Have I Ever     | `src/games/never-have-i-ever` | simultaneous           |
| Who's Most Likely To? | `src/games/most-likely-to`    | simultaneous           |
| Random Picker         | `src/games/random-picker`     | single action          |
| Dumb Charades         | `src/games/dumb-charades`     | team-based, turn-based |
| Rolling Dice          | `src/games/rolling-dice`      | single action          |
| Pick a Card           | `src/games/pick-a-card`       | single action          |

Player counts in each game's metadata are provisional and will be confirmed when that game is built.

## Development workflow

- Keep the `main` branch stable.
- Build new features on dedicated feature branches.
- Run the relevant tests before opening a pull request.
- Submit changes through pull requests targeting `main`.
- Keep game-specific logic isolated within its respective game module.

## How it's used

- **Shared-device mode:** several people play on one phone or laptop. The game keeps its session in that browser tab.
- **Independent-device mode:** each person opens the site on their own device. Every browser runs its own separate session.

There is deliberately **no** syncing between devices: no real-time multiplayer, no WebSockets, no accounts, no backend.

## Technology stack

| Concern       | Choice                                                       |
| ------------- | ------------------------------------------------------------ |
| UI framework  | React 19                                                     |
| Language      | TypeScript 6 (strict)                                        |
| Build/dev     | Vite 8                                                       |
| Routing       | React Router 7 (data router, lazy routes)                    |
| State         | React state + pure TypeScript modules                        |
| Styling       | Plain CSS with custom properties; CSS Modules for components |
| Unit tests    | Vitest 5 + Testing Library + jsdom                           |
| Browser tests | Playwright (Chromium)                                        |
| Code quality  | ESLint 10 (typescript-eslint, react-hooks) + Prettier        |
| CI            | GitHub Actions (Ubuntu + Windows)                            |

Runtime dependencies: `react`, `react-dom`, `react-router`. Everything else is dev tooling. The reasons for each choice are in [docs/DECISIONS.md](docs/DECISIONS.md).

## Getting started

Requirements: **Node.js 22.22.2 or newer on the 22 line, or 24.15+** (`.nvmrc` pins 22) and npm. Node 20 is not supported: Vitest 5 and jsdom 31 need Node 22.

```bash
npm install
npm run dev          # http://localhost:5173
```

For the browser smoke tests, install Playwright's Chromium once per machine:

```bash
npx playwright install chromium
```

Optional: copy `.env.example` to `.env.local` to override settings. Only `VITE_`-prefixed variables reach the browser, and everything in them is public, so never put secrets there.

## Scripts

| Command                | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the dev server with hot reload                         |
| `npm run build`        | Type-check, then build for production into `dist/`           |
| `npm run preview`      | Serve the production build locally                           |
| `npm run typecheck`    | TypeScript check only (app, tests, e2e, config)              |
| `npm run lint`         | ESLint, including architecture boundary rules                |
| `npm run format`       | Format everything with Prettier                              |
| `npm run format:check` | Check formatting without changing files                      |
| `npm test`             | Run all unit and integration tests once                      |
| `npm run test:watch`   | Run tests in watch mode                                      |
| `npm run test:e2e`     | Build, then run the browser smoke tests                      |
| `npm run check`        | Typecheck, lint, format check, unit tests, build             |
| `npm run validate`     | `check` plus the browser smoke tests: the full suite CI runs |

## Testing

```bash
npm test             # unit + integration (Vitest, jsdom)
npm run test:e2e     # browser smoke tests (Playwright, real Chromium)
npm run validate     # everything
```

- **Unit tests** live next to the code they test (`*.test.ts`). They cover the platform core: players, sessions, randomization, content packs, the game registry and discovery, and player-count checks, with their edge cases.
- **Integration tests** in `tests/` render the real routes with fixture games: routing, new-tab launch, page titles, unknown routes, error containment, and retrying a game that failed to load. They also check the real game catalogue.
- **Browser smoke tests** in `e2e/` run against the production build. They visit every route, open the launch link in a real new tab, reload deep links, and **fail on any console error or warning**.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request, on both Ubuntu and Windows:

1. `npm ci`
2. `npm run check`
3. `npx playwright install --with-deps chromium`
4. `npx playwright test`

That's the same as `npm run validate` locally. If the browser tests fail, the Playwright report is uploaded as a build artifact.

## Directory structure

```
├── index.html               HTML entry
├── public/                  Static files served as-is (favicon)
├── src/
│   ├── main.tsx             Bootstraps React, router and error reporting
│   ├── app/                 Application layer: routes, paths, config, registry wiring, error pages
│   ├── landing/             Landing page (placeholder)
│   ├── play/                Gaming experience shell: layout, game selection, game route
│   ├── core/                Platform core: pure TypeScript, no UI
│   │   ├── games/           Game contract, registry, discovery, player-count check
│   │   ├── players/         Player list management
│   │   ├── session/         Session lifecycle
│   │   ├── random/          RNG sources, pick/shuffle, no-repeat pool, dice, cards
│   │   ├── content/         Content pack contract, validation, locale selection
│   │   └── lib/             Result type, id generation
│   ├── shared/              Reusable UI (ErrorBoundary, LaunchLink, LoadingMessage) and helpers
│   ├── games/               One folder per game, discovered automatically
│   │   └── <game-id>/index.ts
│   └── styles/              Global CSS
├── tests/                   App-level integration tests and test setup
├── e2e/                     Playwright browser smoke tests
├── .github/workflows/       CI
└── docs/                    Architecture and decision records
```

## Adding a game (short version)

1. Create `src/games/<game-id>/index.ts` that does `export default defineGame({ meta: {...} })`. The folder name must match `meta.id`. Keep this file metadata-only (lint enforces it).
2. When the game has an entry component, add `load: () => import('./MyGame')`.

That's it. The registry finds the folder automatically, and the game appears on the selection screen and at `/play/<game-id>`. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#adding-a-game).

## Deployment (Cloudflare Pages)

`npm run build` produces a static site in `dist/`.

| Cloudflare Pages setting | Value                              |
| ------------------------ | ---------------------------------- |
| Build command            | `npm run build`                    |
| Build output directory   | `dist`                             |
| Node version             | 22 (`NODE_VERSION=22` or `.nvmrc`) |

**Deep links need no configuration.** When the output has no top-level `404.html`, Cloudflare Pages treats the project as a single-page app and serves `index.html` for any path that isn't a file. That makes links like `/play/rolling-dice` work. Do **not** add a `_redirects` rule like `/* /index.html 200`: Cloudflare rejects it as an infinite loop. Don't add a `404.html` either, because that turns the SPA behaviour off.

The repository is not licensed for reuse (all rights reserved).

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md): workflow, conventions, adding a game
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): layers, game module contract, platform core, routing, error handling
- [docs/DECISIONS.md](docs/DECISIONS.md): technology and architecture decisions, with reasoning
