import { NavLink, Outlet } from 'react-router';
import { Brand } from '@/app/Brand';
import { paths } from '@/app/paths';
import styles from './Showcase.module.css';

/**
 * Living design-system reference. Not linked from the product UI and marked
 * noindex; it exists so designers and developers can see every shared
 * component, and so the responsive browser tests can exercise them.
 */
export function ShowcaseLayout() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <Outlet />
    </>
  );
}

export function ShowcaseNav() {
  return (
    <div className={styles.navRow}>
      <Brand />
      <nav aria-label="Design system" className={styles.nav}>
        <NavLink to={paths.design} end>
          Components
        </NavLink>
        <NavLink to={paths.designSetup}>Setup demo</NavLink>
        <NavLink to={paths.designShell}>Game shell demo</NavLink>
      </nav>
    </div>
  );
}
