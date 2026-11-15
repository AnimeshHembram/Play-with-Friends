import { Outlet } from 'react-router';
import styles from './PlayLayout.module.css';

/**
 * Shell for the gaming experience (everything under /play).
 * Each screen brings its own top bar: the catalogue has the site header,
 * a running game has the game shell's bar. This layout only provides a
 * full-height column for them to fill.
 */
export function PlayLayout() {
  return (
    <div className={styles.layout}>
      <Outlet />
    </div>
  );
}
