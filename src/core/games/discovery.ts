import { createGameRegistry, GameRegistryError, type GameRegistry } from './registry';
import type { GameDefinition } from './types';

/**
 * Turns one entry of `import.meta.glob('<games>/*\/index.ts', { eager: true })`
 * into a game definition, checking the shape and that the folder name matches
 * the game id. Full metadata validation happens when the game is registered.
 */
export function toGameDefinition(path: string, mod: unknown): GameDefinition {
  const def = (mod as { default?: unknown } | null)?.default;
  if (typeof def !== 'object' || def === null || !('meta' in def)) {
    throw new GameRegistryError(
      `${path} must have a default export created with defineGame({ meta, load? })`,
    );
  }
  const meta = (def as { meta: unknown }).meta;
  const id = typeof meta === 'object' && meta !== null ? (meta as { id?: unknown }).id : undefined;
  if (typeof id !== 'string') {
    throw new GameRegistryError(`${path}: meta must be an object with a string id`);
  }
  const folder = path.split('/').at(-2);
  if (folder && folder !== id) {
    throw new GameRegistryError(`${path}: folder name "${folder}" must match the game id "${id}"`);
  }
  return def as GameDefinition;
}

/** All modules at once. Throws on the first problem. */
export function collectGameDefinitions(modules: Record<string, unknown>): GameDefinition[] {
  return sortedEntries(modules).map(([path, mod]) => toGameDefinition(path, mod));
}

export interface BuildGameRegistryOptions {
  /**
   * true:  throw on the first invalid game (development and tests, so CI fails).
   * false: skip invalid games, report each one through `onError`, keep the rest
   *        (production, so one broken game can't take down the platform).
   */
  strict: boolean;
  onError?: (error: unknown, path: string) => void;
}

export function buildGameRegistry(
  modules: Record<string, unknown>,
  { strict, onError }: BuildGameRegistryOptions,
): GameRegistry {
  if (strict) return createGameRegistry(collectGameDefinitions(modules));

  const registry = createGameRegistry();
  for (const [path, mod] of sortedEntries(modules)) {
    try {
      registry.register(toGameDefinition(path, mod));
    } catch (error) {
      onError?.(error, path);
    }
  }
  return registry;
}

function sortedEntries(modules: Record<string, unknown>) {
  return Object.entries(modules).sort(([a], [b]) => a.localeCompare(b));
}
