# Design system

The visual language and reusable UI of Play with Friends. Everything here is live at **`/design`** (components), **`/design/setup`** (setup foundation) and **`/design/shell`** (game shell). Those pages aren't linked from the product and are marked `noindex`.

## Design direction: "game night"

Party games mostly happen in the evening: a phone passed around a sofa, a laptop on a coffee table. The interface is built for that:

- **Dark by default, warm light theme on request.** The colour scheme follows the device (`prefers-color-scheme`). Dark is an ink-plum night, not pure black. Light is a warm paper tone, not stark white.
- **One warm accent.** Tangerine marks the single most important action on each screen. Mint is used sparingly for "ready" and positive highlights.
- **Bright, flat tiles for games.** Each game gets a solid colour tile with a glyph for _how_ it's played (turns, everyone at once, teams, quick tap). No gradients and no illustrations to download.
- **Rounded, friendly type.** Headings use the system's rounded face where there is one (SF Pro Rounded on Apple devices) and fall back to the system UI font. Body text is the system UI font. No web fonts, so nothing to download and nothing shifts while loading.
- **Calm by default.** Motion is limited to small feedback (press, hover lift, dialog entrance) and is switched off when the user asks for reduced motion.
- **Big targets, short screens.** Every control is at least 44×44 px. Screens show one decision at a time.

Deliberately avoided: busy dashboards, nested cards, heavy gradients, decorative animation, tiny text (nothing is smaller than 14 px), and hover-only interactions.

## Tokens (`src/styles/tokens.css`)

Components never hard-code colours, sizes or durations. They read CSS custom properties.

### Colour

Each token has a light and a dark value, picked with `light-dark()`.

