# Architecture

Play with Friends is a **platform** that hosts many independent games. It is not a single game with extras. The architecture has one goal: adding or changing a game should never require touching the platform or another game.

## Layers

```
            ┌───────────────────────────────────────────┐
            │  app/  (routes, config, registry wiring)  │
            │  landing/   play/                         │
            └──────────────┬────────────────────────────┘
                           │ uses
            ┌──────────────▼──────────────┐   ┌──────────────────────┐
            │  games/<id>/                │──▶│  shared/ (UI, helpers)│
            │  each game is self-contained│   └──────────┬───────────┘
            └──────────────┬──────────────┘              │
                           │ uses                        │
            ┌──────────────▼─────────────────────────────▼┐
            │  core/  (pure TypeScript: contracts, players,│
            │  session, random, content)                   │
            └──────────────────────────────────────────────┘
```

Dependencies only point inward. ESLint enforces this, so `npm run lint` fails if:

- `src/core` imports from `app`, `play`, `landing`, `games` or `shared`
- `src/shared` imports from `app`, `play`, `landing` or `games`
- a game imports from another game, either through `@/games/...` or a relative path that climbs out of its own folder

## Application layer (`src/app`, `src/landing`, `src/play`)

| File                          | Responsibility                                                            |
| ----------------------------- | ------------------------------------------------------------------------- |
| `main.tsx`                    | Creates the browser router, installs global error handlers, renders `App` |
| `app/App.tsx`                 | Root error boundary, registry provider, router provider                   |
| `app/routes.tsx`              | Route map (below)                                                         |
| `app/paths.ts`                | Every route path in one place                                             |
| `app/config.ts`               | Global config from `VITE_` env vars, with defaults                        |
| `app/gameRegistry.ts`         | Discovers `src/games/*/index.ts` and builds the registry                  |
| `app/GameRegistryContext.tsx` | Supplies the registry to the UI (tests inject fixture registries)         |
| `app/errors.ts`               | Global `error` / `unhandledrejection` handlers                            |

### Routing

| Path            | What renders                                                 |
| --------------- | ------------------------------------------------------------ |
| `/`             | Landing page (placeholder)                                   |
| `/play`         | Gaming experience: game selection (placeholder list)         |
| `/play/:gameId` | That game's entry, a "coming soon" page, or "game not found" |
| `*`             | Not found                                                    |

The landing page and the gaming experience are separate route trees. Everything under `/play` is lazy-loaded, so someone who only visits the landing page never downloads game code.

**New-tab launch.** The landing page's launch button is `shared/ui/LaunchLink`: a real `<a target="_blank" rel="noopener noreferrer">`. A link the user clicks always opens, unlike `window.open()` from script, which popup blockers can stop. It also supports middle-click and works for keyboard and screen-reader users. `noopener` stops the game tab from controlling the landing tab.

**Error containment.** Three levels:

1. Root `ErrorBoundary` in `App`, so the page is never left blank.
2. `errorElement` on route trees, for routes that fail to load.
3. A boundary around every running game, so a crash, or game code that fails to download, shows a message and a "Back to games" link while the rest of the platform keeps working.

## Game module architecture

### The contract (`src/core/games/types.ts`)

```ts
interface GameDefinition {
  meta: GameMeta; // plain data
  load?: () => Promise<{ default: ComponentType<GameEntryProps> }>; // lazy entry
}

interface GameMeta {
  id: string; // URL slug, must match the folder name
  title: string;
  description: string;
  players: { min: number; max: number | null }; // min 0 = no names needed
  interaction: ('turn-based' | 'simultaneous' | 'team-based' | 'single-action')[];
  order?: number; // position on the selection screen
}

interface GameEntryProps {
  meta: GameMeta;
  onExit: () => void; // return to game selection
}
```

The platform only reads `meta` and calls `load`. **Everything else is owned by the game:** rules, state, whether there are turns, randomization, content, controls, settings and session lifecycle. `interaction` describes the game for future UI, such as filters or labels. The platform does not enforce it.

A game without `load` is **planned**: it is listed as "coming soon" and its route says so. Today all seven games are planned.

### Discovery and registry

```
src/games/truth-or-dare/index.ts ──┐
src/games/rolling-dice/index.ts  ──┼─ import.meta.glob (eager, metadata only)
...                              ──┘         │
                                             ▼
                          collectGameDefinitions()  checks default export, folder == id
                                             │
                                             ▼
                          createGameRegistry()      validates meta, rejects duplicate ids
                                             │
                                             ▼
                          get(id) / has(id) / list()  sorted by order, then title
```

