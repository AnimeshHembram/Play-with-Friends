import { INTERACTION_STYLES, type GameDefinition } from './types';

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class GameRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameRegistryError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isWholeNumber = (value: unknown, min: number): value is number =>
  Number.isInteger(value) && (value as number) >= min;

/**
 * Returns a list of problems with a game's metadata. Empty means valid.
 * Accepts `unknown` so malformed input (a plain JS module, future JSON) is
 * reported as a readable problem instead of crashing with a TypeError.
 */
export function validateGameMeta(meta: unknown): string[] {
  if (!isRecord(meta)) return ['meta must be an object'];
  const problems: string[] = [];

  if (typeof meta.id !== 'string' || !ID_PATTERN.test(meta.id)) {
    problems.push(`id ${JSON.stringify(meta.id)} must be a lowercase slug like "truth-or-dare"`);
  }
  if (!isNonEmptyString(meta.title)) problems.push('title must be a non-empty string');
  if (!isNonEmptyString(meta.description)) problems.push('description must be a non-empty string');

  const players = meta.players;
  if (!isRecord(players)) {
    problems.push('players must be an object like { min: 2, max: null }');
  } else {
    if (!isWholeNumber(players.min, 0)) {
      problems.push('players.min must be a whole number of 0 or more');
    } else if (
      players.max !== null &&
      (!isWholeNumber(players.max, 1) || (players.max as number) < players.min)
    ) {
      problems.push('players.max must be null or a whole number no smaller than players.min');
    }
  }

  const interaction = meta.interaction;
  if (!Array.isArray(interaction) || interaction.length === 0) {
    problems.push('interaction must list at least one style');
  } else {
    const unknown = interaction.filter(
      (style) => !(INTERACTION_STYLES as readonly unknown[]).includes(style),
    );
    if (unknown.length > 0) {
      problems.push(
        `interaction has unknown style(s) ${unknown.map((u) => JSON.stringify(u)).join(', ')}; ` +
          `allowed: ${INTERACTION_STYLES.join(', ')}`,
      );
    }
  }

  if (meta.order !== undefined && !Number.isFinite(meta.order)) {
    problems.push('order must be a finite number when set');
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

/** Throws a GameRegistryError if the definition is not a valid game. */
export function assertValidGameDefinition(
  definition: unknown,
): asserts definition is GameDefinition {
  if (!isRecord(definition)) {
    throw new GameRegistryError('A game definition must be an object created with defineGame()');
  }
  const meta = definition.meta;
  const label = isRecord(meta) && typeof meta.id === 'string' ? `"${meta.id}"` : '(unknown id)';
  const problems = validateGameMeta(meta);
  if (definition.load !== undefined && typeof definition.load !== 'function') {
    problems.push('load must be a function when set');
  }
  if (problems.length > 0) {
    throw new GameRegistryError(`Invalid game ${label}: ${problems.join('; ')}`);
  }
}

/**
 * Creates a registry. Registration fails loudly (throws) on an invalid
 * definition or a duplicate id: both are developer mistakes. For the app's
 * production behaviour (skip and report instead of throwing), see
 * `buildGameRegistry` in discovery.ts.
 */
export function createGameRegistry(initial: readonly GameDefinition[] = []): GameRegistry {
  const games = new Map<string, GameDefinition>();

  const register = (definition: GameDefinition) => {
    assertValidGameDefinition(definition);
    if (games.has(definition.meta.id)) {
      throw new GameRegistryError(`A game with id "${definition.meta.id}" is already registered`);
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
