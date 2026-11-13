import { GameRegistryError } from './registry';
import type { GameDefinition } from './types';

/**
 * Turns the result of `import.meta.glob('<games>/*\/index.ts', { eager: true })`
 * into a list of game definitions.
 *
 * Each game folder's `index.ts` must `export default defineGame({...})`.
 * Kept separate from the glob call itself so it can be tested with plain objects.
 */
export function collectGameDefinitions(modules: Record<string, unknown>): GameDefinition[] {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => {
      const def = (mod as { default?: unknown } | null)?.default as GameDefinition | undefined;
      if (!def || typeof def !== 'object' || !def.meta) {
        throw new GameRegistryError(
          `${path} must have a default export created with defineGame({ meta, load? })`,
        );
      }
      const folder = path.split('/').at(-2);
      if (folder && folder !== def.meta.id) {
        throw new GameRegistryError(
          `${path}: folder name "${folder}" must match the game id "${def.meta.id}"`,
        );
      }
      return def;
    });
}
