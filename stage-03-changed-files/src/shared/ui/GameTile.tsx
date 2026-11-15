import type { InteractionStyle } from '@/core/games';
import { cx } from '../lib/cx';
import { Icon, type IconName } from './Icon';
import styles from './GameTile.module.css';

/** Icon for each interaction style, so a tile hints at how the game is played. */
const INTERACTION_ICON: Record<InteractionStyle, IconName> = {
  'turn-based': 'turns',
  simultaneous: 'everyone',
  'team-based': 'teams',
  'single-action': 'tap',
};

export const TILE_COLOR_COUNT = 7;

interface GameTileProps {
  /** The game's interaction styles; the first one picks the glyph. */
  interaction: readonly InteractionStyle[];
  /**
   * Position in the catalogue. Colours rotate through the palette by position,
   * so the platform needs no per-game styling and new games get a colour
   * automatically.
   */
  index: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** The coloured square that represents a game. Decorative. */
export function GameTile({ interaction, index, size = 'md', className }: GameTileProps) {
  const icon = interaction[0] ? INTERACTION_ICON[interaction[0]] : 'sparkle';
  const colour = (((index % TILE_COLOR_COUNT) + TILE_COLOR_COUNT) % TILE_COLOR_COUNT) + 1;
  return (
    <span
      className={cx(styles.tile, styles[size], className)}
      style={{ ['--tile-bg' as string]: `var(--color-tile-${colour})` }}
      aria-hidden="true"
    >
      <Icon name={icon} size="50%" strokeWidth={2.25} />
    </span>
  );
}
