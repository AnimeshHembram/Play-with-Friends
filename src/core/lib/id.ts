/** Generates a unique identifier. Uses `crypto.randomUUID` where available. */
export type IdFactory = () => string;

let fallbackCounter = 0;

export const createId: IdFactory = () => {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  fallbackCounter += 1;
  return `id-${Date.now().toString(36)}-${fallbackCounter.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};
