import { defineGame } from '@/core/games';

/**
 * Truth or Dare — planned. Metadata only.
 * Add `load: () => import('./TruthOrDareGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    description: 'Take turns choosing a truth to answer or a dare to perform.',
    players: { min: 2, max: null },
    interaction: ['turn-based'],
    order: 1,
  },
});
