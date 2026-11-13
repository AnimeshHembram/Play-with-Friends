import { defineGame } from '@/core/games';

/**
 * Who's Most Likely To? — planned. Metadata only.
 * Add `load: () => import('./MostLikelyToGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'most-likely-to',
    title: "Who's Most Likely To?",
    description: 'Read a prompt and point at the friend who fits it best.',
    players: { min: 3, max: null },
    interaction: ['simultaneous'],
    order: 3,
  },
});
