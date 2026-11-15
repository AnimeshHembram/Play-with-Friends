import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Icon } from './Icon';
import styles from './PlayerChip.module.css';

interface PlayerChipProps {
  name: string;
  /** Position in the list (1-based), shown as a small number when set. */
  position?: number;
  /** Marks the player as active/current (e.g. whose turn it is), if a game wants that. */
  active?: boolean;
  /** When set, shows a remove button labelled "Remove <name>". */
  onRemove?: () => void;
  /** Extra content after the name (a score, a team badge…). Game-owned. */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Shows one player. Purely presentational: it doesn't know about turns,
 * teams or scores. Games decide what `active` and `trailing` mean.
 */
export function PlayerChip({
  name,
  position,
  active = false,
  onRemove,
  trailing,
  className,
}: PlayerChipProps) {
  return (
    <span
      className={cx(styles.chip, active && styles.active, className)}
      data-active={active || undefined}
    >
      {position !== undefined ? (
        <span className={styles.position} aria-hidden="true">
          {position}
        </span>
      ) : (
        <span className={styles.avatar} aria-hidden="true">
          <Icon name="user" size="1em" />
        </span>
      )}
      <span className={styles.name}>{name}</span>
      {active && <span className="visually-hidden"> (current)</span>}
      {trailing}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <Icon name="close" size="1.1em" />
        </button>
      )}
    </span>
  );
}