Discovery runs at build time through Vite's `import.meta.glob`, so there's no runtime directory scanning. Only the small metadata module is eager. A game's real code is a separate chunk, loaded when the player opens it.

Invalid metadata or a duplicate id **throws during registration**. That's a developer mistake, so it should break tests and the build, not fail silently in production. `tests/app/gameRegistry.test.ts` checks that the real catalogue is discovered.

### Adding a game

1. Create `src/games/<id>/index.ts`:

   ```ts
   import { defineGame } from '@/core/games';

   export default defineGame({
     meta: {
       id: '<id>',
       title: '…',
       description: '…',
       players: { min: 2, max: null },
       interaction: ['turn-based'],
     },
     load: () => import('./MyGame'), // add when the entry component exists
   });
   ```

2. Put everything the game needs inside its folder. A suggested layout, to be adjusted per game:

   ```
   src/games/<id>/
   ├── index.ts           definition (required)
   ├── MyGame.tsx         entry component, default export (receives GameEntryProps)
   ├── logic/             rules and state, pure TS, unit-tested
   ├── components/        game-specific UI
   └── content/
       ├── en.ts          export default defineContentPack({...})
       └── hi.ts          optional translation, same item ids
   ```

3. Nothing in `app/`, `play/` or `core/` changes.

## Platform core (`src/core`)

Pure TypeScript with no React (apart from the `ComponentType` type in the game contract). Everything is optional for games: a game uses the parts it needs and ignores the rest.

**Error convention.** Failures caused by user input return a `Result` (`{ ok: true, value } | { ok: false, error: { code, message } }`) so the UI can show a message. Impossible arguments from a programmer, such as rolling a die with 1 side, throw.

### Players (`core/players`)

Immutable list operations: `addPlayer`, `removePlayer`, `renamePlayer`, `movePlayer`, `validatePlayerName`. Names are trimmed, limited to 24 characters, and unique regardless of case. The default cap is 20 players and can be changed per game. Order is simply the order of the list.

**There is no turn system in core.** Truth or Dare goes around the circle, Who's Most Likely To? has everyone vote at once, Dumb Charades plays in teams, and Rolling Dice has no players at all. A turn helper only moves into core once two or more games actually need the same one.

### Session (`core/session`)

One session = one run of one game in one tab.

```
ready ──start──▶ active ──pause──▶ paused
  ▲                │  ▲              │
  │                │  └───resume─────┘
  └────reset───────┴──────end──────▶ ended
```

- `reset` works from any status and returns to `ready` with fresh state.
- After `end`, nothing else is allowed.
- `TState` is defined by each game. The platform never looks inside it.
- **Isolation:** each session gets a unique id and a `structuredClone` of its initial state, so sessions never share mutable data. Leaving a game's route unmounts its tree and discards the session.
- Games that don't pause just never call `pauseSession`.

Not built yet: persistence (for example, surviving a page refresh) and a React hook wrapper. Both should be added when the first game needs them.

### Randomization (`core/random`)

| Helper                                           | Purpose                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `browserRandom`                                  | Default source, `crypto.getRandomValues` with a `Math.random` fallback        |
| `createSeededRandom(seed)`                       | Repeatable source for tests or future replays                                 |
| `randomInt`, `pickOne`, `pickMany`, `shuffle`    | Basic selection. `shuffle` is Fisher–Yates and never mutates its input        |
| `createNoRepeatPool(items)`                      | Draws without repeats. On reshuffle, never repeats the last item back-to-back |
| `rollDie`, `rollDice`                            | Dice foundations                                                              |
| `createStandardDeck`, `shuffleDeck`, `drawCards` | Card foundations (52 cards, optional jokers)                                  |

Every helper takes an optional `RandomSource`, so tests can be deterministic.

### Content (`core/content`)

Content stays out of game logic. A `ContentPack` is one game's items in one locale:

```ts
{ id, gameId, locale: 'en', version: 1, items: [{ id: 't-001', ... }] }
```

Each item needs a stable `id`, used for no-repeat tracking and future features. The rest of the item's shape is up to the game. `validateContentPack` checks the structure. `selectContentPack(packs, 'hi-IN')` tries an exact match first, then the base language, then the fallback (`en`). No content has been written yet.

## Shared (`src/shared`)

- `ui/ErrorBoundary`: render-error containment, reports through `reportError`
- `ui/LaunchLink`: opens the gaming experience in a new tab
- `lib/reportError`: single error-reporting point (console for now)

## Styling

`src/styles/global.css` holds a small reset, a few CSS custom properties and placeholder classes. It is not a design system. Component styles will use CSS Modules, which Vite supports with no extra dependency. The visual design is a later phase.
