import { buildGameRegistry } from '@/core/games';
import { reportError } from '@/shared/lib/reportError';

/**
 * Discovers every game folder automatically. Adding a game means adding
 * `src/games/<id>/index.ts`; nothing in the app layer needs to change.
 *
 * Only metadata is loaded eagerly. Each game's actual code stays in its own
 * chunk until someone opens that game (see `GameDefinition.load`).
 *
 * Invalid games:
 * - development and tests (`npm run dev`, `npm test`, CI): throw immediately,
 *   so the mistake is impossible to miss and CI fails.
 * - production builds: skip the broken game and report it; every other game
 *   keeps working.
 */
const modules = import.meta.glob('../games/*/index.ts', { eager: true });

export const gameRegistry = buildGameRegistry(modules, {
  strict: !import.meta.env.PROD,
  onError: (error, path) => reportError(error, `skipped invalid game module ${path}`),
});
