/** Route paths in one place, so links and routes can't drift apart. */
export const paths = {
  landing: '/',
  play: '/play',
  game: (gameId: string) => `/play/${encodeURIComponent(gameId)}`,
  /** Living design-system reference (components, tokens, layout demos). */
  design: '/design',
  designSetup: '/design/setup',
  designShell: '/design/shell',
} as const;
