# Decisions

Short records of the choices made in Phase 01 and why. Add new entries at the bottom when a decision changes.

## D1. Static single-page app, no backend

Every session runs in one browser tab, and there are no accounts or device syncing, so there's nothing for a server to do. A static build is free to host, fast, and has no attack surface beyond the page itself. A backend can be added later if a feature genuinely needs one.

## D2. React 19 + TypeScript (strict)

React has the largest ecosystem, the most documentation, and a large hiring pool, and it handles interactive UI with lots of state well. TypeScript's strict mode plus `noUncheckedIndexedAccess` catches the off-by-one and undefined-item bugs that randomization code is prone to.

Alternatives considered: Svelte and Solid produce smaller bundles but have smaller ecosystems. Vanilla TS has no runtime cost but would mean hand-building routing, error containment and component composition.

**Pinned to TypeScript 6.0.** TypeScript 7 (the native rewrite) is the npm `latest`, but `typescript-eslint` doesn't support it yet (`<6.1`). Move up once it does.

## D3. Vite 8

Vite 8 offers fast startup, near-instant hot reload, and built-in support for TypeScript, CSS Modules, env variables and `import.meta.glob`. Game discovery relies on `import.meta.glob`, so the discovery code needs no extra libraries.

## D4. React Router 7 (data router, lazy routes)

React Router is the stable, widely used router for React. Route-level `lazy` keeps the whole `/play` tree out of the landing-page bundle. `createMemoryRouter` with the same route list makes routing fully testable.

## D5. No state-management library

Game state is game-specific, and the core operations are pure functions (`players`, `session`), which fit `useState`/`useReducer` directly. Adding Redux or Zustand now would mean picking a pattern for seven games before writing one of them. Revisit if several games need to share live state.

## D6. Plain CSS + CSS Modules

Plain CSS and CSS Modules need no dependencies and no build plugins, and they work with any design direction chosen in the UI phase. Tailwind or a component library would commit the project to a visual system before it has been designed.

## D7. Games as self-contained modules, discovered by folder

- One folder per game, each with a default-exported `defineGame({ meta, load? })`.
- The contract is deliberately small (`meta` + `load` + `{ meta, onExit }` props), so the platform assumes nothing about how a game plays.
- Discovery through `import.meta.glob`: adding a game is a new folder and nothing else.
- The folder name must equal `meta.id`, so URL, folder and id can't drift apart.
- Metadata is eager and game code is lazy, so the selection screen is cheap and each game is its own chunk.
- Registration throws on invalid or duplicate games, so mistakes surface in tests, not in production.
- ESLint blocks game-to-game imports, which keeps the independence real and not just a convention.

## D8. No universal turn system

The planned games interact in fundamentally different ways (turns, simultaneous voting, teams, single actions). The core provides an ordered player list, and each game builds its own flow on top of it. Shared turn logic gets extracted only when a second game needs the same thing.

## D9. Results for user errors, exceptions for programmer errors

Player-name problems and invalid session transitions return typed `Result`s with a readable message for the UI. Calling a utility with impossible arguments (`randomInt(5, 1)`, `rollDie(1)`) throws `RangeError`, because that's a bug, not a user mistake.

## D10. Injectable randomness

All random helpers accept a `RandomSource`. Production uses `crypto.getRandomValues`, which gives a better distribution than `Math.random`. Tests use a seeded generator, so distribution, no-repeat and shuffle tests are deterministic and never flaky.

## D11. New tab via a real link

`<a target="_blank" rel="noopener noreferrer">` is never popup-blocked, works with middle-click and assistive technology, and needs no JavaScript. `window.open()` is kept out unless a future flow truly needs it, and even then it must only run inside a direct click handler.

## D12. Vitest + Testing Library

Vitest shares Vite's config and transforms, so there's no duplicate Babel or Jest setup. Testing Library tests behaviour (what a user sees), not implementation details.

## D13. Known dev-only audit warnings

`npm audit` reports moderate advisories in `minimatch`, pulled in by ESLint and typescript-eslint. These are **dev-only** linting tools and don't ship in the production bundle. The suggested "fix" downgrades ESLint to 9, a breaking change, so it was not applied. Recheck when typescript-eslint updates.
