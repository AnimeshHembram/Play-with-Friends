import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './AppBar.module.css';

interface AppBarProps {
  /** Left side: brand or back button. */
  start?: ReactNode;
  /** Centre: a page or game title. Truncates instead of pushing other items off-screen. */
  center?: ReactNode;
  /** Right side: actions. */
  end?: ReactNode;
  /** Stick to the top while scrolling. Default true. */
  sticky?: boolean;
  /** Content width: `lg` for pages, `md` for game screens. */
  width?: 'md' | 'lg';
  className?: string;
  /** Accessible label for the header landmark, when a page has more than one. */
  label?: string;
}

/**
 * The top bar layout used by every screen. It handles the hard parts once:
 * the notch/status-bar safe area, landscape side insets, a stable 3-slot
 * layout where the title shrinks first, and a translucent sticky background.
 */
export function AppBar({
  start,
  center,
  end,
  sticky = true,
  width = 'lg',
  className,
  label,
}: AppBarProps) {
  return (
    <header className={cx(styles.bar, sticky && styles.sticky, className)} aria-label={label}>
      <div className={cx('container', width === 'md' && 'container-md', styles.inner)}>
        <div className={styles.start}>{start}</div>
        {center !== undefined && <div className={styles.center}>{center}</div>}
        <div className={styles.end}>{end}</div>
      </div>
    </header>
  );
}