| Token                    | Light     | Dark      | Use                                                 |
| ------------------------ | --------- | --------- | --------------------------------------------------- |
| `--color-bg`             | `#fbf7f1` | `#120f1c` | Page background                                     |
| `--color-surface`        | `#ffffff` | `#1c1829` | Cards, dialogs                                      |
| `--color-surface-raised` | `#f3ede4` | `#26213a` | Chips, badges, menus, hover fills                   |
| `--color-surface-sunken` | `#f1ebe2` | `#0d0b15` | Inputs, alternating sections                        |
| `--color-text`           | `#1e1a29` | `#f5f2fc` | Body text and headings                              |
| `--color-text-muted`     | `#575164` | `#bdb5d1` | Secondary text                                      |
| `--color-border`         | `#8c8399` | `#7a719c` | Borders that identify a control (inputs, etc.)      |
| `--color-border-subtle`  | `#e6ded3` | `#2f2945` | Decorative separators only                          |
| `--color-primary`        | `#c2410c` | `#ff8a5c` | Primary button fill                                 |
| `--color-on-primary`     | `#ffffff` | `#1f0d05` | Text on primary                                     |
| `--color-primary-text`   | `#b13a0a` | `#ffa27f` | Links, accents on normal surfaces                   |
| `--color-secondary`      | `#0f766e` | `#5fe0b7` | Highlights, "ready"                                 |
| `--color-success`        | `#17773b` | `#5ee49a` | Success                                             |
| `--color-warning`        | `#8a5300` | `#ffc94d` | Warnings, "coming soon"                             |
| `--color-danger`         | `#b4232f` | `#ff7a8e` | Errors, destructive actions                         |
| `--color-focus`          | `#4338ca` | `#ffd166` | Keyboard focus ring                                 |
| `--color-tile-1…7`       | same both | same both | Game tiles; glyphs use `--color-tile-ink` (#1e1a29) |

Every status colour also has a `-soft` background variant used for badges and state icons.

**Measured contrast (WCAG 2.2):**

| Pair                                    | Light              | Dark               | Requirement   |
| --------------------------------------- | ------------------ | ------------------ | ------------- |
| Text on bg / surface / raised           | 15.9 / 17.0 / 14.6 | 17.1 / 15.7 / 14.0 | 4.5:1         |
| Muted text on bg / surface / raised     | 7.1 / 7.6 / 6.5    | 9.6 / 8.8 / 7.9    | 4.5:1         |
| Primary text on bg / surface / raised   | 5.7 / 6.0 / 5.2    | 9.7 / 8.9 / 7.9    | 4.5:1         |
| On-primary on primary (button label)    | 5.2                | 8.1                | 4.5:1         |
| Success, warning, danger on surfaces    | ≥ 4.8              | ≥ 6.2              | 4.5:1         |
| Control border on bg / surface / raised | 3.4 / 3.6 / 3.1    | 3.5 / 3.2 / 3.0    | 3:1           |
| Focus ring on bg / surface / raised     | 7.4 / 7.9 / 6.8    | 13.1 / 12.0 / 10.7 | 3:1           |
| Tile ink on every tile colour           | ≥ 8.2              | ≥ 8.2              | 3:1 (graphic) |

`prefers-contrast: more` turns subtle borders into full borders and muted text into full text. `forced-colors` (Windows High Contrast) keeps borders on cards, badges, buttons and dialogs.

### Typography

| Token            | Size (min → max) | Use                          |
| ---------------- | ---------------- | ---------------------------- |
| `--text-display` | 38 → 76 px       | Landing hero                 |
| `--text-3xl`     | 30 → 44 px       | Page titles                  |
| `--text-2xl`     | 24 → 32 px       | Section titles, state panels |
| `--text-xl`      | 20 → 24 px       | Card titles, dialog titles   |
| `--text-lg`      | 18 → 20 px       | Lead text                    |
| `--text-base`    | 16 → 17 px       | Body                         |
| `--text-sm`      | 14 px            | Badges, hints. The floor.    |

Sizes are `clamp(rem, rem + vw, rem)`. The `rem` part means they still follow browser zoom and the user's text-size setting (WCAG 1.4.4). Text inputs never go below 16 px, so iOS never zooms the page when a field gets focus.

Weights: 400 body, 600 labels, 700 buttons, 800 headings. Line heights: 1.15 headings, 1.3 snug, 1.55 body.

### Spacing and layout

- **Scale:** `--space-1` … `--space-16` on a 4 px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
- **Fluid spacing:** `--gutter` (page side padding, 16 → 32 px), `--space-section` (48 → 104 px between landing sections), `--space-stack` (16 → 24 px between blocks).
- **Containers:** `.container` (74 rem), `.container-md` (56 rem: setup and game screens), `.container-sm` (40 rem: forms and dialogs). Side padding respects landscape notches.
- **Touch target:** `--tap-min` = 44 px.
- **Radii:** 8, 14, 20, 28 px and pill.

## Responsive approach

**Mobile-first and content-driven.** There's no list of devices in the code. Layouts change where the _content_ needs them to:

| Technique                                                                 | Where                                                                                                       |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr))` | Game catalogue: 1 column on phones, 2 on small tablets and landscape phones, 3 on wide screens              |
| Container queries (`@container`)                                          | Game card layout, text field + action, player setup: they adapt to their own width, wherever they're placed |
| `rem`-based media queries (40, 48, 56 rem)                                | Header shortcuts, hero two-column layout, dialog sheet vs. centred card                                     |
| `(orientation: landscape) and (max-height: 30rem)`                        | Short landscape phones: game controls move to a side column, dialogs use almost the full height             |
| `100dvh`                                                                  | Game shell and page height follow the mobile address bar                                                    |
| `env(safe-area-inset-*)` + `viewport-fit=cover`                           | Header, sticky bars, dialogs and side padding stay clear of notches and the home indicator                  |
| `clamp()` for type and spacing                                            | Everywhere                                                                                                  |

Other rules every screen follows:

- **No horizontal scrolling.** Long words wrap (`overflow-wrap`), titles wrap rather than truncate, and badges wrap at large text sizes. `overflow-x: clip` on the page is a safety net, not the fix: the browser tests check element edges directly.
- **Nothing depends on hover.** Tooltips also open on keyboard focus, and only repeat information available elsewhere. Hover effects are wrapped in `@media (hover: hover)`.
- **Touch:** `touch-action: manipulation` on controls removes the double-tap zoom delay. The game shell's controls bar uses `overscroll-behavior: contain`. Games with drag or swipe interactions can set `stageTouch="none"` so dragging on the stage never scrolls or zooms the page. Zoom is never disabled.
- **Reduced motion:** durations drop to 0, the spinner pulses instead of spinning, and smooth scrolling is off.

## Components (`src/shared/ui`)

All are presentational and game-agnostic. None holds game state.

| Component                                | Notes                                                                                                                                                                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                 | `primary` / `secondary` / `ghost` / `danger`, `sm` / `md` / `lg`, `block`, `icon`, `iconEnd`, `busy`. Defaults to `type="button"`.                                                                                                                 |
| `buttonClassName()`                      | The button look for links (`Link`, `LaunchLink`) that must stay real links (`buttonStyles.ts`).                                                                                                                                                    |
| `IconButton`                             | Icon-only, required `label` (accessible name, also shown as a hover/focus tooltip). `tooltipAlign` for screen edges.                                                                                                                               |
| `Icon`                                   | Small hand-drawn 24×24 stroke set. Decorative (`aria-hidden`); the control provides the name.                                                                                                                                                      |
| `Card`                                   | Surface + CSS container. `interactive` makes the whole card the target of one inner link marked `data-card-action`.                                                                                                                                |
| `Badge`                                  | Short labels, six tones.                                                                                                                                                                                                                           |
| `AppBar`                                 | Top bar: start / centre / end slots, safe-area aware, sticky, translucent.                                                                                                                                                                         |
| `SkipLink`                               | First focusable element; moves focus to `#main` (or the game stage).                                                                                                                                                                               |
| `Dialog`                                 | Native `<dialog>` modal: focus trap, inert background, Escape, backdrop tap, focus returns to the opener. Bottom sheet on phones, centred above 40 rem. Never taller than the visible viewport; body scrolls. `data-autofocus` sets initial focus. |
| `ConfirmDialog`                          | `alertdialog` with the safe choice focused first. `tone="danger"` for losing progress.                                                                                                                                                             |
| `Dropdown`                               | WAI-ARIA menu button: arrow keys, Home/End, Escape returns focus, tap outside closes. Stays within the viewport.                                                                                                                                   |
| `TextField`                              | Label always present, hint and error wired with `aria-describedby`, `aria-invalid`, errors announced politely.                                                                                                                                     |
| `PlayerChip`                             | A player's name with optional position, `active` state, trailing slot and a 44 px remove button labelled "Remove ‹name›".                                                                                                                          |
| `GameTile`                               | Coloured tile with an interaction-style glyph. Colour rotates by catalogue position, so new games need no styling.                                                                                                                                 |
| `Spinner`, `LoadingMessage`              | Decorative spinner; `LoadingMessage` adds text announced via `role="status"`.                                                                                                                                                                      |
| `StatePanel`, `EmptyState`, `ErrorState` | Icon, heading (level configurable), explanation and actions. `ErrorState` is an `alert` by default.                                                                                                                                                |
| `Tooltip`                                | Hover _and_ focus, dismissible with Escape, takes no layout space when hidden.                                                                                                                                                                     |

