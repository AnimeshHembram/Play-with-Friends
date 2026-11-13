import { defineGame } from '@/core/games';

/**
 * Dumb Charades — planned. Metadata only.
 * Add `load: () => import('./DumbCharadesGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'dumb-charades',
    title: 'Dumb Charades',
    description: 'Act out a word or film without speaking while your team guesses.',
    players: { min: 4, max: null },
    interaction: ['team-based', 'turn-based'],
    order: 5,
  },
});
