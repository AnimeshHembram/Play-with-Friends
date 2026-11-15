import { Brand } from '@/app/Brand';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { PageTitle } from '@/app/PageTitle';
import { SiteFooter } from '@/app/SiteFooter';
import { AppBar } from '@/shared/ui/AppBar';
import { EmptyState } from '@/shared/ui/StatePanel';
import { SkipLink } from '@/shared/ui/SkipLink';
import { GameCard } from './GameCard';
import styles from './GameSelectionPage.module.css';

/** The game catalogue: every game the registry discovered, in catalogue order. */
export function GameSelectionPage() {
  const games = useGameRegistry().list();
  return (
    <>
      <PageTitle title="Choose a game" />
      <SkipLink />
      <AppBar start={<Brand />} />
      <main id="main" tabIndex={-1} className="page-main">
        <div className={`container ${styles.content}`}>
          <header className={styles.heading}>
            <h1 className={styles.title}>Choose a game</h1>
            <p className={styles.intro}>
              {games.length > 0
                ? 'Pick something for your group. Every game runs right here in your browser.'
                : 'Check back soon.'}
            </p>
          </header>
          {games.length === 0 ? (
            <EmptyState title="No games are available yet." headingLevel={2} />
          ) : (
            <ul aria-label="Games" className={styles.grid}>
              {games.map((game, index) => (
                <GameCard key={game.meta.id} game={game} index={index} />
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
