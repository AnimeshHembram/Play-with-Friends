import { createId, type IdFactory } from '../lib/id';
import { fail, ok, type Result } from '../lib/result';

/**
 * Player management foundations.
 *
 * Players are plain data, and every operation returns a new list instead of
 * mutating the old one. That keeps them easy to put in React state and makes
 * the order of the list the single source of truth for "player order".
 *
 * Nothing here knows about turns. A game that needs turns builds them on top
 * of the ordered list. A game that does not (dice, card picking) can ignore
 * players entirely.
 */
export interface Player {
  readonly id: string;
  readonly name: string;
}

export type PlayerList = readonly Player[];

export const PLAYER_NAME_MAX_LENGTH = 24;
export const DEFAULT_MAX_PLAYERS = 20;

export type PlayerErrorCode =
  | 'name-empty'
  | 'name-too-long'
  | 'name-duplicate'
  | 'player-limit-reached'
  | 'player-not-found'
  | 'index-out-of-range';

export type PlayerResult<T> = Result<T, PlayerErrorCode>;

/** Trims the name and collapses internal runs of whitespace to one space. */
export function normalizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Validates a name against the current list. Names are compared
 * case-insensitively so "Ravi" and "ravi" can't both join.
 * Pass `ignoreId` when renaming so a player can keep their own name.
 */
export function validatePlayerName(
  rawName: string,
  players: PlayerList,
  ignoreId?: string,
): PlayerResult<string> {
  const name = normalizePlayerName(rawName);
  if (name.length === 0) return fail('name-empty', 'Enter a name for the player.');
  if (name.length > PLAYER_NAME_MAX_LENGTH) {
    return fail(
      'name-too-long',
      `Player names can be at most ${PLAYER_NAME_MAX_LENGTH} characters.`,
    );
  }
  const key = name.toLocaleLowerCase();
  const taken = players.some((p) => p.id !== ignoreId && p.name.toLocaleLowerCase() === key);
  if (taken) return fail('name-duplicate', `"${name}" is already playing.`);
  return ok(name);
}

export interface AddPlayerOptions {
  maxPlayers?: number;
  idFactory?: IdFactory;
}

export function addPlayer(
  players: PlayerList,
  rawName: string,
  { maxPlayers = DEFAULT_MAX_PLAYERS, idFactory = createId }: AddPlayerOptions = {},
): PlayerResult<PlayerList> {
  if (players.length >= maxPlayers) {
    return fail('player-limit-reached', `A game can have at most ${maxPlayers} players.`);
  }
  const validated = validatePlayerName(rawName, players);
  if (!validated.ok) return validated;
  return ok([...players, { id: idFactory(), name: validated.value }]);
}

export function removePlayer(players: PlayerList, id: string): PlayerResult<PlayerList> {
  if (!players.some((p) => p.id === id)) return notFound();
  return ok(players.filter((p) => p.id !== id));
}

export function renamePlayer(
  players: PlayerList,
  id: string,
  rawName: string,
): PlayerResult<PlayerList> {
  if (!players.some((p) => p.id === id)) return notFound();
  const validated = validatePlayerName(rawName, players, id);
  if (!validated.ok) return validated;
  return ok(players.map((p) => (p.id === id ? { ...p, name: validated.value } : p)));
}

/** Moves a player to a new position in the order. */
export function movePlayer(
  players: PlayerList,
  id: string,
  toIndex: number,
): PlayerResult<PlayerList> {
  const fromIndex = players.findIndex((p) => p.id === id);
  if (fromIndex === -1) return notFound();
  if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= players.length) {
    return fail('index-out-of-range', 'That position is outside the player list.');
  }
  const next = [...players];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved as Player);
  return ok(next);
}

function notFound() {
  return fail('player-not-found' as const, 'That player is no longer in the game.');
}
