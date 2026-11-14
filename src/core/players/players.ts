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

// Control characters and invisible formatting characters (zero-width spaces,
// direction marks, BOM...) are removed. The zero-width joiner (U+200D) is kept
// because emoji such as family or profession emoji are built with it.
const INVISIBLE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;
const ZWJ = '\u200D';
// A name must contain at least one letter, number, symbol (incl. emoji) or punctuation mark.
const VISIBLE = /[\p{L}\p{N}\p{S}\p{P}]/u;

/**
 * Cleans a name: removes control/invisible characters, trims, and collapses
 * internal runs of whitespace to one space.
 */
export function normalizePlayerName(name: string): string {
  return name
    .replace(INVISIBLE, (ch) => (ch === ZWJ ? ch : ''))
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Length as a person would count it: "👨‍👩‍👧" is one character, not eight.
 * Falls back to counting code points where Intl.Segmenter is unavailable.
 */
export function visibleLength(text: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text))
      .length;
  }
  return [...text].length;
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
  const name = typeof rawName === 'string' ? normalizePlayerName(rawName) : '';
  if (!VISIBLE.test(name)) return fail('name-empty', 'Enter a name for the player.');
  if (visibleLength(name) > PLAYER_NAME_MAX_LENGTH) {
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
  /** Whole number, 1 or more. Defaults to DEFAULT_MAX_PLAYERS. */
  maxPlayers?: number;
  idFactory?: IdFactory;
}

export function addPlayer(
  players: PlayerList,
  rawName: string,
  { maxPlayers = DEFAULT_MAX_PLAYERS, idFactory = createId }: AddPlayerOptions = {},
): PlayerResult<PlayerList> {
  if (!Number.isInteger(maxPlayers) || maxPlayers < 1) {
    throw new RangeError('addPlayer: maxPlayers must be a whole number of 1 or more');
  }
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
