import { Spinner } from './Spinner';
import styles from './StatePanel.module.css';

/**
 * Full-area loading state. The text is announced politely by screen readers
 * (role="status"); the spinner is decoration.
 */
export function LoadingMessage({ children = 'Loading…' }: { children?: string }) {
  return (
    <div className="status-page">
      <div className={styles.panel} role="status">
        <Spinner size="lg" />
        <p className={styles.loadingText}>{children}</p>
      </div>
    </div>
  );
}
