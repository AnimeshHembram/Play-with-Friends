# Contributing

How to work on Play with Friends. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first: it explains the layers and the game contract this guide refers to.

## Setup

1. Node.js 22 (`nvm use` reads `.nvmrc`). Node 20 is not supported.
2. `npm install`
3. `npx playwright install chromium` (once per machine, for the browser tests)
4. `npm run dev`

## Before you push

```bash
npm run validate
```

This runs exactly what CI runs: typecheck, lint, format check, unit tests, production build and browser smoke tests. If formatting fails, run `npm run format`.

Never weaken, skip or delete a test to make the checks pass. If a test exposes a real problem, fix the code.

## Architecture rules (lint enforces these)

| Rule                                                                          | Why                                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/core` imports nothing from `app`, `play`, `landing`, `games` or `shared` | The core is the innermost layer and must stay reusable        |
| `src/shared` imports nothing from `app`, `play`, `landing` or `games`         | Shared UI must not depend on the app or a specific game       |
| A game never imports from another game                                        | Games are independent. Shared code goes in `core` or `shared` |
| A game's `index.ts` stays metadata-only                                       | It's loaded for every visitor. Game code must load lazily     |

Rules that aren't enforced by lint, but still matter:

- **No universal turn system.** Each game owns its own flow. Move a helper into `core` only when a second game needs the same thing.
- **No multiplayer, backend, accounts or cross-device syncing.**
- **Content stays out of logic.** Prompts, questions and words live in `content/<locale>.ts` packs.
- **Session state is plain data** (no functions or class instances). See `core/session`.
- **Expected user errors return a `Result`. Programmer errors throw.**
- **Add dependencies only when they're clearly needed.** Explain why in `docs/DECISIONS.md`.

## Adding a game

1. Create `src/games/<id>/index.ts`. The folder name must equal `meta.id`, and the id is a lowercase slug.

   ```ts
   import { defineGame } from '@/core/games';

   export default defineGame({
     meta: {
       id: 'my-game',
       title: 'My Game',
       description: 'One or two sentences for the selection screen.',
       players: { min: 2, max: null },
       interaction: ['turn-based'], // turn-based | simultaneous | team-based | single-action
       order: 8,
     },
     // Add when the entry component exists. Always a dynamic import:
     // load: () => import('./MyGame'),
   });
   ```

2. When you build the game, put everything inside its folder: the entry component (default export, receives `{ meta, onExit }`), logic, components and `content/`.
3. Use `checkPlayerCount(meta.players, players.length)` to validate the player count, plus whatever core helpers the game needs.
4. Add unit tests for the game's logic next to it. If the catalogue changed, update `tests/app/gameRegistry.test.ts` and `e2e/smoke.spec.ts`.

You never need to change `app/`, `play/` or `core/` to add a game.

### When a game definition is invalid

- **`npm run dev`, `npm test` and CI** throw right away with a message naming the problem.
- **A production build** skips that game, reports it in the console, and keeps every other game working.

## Commits and pull requests

- Keep each change focused and reviewable, and avoid unrelated refactors.
- Use clear commit messages (e.g. `fix(core): …`, `feat(truth-or-dare): …`, `docs: …`).
- Update the docs in the same change when behaviour changes.
- CI must pass on both Ubuntu and Windows.
