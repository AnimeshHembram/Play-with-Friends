import { fail, ok, type Result } from '../lib/result';
import type { PlayerRequirements } from './types';

export type PlayerCountErrorCode = 'too-few-players' | 'too-many-players' | 'invalid-count';

/**
 * Checks a player count against a game's declared requirements.
 * Only checks the number: how players take part is up to each game.
 */
export function checkPlayerCount(
  requirements: PlayerRequirements,
  count: number,
): Result<number, PlayerCountErrorCode> {
  if (!Number.isInteger(count) || count < 0) {
    return fail('invalid-count', 'The number of players must be a whole number of 0 or more.');
  }
  const { min, max } = requirements;
  if (count < min) {
    return fail(
      'too-few-players',
      `This game needs at least ${min} ${min === 1 ? 'player' : 'players'}.`,
    );
  }
  if (max !== null && count > max) {
    return fail(
      'too-many-players',
      `This game allows at most ${max} ${max === 1 ? 'player' : 'players'}.`,
    );
  }
  return ok(count);
}
