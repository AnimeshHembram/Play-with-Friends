import { shuffle } from './random';
import { browserRandom, type RandomSource } from './source';

/**
 * Draws items in random order without repeats until the pool runs out.
 * Useful for prompts and questions where seeing the same one twice in a row
 * feels broken.
 *
 * When exhausted:
 * - `'reshuffle'` (default): starts a new cycle, and makes sure the first item
 *   of the new cycle isn't the one that was just drawn.
 * - `'stop'`: `draw()` returns `undefined` until `reset()` is called.
 */
export interface NoRepeatPool<T> {
  draw(): T | undefined;
  /** Items left in the current cycle. */
  readonly remaining: number;
  readonly size: number;
  reset(): void;
}

export interface NoRepeatPoolOptions {
  rng?: RandomSource;
  onExhausted?: 'reshuffle' | 'stop';
}

export function createNoRepeatPool<T>(
  items: readonly T[],
  { rng = browserRandom, onExhausted = 'reshuffle' }: NoRepeatPoolOptions = {},
): NoRepeatPool<T> {
  const source = [...items];
  let queue: T[] = shuffle(source, rng);
  let last: T | undefined;
  let hasLast = false;

  const refill = () => {
    queue = shuffle(source, rng);
    // Avoid an immediate repeat across cycle boundaries.
    if (hasLast && queue.length > 1 && Object.is(queue[0], last)) {
      const swap = 1 + Math.floor(rng.next() * (queue.length - 1));
      [queue[0], queue[swap]] = [queue[swap] as T, queue[0] as T];
    }
  };

  return {
    draw() {
      if (queue.length === 0) {
        if (onExhausted === 'stop' || source.length === 0) return undefined;
        refill();
      }
      const item = queue.shift() as T;
      last = item;
      hasLast = true;
      return item;
    },
    get remaining() {
      return queue.length;
    },
    get size() {
      return source.length;
    },
    reset() {
      queue = shuffle(source, rng);
      last = undefined;
      hasLast = false;
    },
  };
}