### Setup foundation (`src/shared/ui/setup`)

- **`SetupScreen`**: layout only. Back button, heading, a column of sections, and a start button pinned to the bottom on phones (inline on wider screens). `startBlockedReason` disables start _and_ shows why next to it.
- **`SetupSection`**: a titled group of controls.
- **`PlayerSetup`**: controlled add/remove list built on `core/players` (cleaning, uniqueness, 24-character limit). Shows how many more players `requirements` needs, keeps focus in the field for fast entry, and announces every change.

None of these assumes a game needs players: a game can use all of them, some, or none.

### Game shell (`src/shared/ui/game`)

- **`GameShell`**: frame for a running game. Slots: `title`, `subtitle`, exit (`onExit` button or `exitTo` link), optional `confirmExit`, `rules` (help dialog), `menuItems`, `players`, `controls`, `children` (the stage). It has no turns, rounds, scores or flow. The game decides what goes in each slot and when.
- **`GameCompletion`**: end-of-game panel with optional Play again / Back to games. What "finished" means is up to the game.

## Accessibility checklist

Built in, and covered by tests where a browser can check it:

- Semantic landmarks (`header`, `main`, `nav`, `footer`), one `h1` per page, logical heading order.
- Skip link on every page.
- Visible focus ring everywhere (`:focus-visible`, 3 px, ≥ 3:1 contrast).
- Every control has an accessible name. Icon-only buttons require one.
- Forms: visible labels, hints and errors linked to the field, errors announced.
- Live announcements: loading (`status`), player added/removed, errors (`alert`), game completion.
- Modals trap focus and return it. Confirmations focus the safe choice.
- 44 px minimum targets, no hover-only interactions, no zoom lock.
- Reduced motion, higher contrast and forced colours respected.
- Content reflows at 320 px wide and at 200% text size without sideways scrolling.

What automated tests can't confirm: real screen-reader output (VoiceOver, TalkBack, NVDA), and behaviour on physical devices. Check these by hand before a public launch.

## Adding to the system

1. Need a colour, size or duration? Add a token to `tokens.css` first.
2. Put the component in `src/shared/ui` with a co-located `*.module.css`, and keep it presentational.
3. Make it work at 320 px, with touch, with a keyboard, and at 200% text.
4. Add it to `/design` (`src/showcase/DesignSystemPage.tsx`) and to this document.
