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

---

_Phase 02 (foundation audit and validation)._

## D14. Invalid games: strict in development, isolated in production

`buildGameRegistry` runs in **strict** mode whenever `import.meta.env.PROD` is false (dev server, Vitest, CI). The first invalid or duplicate game throws there, so a broken definition can't get past review. Production builds run **non-strict**: the broken game is skipped and reported through `reportError`, and the remaining games keep working. A single bad folder should never blank the platform for players. The real-catalogue test runs in strict mode, so CI still blocks it.

## D15. A game's `index.ts` must stay metadata-only (lint-enforced)

Discovery imports every `index.ts` eagerly. A normal import of the game's own files from there would put the whole game into the main bundle and widen the "one game breaks start-up" risk. `@typescript-eslint/no-restricted-imports` blocks relative imports in `src/games/*/index.ts`, except type-only imports. Game code loads through `load: () => import(...)`.

## D16. Retrying failed game loads with one `React.lazy` per attempt

Two earlier approaches were rejected:

- **A module-level promise cache** replayed a failed download forever. It also caused repeated requests while React re-rendered during an outage.
- **Clearing that cache on failure** triggered a request storm and an unreliable retry.

Instead, each attempt creates one `React.lazy`, kept in state. A failure stays failed for that attempt, and "Try again" creates a new one. "Reload page" is offered as well, because some browsers remember a failed module download for the life of the page.

## D17. Remove `public/_redirects`, rely on Cloudflare Pages' SPA mode

Cloudflare Pages is the target host. It rejects `/* /index.html 200` as an infinite loop: Pages ignores it with a warning, and Workers deploys fail. It already serves `index.html` for unknown paths when the output has no top-level `404.html`. The file was removed, and the README documents the Pages settings. Hosts other than Cloudflare need their own fallback rule.

## D18. Node 22 (≥ 22.22.2) or 24 (≥ 24.15)

Vitest 5 needs Node ^22.12 and jsdom 31 needs ^22.22.2 (or 24.15+), so the Phase 01 range (`>=20.19`) was wrong. The same range is used in `package.json` `engines`, `.nvmrc` (22, which CI reads via `node-version-file`) and the README.

## D19. Playwright for browser smoke tests

Playwright is the one dependency added in Phase 02. It's the standard cross-platform browser test runner, works the same on Windows and Linux, and can download its own Chromium (`npx playwright install chromium`), so no system browser is required. The smoke tests:

- run against the production build (`vite preview`), which is the closest local equivalent of what Cloudflare serves
- use `127.0.0.1` so Windows never resolves `localhost` to an IPv6 address the server isn't using
- fail on any console error or warning

Only Chromium runs, to keep the suite fast. Firefox and WebKit can be added to `projects` later. Coverage tooling (`@vitest/coverage-v8`) was considered and deliberately not added.

## D20. CI on GitHub Actions, Ubuntu and Windows

CI runs the same commands as `npm run validate`: `npm ci` → `npm run check` → install Chromium → `npx playwright test`. Windows is in the matrix because the project is developed on Windows. That catches path, line-ending and shell differences early. It's free for public repositories.

## D21. Separate TypeScript projects for app, tests and e2e

Test globals (`vi`, `describe`, jest-dom matchers) are typed only in `tsconfig.test.json`. Production code in `src/` can no longer use them by accident. `tsconfig.e2e.json` covers Playwright files with Node types. `tsc -b` still checks everything.

## D22. Error reporting through React 19 root hooks

`createRoot(..., { onCaughtError, onUncaughtError, onRecoverableError })` passes every React error to `reportError` exactly once. `ErrorBoundary` no longer reports by itself, which avoids double logging. Route _load_ failures never reach React, so `RouteErrorPage` still reports them.

## D23. `RouterProvider` stays imported from `react-router`

React Router recommends `react-router/dom` for browser apps, but that entry only adds optional `flushSync` support. Under Vitest it resolved to a separate copy of the router context, which broke route rendering in tests. The project doesn't need `flushSync`, so the import stays on `react-router`.

## D24. No license, for now

The repository is public but intentionally all rights reserved. Choosing a license is the owner's decision and is deferred.

---

_Stage 03 (responsive UI/UX foundation)._

## D25. Dark-first "game night" theme that follows the device

Party games mostly happen in the evening on a shared phone, so dark is the default. People whose device asks for light get a warm light theme. Both come from the same semantic tokens through `light-dark()`, so components don't know which theme is active. Every text and control pairing was measured against WCAG 2.2 AA (see DESIGN_SYSTEM.md). A manual theme toggle was left out: it would need persistence, and the device setting already expresses the preference.

## D26. System fonts only

Headings prefer the system's rounded face (`ui-rounded`, SF Pro Rounded on Apple devices) and fall back to the system UI font. There are no web fonts: nothing to download, no layout shift, and a native feel on every platform. The trade-off is that headings look slightly different on Windows, Android and Apple devices.

## D27. Content-driven breakpoints and container queries, no device detection

Layouts change where the content needs them to (`auto-fill` grids, `rem` media queries, container queries), not at named device widths. Components such as the game card adapt to their own width, so they work in any column. No JavaScript reads the user agent or screen size. The test viewports in `e2e/responsive.spec.ts` are sample points, not targets.

## D28. Native `<dialog>` for modals

`showModal()` gives focus trapping, an inert background, Escape handling and top-layer stacking with no library. The component adds backdrop-tap close, focus return and `data-autofocus`. The page behind is locked with `html:has(dialog[open])`. jsdom doesn't implement `showModal`, so `tests/setup.ts` adds a minimal stand-in. Real behaviour is covered by Playwright.

## D29. Game tiles coloured by position, glyph by interaction style

The game contract (`GameMeta`) is unchanged. Tiles take their colour from catalogue position (a 7-colour rotation) and their glyph from `meta.interaction`. Adding a game needs no styling, and the platform knows nothing about individual games. If games later need their own art, an optional visual field can be added to `GameMeta`; that is a contract change and deserves its own decision.

## D30. "Let’s Play" opens the catalogue in a new tab

The brief asks for a prominent "Let’s Play" button. It reuses `LaunchLink` (D11), so the landing page stays open behind the game tab. The other launch links ("Play now", "Browse all games", "Start playing") have distinct names, so each link is unambiguous for screen readers and tests.

## D31. `/design` reference route

A lazy route renders every shared component plus working demos of the setup screen and game shell. It is how designers review the system and how the responsive browser tests exercise components that no game uses yet. It isn't linked from the product, is marked `noindex`, and adds nothing to the landing bundle. The demos contain placeholder content only, no gameplay.

## D32. Responsive tests check element edges, not just `scrollWidth`

`overflow-x: clip` on the page means `scrollWidth` can't reveal overflow. The responsive suite walks the DOM and fails on any visible element past the viewport edge, any clipped heading, and any control under 44 px. It runs ten viewports (portrait and landscape phones, tablets, laptop, desktop), touch and keyboard flows, 200% text, and reduced motion. These use Chromium emulation, which is not the same as testing on physical devices.
