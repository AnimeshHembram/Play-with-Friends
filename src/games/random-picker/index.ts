import { defineGame } from '@/core/games';

/**
 * Random Picker — planned. Metadata only.
 * Add `load: () => import('./RandomPickerGame')` when the game's entry component exists.
 */
export default defineGame({
  meta: {
    id: 'random-picker',
    title: 'Random Picker',
    description: 'Let the app pick a person or an option at random.',
    players: { min: 2, max: null },
    interaction: ['single-action'],
    order: 4,
  },
});
