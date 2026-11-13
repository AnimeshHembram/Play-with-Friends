import type { GameDefinition, GameMeta } from './types';

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class GameRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameRegistryError';
  }
}

/** Returns a list of problems with a game's metadata. Empty means valid. */
export function validateGameMeta(meta: GameMeta): string[] {
  const problems: string[] = [];
  if (!ID_PATTERN.test(meta.id ?? '')) {
    problems.push(`id "${meta.id}" must be a lowercase slug like "truth-or-dare"`);
  }
  if (!meta.title?.trim()) problems.push('title is required');
  if (!meta.description?.trim()) problems.push('description is required');
  const { min, max } = meta.players ?? {};
  if (!Number.isInteger(min) || (min as number) < 0) {
    problems.push('players.min must be a whole number of 0 or more');
  }
  if (max !== null && (!Number.isInteger(max) || (max as number) < (min as number))) {
    problems.push('players.max must be null or a whole number no smaller than players.min');
  }
  if (!Array.isArray(meta.interaction) || meta.interaction.length === 0) {
    problems.push('interaction must list at least one style');
  }
  return problems;
}

export interface GameRegistry {
  register(definition: GameDefinition): void;
  get(id: string): GameDefinition | undefined;
  has(id: string): boolean;
  /** All games, sorted by `order` and then title. */
  list(): GameDefinition[];
}

/**
 * Creates a registry. Registration fails loudly (throws) on invalid metadata or
 * a duplicate id: both are developer mistakes that should break the build/tests,
 * not show up silently in production.
 */
export function createGameRegistry(initial: readonly GameDefinition[] = []): GameRegistry {
  const games = new Map<string, GameDefinition>();

  const register = (definition: GameDefinition) => {
    const problems = validateGameMeta(definition.meta);
    if (problems.length > 0) {
      throw new GameRegistryError(`Invalid game "${definition.meta?.id}": ${problems.join('; ')}`);
    }
    if (games.has(definition.meta.id)) {
      throw new GameRegistryError(`A game with id "${definition.meta.id}" is already registered`);
    }
    if (definition.load !== undefined && typeof definition.load !== 'function') {
      throw new GameRegistryError(`Game "${definition.meta.id}": load must be a function`);
    }
    games.set(definition.meta.id, definition);
  };

  initial.forEach(register);

  return {
    register,
    get: (id) => games.get(id),
    has: (id) => games.has(id),
    list: () =>
      [...games.values()].sort(
        (a, b) =>
          (a.meta.order ?? Number.MAX_SAFE_INTEGER) - (b.meta.order ?? Number.MAX_SAFE_INTEGER) ||
          a.meta.title.localeCompare(b.meta.title),
      ),
  };
}
