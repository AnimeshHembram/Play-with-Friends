import { Link } from 'react-router';
import { appConfig } from './config';
import styles from './Brand.module.css';

/** The logo mark: two stacked cards with dice pips. Decorative. */
export function BrandMark({ size = '2rem' }: { size?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={styles.mark}
    >
      <rect
        x="5"
        y="9"
        width="17"
        height="17"
        rx="5"
        fill="var(--color-tile-3)"
        transform="rotate(-10 13.5 17.5)"
      />
      <rect x="10" y="5" width="17" height="17" rx="5" fill="var(--color-tile-1)" />
      <circle cx="14.5" cy="9.5" r="1.8" fill="var(--color-tile-ink)" />
      <circle cx="18.5" cy="13.5" r="1.8" fill="var(--color-tile-ink)" />
      <circle cx="22.5" cy="17.5" r="1.8" fill="var(--color-tile-ink)" />
    </svg>
  );
}

/**
 * Logo + wordmark, linking home. On the narrowest phones only the mark is
 * shown (the link keeps its full accessible name).
 */
export function Brand({ to = '/', compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className={styles.brand} aria-label={`${appConfig.appName} home`}>
      <BrandMark />
      <span className={compact ? 'visually-hidden' : styles.wordmark}>{appConfig.appName}</span>
    </Link>
  );
}
