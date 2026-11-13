/**
 * Every randomization helper takes an optional `RandomSource`.
 * In the app this defaults to the browser's crypto RNG. In tests (or a future
 * "replay this round" feature) you can pass a seeded source for repeatable results.
 */
export interface RandomSource {
  /** Returns a float in [0, 1). */
  next(): number;
}

const UINT32_RANGE = 0x1_0000_0000;

/** Uses `crypto.getRandomValues`, falling back to `Math.random` if it's missing. */
export const browserRandom: RandomSource = {
  next() {
    const c = globalThis.crypto;
    if (c && typeof c.getRandomValues === 'function') {
      const buf = new Uint32Array(1);
      c.getRandomValues(buf);
      return (buf[0] as number) / UINT32_RANGE;
    }
    return Math.random();
  },
};

/** Deterministic source (mulberry32). Same seed, same sequence. Not for security. */
export function createSeededRandom(seed: number): RandomSource {
  let a = seed >>> 0;
  return {
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
    },
  };
}
