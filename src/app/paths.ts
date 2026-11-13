/** Route paths in one place, so links and routes can't drift apart. */
export const paths = {
  landing: '/',
  play: '/play',
  game: (gameId: string) => `/play/${encodeURIComponent(gameId)}`,
} as const;
