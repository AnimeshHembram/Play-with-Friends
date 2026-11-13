# Play with Friends

A browser-based multi-game party platform. Open the site, pick a game, play. No install, no account, no login.

> **Status: Phase 01 (Initial Foundation).** The technical foundation is in place. No games are playable yet. The seven planned games are registered as metadata only and show as "coming soon".

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

## How it's used

- **Shared-device mode:** several people play on one phone or laptop. The game keeps its session in that browser tab.
- **Independent-device mode:** each person opens the site on their own device. Every browser runs its own separate session.

There is deliberately **no** syncing between devices: no real-time multiplayer, no WebSockets, no accounts, no backend.

## Technology stack

| Concern      | Choice                                                       |
| ------------ | ------------------------------------------------------------ |
| UI framework | React 19                                                     |
| Language     | TypeScript 6 (strict)                                        |
| Build/dev    | Vite 8                                                       |
| Routing      | React Router 7 (data router, lazy routes)                    |
| State        | React state + pure TypeScript modules                        |
| Styling      | Plain CSS with custom properties; CSS Modules for components |
| Testing      | Vitest 5 + Testing Library + jsdom                           |
| Code quality | ESLint 10 (typescript-eslint, react-hooks) + Prettier        |

Runtime dependencies: `react`, `react-dom`, `react-router`. Everything else is dev tooling. The reasons for each choice are in [docs/DECISIONS.md](docs/DECISIONS.md).

## Getting started

Requirements: **Node.js 20.19+** (22 LTS recommended, see `.nvmrc`) and npm.

```bash
npm install
npm run dev          # http://localhost:5173
```

Optional: copy `.env.example` to `.env.local` to override settings. Only `VITE_`-prefixed variables reach the browser, and everything in them is public, so never put secrets there.

## Scripts

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload                    |
| `npm run build`        | Type-check, then build for production into `dist/`      |
| `npm run preview`      | Serve the production build locally                      |
| `npm run typecheck`    | TypeScript check only                                   |
| `npm run lint`         | ESLint, including architecture boundary rules           |
| `npm run format`       | Format everything with Prettier                         |
| `npm run format:check` | Check formatting without changing files                 |
| `npm test`             | Run all tests once                                      |
| `npm run test:watch`   | Run tests in watch mode                                 |
| `npm run check`        | Everything: typecheck, lint, format check, tests, build |

## Testing

```bash
npm test
```

Tests live next to the code they test (`*.test.ts`), plus app-level tests in `tests/`. They cover the platform core (players, sessions, randomization, content packs, game registry and discovery), routing, new-tab launch, unknown routes, and error containment for games that crash or fail to load. Routing tests use fixture games, so they don't depend on any real game being built.

## Directory structure

```
├── index.html               HTML entry
├── public/                  Static files served as-is (favicon, SPA fallback)
├── src/
│   ├── main.tsx             Bootstraps React, router and global error handlers
│   ├── app/                 Application layer: routes, paths, config, registry wiring, error pages
│   ├── landing/             Landing page (placeholder)
│   ├── play/                Gaming experience shell: layout, game selection, game route
│   ├── core/                Platform core: pure TypeScript, no UI
│   │   ├── games/           Game contract, registry, discovery
│   │   ├── players/         Player list management
│   │   ├── session/         Session lifecycle
│   │   ├── random/          RNG sources, pick/shuffle, no-repeat pool, dice, cards
│   │   ├── content/         Content pack contract, validation, locale selection
│   │   └── lib/             Result type, id generation
│   ├── shared/              Reusable UI (ErrorBoundary, LaunchLink) and helpers
│   ├── games/               One folder per game, discovered automatically
│   │   └── <game-id>/index.ts
│   └── styles/              Global CSS
├── tests/                   App-level tests and test setup
└── docs/                    Architecture and decision records
```

## Adding a game (short version)

1. Create `src/games/<game-id>/index.ts` that does `export default defineGame({ meta: {...} })`. The folder name must match `meta.id`.
2. When the game has an entry component, add `load: () => import('./MyGame')`.

That's it. The registry finds the folder automatically, and the game appears on the selection screen and at `/play/<game-id>`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#adding-a-game) for the full contract.

## Deployment

`npm run build` produces a static site in `dist/` that any static host can serve. `public/_redirects` gives Cloudflare Pages and Netlify the SPA fallback, so deep links like `/play/rolling-dice` work. Other hosts need an equivalent "serve index.html for unknown paths" rule.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): layers, game module contract, platform core, routing
- [docs/DECISIONS.md](docs/DECISIONS.md): technology and architecture decisions, with reasoning
