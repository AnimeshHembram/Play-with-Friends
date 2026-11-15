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
- a game's `index.ts` imports the game's own files normally (type-only imports are allowed). Game code must load through `load: () => import(...)`.

## Application layer (`src/app`, `src/landing`, `src/play`)

| File                                             | Responsibility                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `main.tsx`                                       | Creates the browser router, wires error reporting (React root hooks and global handlers), renders `App` |
| `app/App.tsx`                                    | Root error boundary, registry provider, router provider                                                 |
| `app/routes.tsx`                                 | Route map (below)                                                                                       |
| `app/paths.ts`                                   | Every route path in one place                                                                           |
| `app/config.ts`                                  | Global config from `VITE_` env vars, with defaults                                                      |
| `app/gameRegistry.ts`                            | Discovers `src/games/*/index.ts` and builds the registry                                                |
| `app/GameRegistryContext.tsx`                    | Supplies the registry to the UI (tests inject fixture registries)                                       |
| `app/errors.ts`                                  | Global `error` / `unhandledrejection` handlers                                                          |
| `app/PageTitle.tsx`                              | Sets the browser tab title per page (React 19 `<title>` hoisting)                                       |
| `app/NotFoundPage.tsx`, `app/RouteErrorPage.tsx` | Not-found and route-error pages                                                                         |
| `app/Brand.tsx`, `app/SiteFooter.tsx`            | Logo/wordmark link and the footer used by the landing page and the catalogue                            |
| `app/gameLabels.ts`                              | Human-readable labels from game metadata ("2+ players", "Take turns")                                   |
| `play/GameCard.tsx`                              | One game in the catalogue                                                                               |
| `showcase/`                                      | The `/design` reference pages (app layer, lazy-loaded)                                                  |

### Routing

| Path            | What renders                                                                            |
| --------------- | --------------------------------------------------------------------------------------- |
| `/`             | Landing page                                                                            |
| `/play`         | Gaming experience: game catalogue                                                       |
| `/play/:gameId` | That game's entry, a "coming soon" page, or "game not found"                            |
| `/design/*`     | Design-system reference and layout demos (lazy, `noindex`, not linked from the product) |
| `*`             | Not found                                                                               |

The landing page and the gaming experience are separate route trees. Everything under `/play` is lazy-loaded, so someone who only visits the landing page never downloads game code. On a direct visit to a `/play` URL (for example, the new tab), the route's `hydrateFallbackElement` shows a loading message while that code downloads.

Every page sets its own tab title (`Rolling Dice · Play with Friends`). Loading messages use `role="status"` so screen readers announce them.

**Hosting.** Deep links depend on the host serving `index.html` for unknown paths. Cloudflare Pages does this automatically when there's no top-level `404.html`, so the repo deliberately has no `_redirects` file (see the README's Deployment section).

**New-tab launch.** The landing page's launch button is `shared/ui/LaunchLink`: a real `<a target="_blank" rel="noopener noreferrer">`. A link the user clicks always opens, unlike `window.open()` from script, which popup blockers can stop. It also supports middle-click and works for keyboard and screen-reader users, and it includes visually hidden "(opens in a new tab)" text. `noopener` stops the game tab from controlling the landing tab.

**Error containment.** Four levels:

1. **Root `ErrorBoundary` in `App`**, so the page is never left blank.
2. **`errorElement` on every route tree** (including `*`), for routes that fail to load or render.
3. **A boundary around every running game.** A crash, or game code that fails to download, shows a message with **Try again**, **Reload page** and **Back to games** while the rest of the platform keeps working.
   - Each attempt uses its own `React.lazy` component, so a failed download isn't retried in a loop while the network is down.
   - "Try again" starts a fresh attempt instead of replaying the old failure.
   - "Reload page" covers browsers that remember a failed module download.
