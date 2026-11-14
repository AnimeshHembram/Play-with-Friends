import { browserRandom, type RandomSource } from './source';

/**
 * Largest range randomInt supports. Random sources have 32 bits of resolution
 * (the browser source uses one Uint32 per draw), so wider ranges would leave
 * some values unreachable.
 */
export const MAX_RANDOM_RANGE = 2 ** 32;

/** Integer in [min, max], both inclusive. */
export function randomInt(min: number, max: number, rng: RandomSource = browserRandom): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new RangeError('randomInt: min and max must be safe integers');
  }
  if (min > max) throw new RangeError('randomInt: min must not be greater than max');
  const range = max - min + 1;
  if (range > MAX_RANDOM_RANGE) {
    throw new RangeError(`randomInt: range must not exceed ${MAX_RANDOM_RANGE} values`);
  }
  const x = rng.next();
  if (!(x >= 0 && x < 1)) {
    throw new RangeError(`randomInt: RandomSource.next() returned ${x}, expected [0, 1)`);
  }
  return min + Math.floor(x * range);
}

/** One random item. Throws on an empty list. */
export function pickOne<T>(items: readonly T[], rng: RandomSource = browserRandom): T {
  if (items.length === 0) throw new RangeError('pickOne: cannot pick from an empty list');
  return items[randomInt(0, items.length - 1, rng)] as T;
}

/** A new, shuffled copy of the list (Fisher–Yates). The input is not modified. */
export function shuffle<T>(items: readonly T[], rng: RandomSource = browserRandom): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i, rng);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** `count` distinct items, without replacement. */
export function pickMany<T>(
  items: readonly T[],
  count: number,
  rng: RandomSource = browserRandom,
): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('pickMany: count must be a non-negative integer');
  }
  if (count > items.length) {
    throw new RangeError(`pickMany: cannot pick ${count} from ${items.length} items`);
  }
  return shuffle(items, rng).slice(0, count);
}
