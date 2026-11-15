import { cx } from '../lib/cx';
import styles from './Spinner.module.css';

/**
 * Decorative loading indicator. Always pair it with visible or screen-reader
 * text (see LoadingMessage) — the spinner itself is hidden from assistive tech.
 * With reduced motion it pulses gently instead of spinning.
 */
export function Spinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return <span className={cx(styles.spinner, styles[size], className)} aria-hidden="true" />;
}
