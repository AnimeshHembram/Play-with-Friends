import { Link } from 'react-router';
import { BrandMark } from './Brand';
import { appConfig } from './config';
import { paths } from './paths';
import styles from './SiteFooter.module.css';

/** Footer for the landing page and the game catalogue. Game screens have none. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.brand}>
          <BrandMark size="1.5rem" />
          <span>{appConfig.appName}</span>
        </p>
        <p className={styles.note}>Free party games in your browser. No accounts, no installs.</p>
        <nav aria-label="Footer" className={styles.nav}>
          <Link to={paths.landing}>Home</Link>
          <Link to={paths.play}>All games</Link>
        </nav>
      </div>
    </footer>
  );
}
