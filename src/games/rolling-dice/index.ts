import { defineGame } from '@/core/games';

/**
 * Rolling Dice — planned. Metadata only.
 * Add `load: () => import('./RollingDiceGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'rolling-dice',
    title: 'Rolling Dice',
    description: 'Roll one or more dice.',
    players: { min: 0, max: null },
    interaction: ['single-action'],
    order: 6,
  },
});
