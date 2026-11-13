import { defineGame } from '@/core/games';

/**
 * Never Have I Ever — planned. Metadata only.
 * Add `load: () => import('./NeverHaveIEverGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'never-have-i-ever',
    title: 'Never Have I Ever',
    description: 'Hear a statement and own up if you have done it.',
    players: { min: 2, max: null },
    interaction: ['simultaneous'],
    order: 2,
  },
});
