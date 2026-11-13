import { defineGame } from '@/core/games';

/**
 * Pick a Card — planned. Metadata only.
 * Add `load: () => import('./PickACardGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'pick-a-card',
    title: 'Pick a Card',
    description: 'Draw a card from a shuffled deck.',
    players: { min: 0, max: null },
    interaction: ['single-action'],
    order: 7,
  },
});
