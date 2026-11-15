import { Outlet } from 'react-router';
import { AppMenu } from './AppMenu';
import styles from './AppCanvas.module.css';

/**
 * The full-screen application canvas, shared by every route. It fills the
 * visible viewport on any device and in any orientation, and holds the one
 * piece of permanent chrome: the menu button in the top-left corner.
 */
export function AppCanvas() {
  return (
    <div className={styles.canvas}>
      <AppMenu />
      <Outlet />
    </div>
  );
}
