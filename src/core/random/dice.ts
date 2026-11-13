import { randomInt } from './random';
import { browserRandom, type RandomSource } from './source';

export interface DiceRoll {
  readonly values: readonly number[];
  readonly total: number;
}

export const MAX_DICE = 100;

export function rollDie(sides = 6, rng: RandomSource = browserRandom): number {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new RangeError('rollDie: a die needs a whole number of sides, at least 2');
  }
  return randomInt(1, sides, rng);
}

export function rollDice(count = 1, sides = 6, rng: RandomSource = browserRandom): DiceRoll {
  if (!Number.isInteger(count) || count < 1 || count > MAX_DICE) {
    throw new RangeError(`rollDice: count must be a whole number from 1 to ${MAX_DICE}`);
  }
  const values = Array.from({ length: count }, () => rollDie(sides, rng));
  return { values, total: values.reduce((a, b) => a + b, 0) };
}
