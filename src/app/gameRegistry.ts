import { collectGameDefinitions, createGameRegistry } from '@/core/games';

/**
 * Discovers every game folder automatically. Adding a game means adding
 * `src/games/<id>/index.ts`; nothing in the app layer needs to change.
 *
 * Only metadata is loaded eagerly. Each game's actual code stays in its own
 * chunk until someone opens that game (see `GameDefinition.load`).
 */
const modules = import.meta.glob('../games/*/index.ts', { eager: true });

export const gameRegistry = createGameRegistry(collectGameDefinitions(modules));
