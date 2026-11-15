import type { GameMeta, InteractionStyle } from '@/core/games';

/** Human-friendly player requirement: "2+ players", "3–8 players", "Any group size". */
export function playersLabel({ min, max }: GameMeta['players']): string {
  if (min === 0 && max === null) return 'Any group size';
  if (max === null) return `${min}+ players`;
  if (min === max) return `${min} ${min === 1 ? 'player' : 'players'}`;
  return `${min}–${max} players`;
}

const INTERACTION_LABEL: Record<InteractionStyle, string> = {
  'turn-based': 'Take turns',
  simultaneous: 'Everyone at once',
  'team-based': 'Teams',
  'single-action': 'Quick tap',
};

/** Short label for how a game is played, from its first interaction style. */
export function interactionLabel(interaction: GameMeta['interaction']): string | null {
  const first = interaction[0];
  return first ? INTERACTION_LABEL[first] : null;
}