4. **Registry isolation.** In production, a game whose definition is invalid is skipped and reported, and every other game keeps working. See [Discovery and registry](#discovery-and-registry).

**Error reporting.** Every error goes through `shared/lib/reportError`, which logs to the console for now and is the single place a future reporting service would plug into.

| Source                                                          | How it's reported                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Errors caught by any error boundary, and uncaught render errors | React root hooks `onCaughtError` / `onUncaughtError` / `onRecoverableError` in `main.tsx` (once each) |
| Route load failures, which never reach React's hooks            | `RouteErrorPage`                                                                                      |
| Errors outside React (stray promise rejections, script errors)  | `installGlobalErrorHandlers`                                                                          |
| Skipped invalid games in production                             | `buildGameRegistry`'s `onError`                                                                       |

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
                          toGameDefinition()        checks default export, folder == id
                                             │
                                             ▼
                          buildGameRegistry()       validates meta, rejects duplicate ids
                                                    strict (dev/test): throw
                                                    production: skip + report
                                             │
                                             ▼
                          get(id) / has(id) / list()  sorted by order, then title
```

Discovery runs at build time through Vite's `import.meta.glob`, so there's no runtime directory scanning. Only the small metadata module is eager. A game's real code is a separate chunk, loaded when the player opens it.

**Validation.** Registration checks:

- the id is a lowercase slug
- `title` and `description` are non-empty strings
- `players.min` is a whole number of 0 or more, and `players.max` is `null` or a whole number no smaller than `min`
- `interaction` uses only the known styles
- `order`, if set, is a finite number
- `load`, if set, is a function

Malformed input (`null`, wrong types, plain JS modules) produces a readable `GameRegistryError`, never a raw `TypeError`.

**Invalid games: loud in development, isolated in production** (`app/gameRegistry.ts`):

| Environment                   | `strict` | An invalid or duplicate game…                                              |
| ----------------------------- | -------- | -------------------------------------------------------------------------- |
| `npm run dev`, `npm test`, CI | `true`   | throws immediately, so the mistake can't be missed and CI fails            |
| Production build              | `false`  | is skipped and reported with `reportError`. Every other game keeps working |

`tests/app/gameRegistry.test.ts` loads the real catalogue in strict mode, so CI fails before a broken game can ship. The browser smoke tests check that all seven games appear in the production build.

**Known limit.** A game's `index.ts` that _throws while being imported_ would still stop the app from starting, because all metadata modules are imported eagerly. The metadata-only lint rule makes this very unlikely, and the strict registry test catches it in CI.

### Player-count check

`checkPlayerCount(meta.players, count)` returns a `Result`: `too-few-players`, `too-many-players` or `invalid-count`, each with a readable message. It only checks the number. How players take part (turns, teams, voting) stays inside each game.

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

Immutable list operations: `addPlayer`, `removePlayer`, `renamePlayer`, `movePlayer`, `validatePlayerName`. Order is simply the order of the list.

- **Names are cleaned:** control characters and invisible formatting characters (zero-width spaces, direction marks) are removed, then the name is trimmed and internal spaces collapsed. The zero-width joiner is kept so emoji like 👨‍👩‍👧 stay intact.
- A name must contain at least one visible character (letter, number, symbol, emoji or punctuation).
- Names can be at most 24 characters, counted the way a person would (`visibleLength`: one emoji is one character), and must be unique regardless of case.
- The default cap is 20 players and can be changed per game. `maxPlayers` must be a whole number of 1 or more, otherwise `addPlayer` throws.

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
- **Isolation:** each session gets a unique id and a `structuredClone` of its initial state, so sessions never share mutable data. Leaving a game's route unmounts its tree and discards the session. Nothing is written to browser storage, so tabs never share state.
- **State must be plain data:** objects, arrays, primitives, `Date`, `Map`, `Set`. Functions throw a clear `TypeError`, and class instances would turn into plain objects. Updates should return new objects, never module-level ones shared between sessions.
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

Limits are checked, not assumed:

- `randomInt` needs safe integers and a range of at most 2³² values (`MAX_RANDOM_RANGE`, the generator's resolution).
- It throws if a `RandomSource` returns anything outside [0, 1).
- The no-repeat pool works on list positions, so pass unique items if a value must never come up twice.

### Content (`core/content`)

Content stays out of game logic. A `ContentPack` is one game's items in one locale:

```ts
{ id, gameId, locale: 'en', version: 1, items: [{ id: 't-001', ... }] }
```

Each item needs a stable `id`, used for no-repeat tracking and future features. The rest of the item's shape is up to the game. `validateContentPack` checks the structure, accepts `unknown` input (ready for JSON content later), and returns readable errors for malformed packs. `selectContentPack(packs, 'hi-IN')` tries an exact match first, then the base language, then the fallback (`en`). Locale matching ignores case and treats `_` as `-`, so `hi_IN` finds the Hindi pack. No content has been written yet.

## Shared (`src/shared`)

- `ui/`: the design-system components (buttons, cards, dialogs, menus, inputs, player chips, badges, state panels, tooltips, app bar, skip link, game tiles). See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- `ui/setup/`: setup foundation: `SetupScreen`, `SetupSection`, `PlayerSetup`.
- `ui/game/`: game shell foundation: `GameShell`, `GameCompletion`.
- `ui/ErrorBoundary`: render-error containment with an optional reset (`fallback={(reset) => …}`)
- `ui/LoadingMessage`: loading state announced to screen readers
- `ui/LaunchLink`: opens the gaming experience in a new tab
- `lib/reportError`: single error-reporting point (console for now)
- `lib/cx`: class-name joining helper

Shared UI is presentational. The setup and shell components hold no game state and impose no flow: `GameShell` has no idea of turns, rounds or scores, and `PlayerSetup` is a controlled list the game owns. A game uses whichever pieces it needs, or none.

## Styling

- `src/styles/tokens.css`: every colour, type size, spacing step, radius, shadow and duration, with light and dark values (`light-dark()`).
- `src/styles/global.css`: reset, page defaults, and a few layout utilities (`.container`, `.page-main`, `.status-page`, `.visually-hidden`).
- Components use co-located **CSS Modules** (`*.module.css`), which Vite supports with no extra dependency.
- Responsive behaviour is CSS-only: mobile-first, content-driven breakpoints in `rem`, container queries, `clamp()`, dynamic viewport units and safe-area insets. There is no JavaScript device detection.

Full details: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
