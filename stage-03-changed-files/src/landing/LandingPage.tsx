import { appConfig } from '@/app/config';
import { Brand } from '@/app/Brand';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { playersLabel } from '@/app/gameLabels';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import { SiteFooter } from '@/app/SiteFooter';
import { AppBar } from '@/shared/ui/AppBar';
import { Badge } from '@/shared/ui/Badge';
import { buttonClassName } from '@/shared/ui/buttonStyles';
import { Card } from '@/shared/ui/Card';
import { GameTile } from '@/shared/ui/GameTile';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { LaunchLink } from '@/shared/ui/LaunchLink';
import { SkipLink } from '@/shared/ui/SkipLink';
import styles from './LandingPage.module.css';

const PROMISES: { icon: IconName; text: string }[] = [
  { icon: 'lock', text: 'No account needed' },
  { icon: 'download', text: 'Nothing to install' },
  { icon: 'device', text: 'Works on any device' },
];

const STEPS = [
  { title: 'Open the site', text: 'On a phone, tablet or laptop. Any modern browser works.' },
  { title: 'Pick a game', text: 'Choose from the catalogue. Each game explains its own rules.' },
  {
    title: 'Play together',
    text: 'Pass one device around the room, or let everyone use their own.',
  },
];

/**
 * Landing page: introduces the platform and sends people to the games.
 * Everything that launches the games is a real link that opens /play in a
 * new tab (see LaunchLink), so this page stays open behind it.
 */
export function LandingPage() {
  const games = useGameRegistry().list();

  return (
    <>
      <PageTitle />
      <SkipLink />
      <AppBar
        start={<Brand />}
        end={
          <>
            <nav aria-label="Page sections" className={styles.sectionNav}>
              <a href="#how">How it works</a>
              <a href="#games">Games</a>
            </nav>
            <LaunchLink
              href={paths.play}
              className={buttonClassName({ variant: 'primary', size: 'sm' })}
            >
              Play now
            </LaunchLink>
          </>
        }
      />

      <main id="main" tabIndex={-1} className="page-main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <Badge tone="secondary" icon="sparkle">
                Free party games
              </Badge>
              <h1 id="hero-title" className={styles.heroTitle}>
                {appConfig.appName}
              </h1>
              <p className={styles.lead}>
                Party games for any room. Open the site, pick a game and play — together on one
                screen, or each on your own device.
              </p>
              <div className={styles.ctaRow}>
                <LaunchLink
                  href={paths.play}
                  className={buttonClassName({
                    variant: 'primary',
                    size: 'lg',
                    className: styles.cta,
                  })}
                >
                  Let’s Play
                  <Icon name="arrow-right" />
                </LaunchLink>
                <a href="#games" className={buttonClassName({ variant: 'secondary', size: 'lg' })}>
                  See the games
                </a>
              </div>
              <ul className={styles.promises} aria-label="Why it's easy">
                {PROMISES.map((item) => (
                  <li key={item.text}>
                    <Icon name={item.icon} size="1.1em" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.heroArt} aria-hidden="true">
              <div className={`${styles.artCard} ${styles.artCardBack}`}>
                <span className={styles.artCorner}>!</span>
              </div>
              <div className={`${styles.artCard} ${styles.artCardMid}`}>
                <span className={styles.artCorner}>?</span>
              </div>
              <div className={`${styles.artCard} ${styles.artCardFront}`}>
                <span className={styles.pips}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how" className={styles.section} aria-labelledby="how-title">
          <div className="container">
            <div className={styles.sectionHeading}>
              <h2 id="how-title">How it works</h2>
              <p>Three steps, no setup screens full of forms.</p>
            </div>
            <ol className={styles.steps}>
              {STEPS.map((step, index) => (
                <Card as="li" key={step.title} padding="lg" className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Card>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Games preview ────────────────────────────────────── */}
        <section
          id="games"
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="games-title"
        >
          <div className="container">
            <div className={styles.sectionHeading}>
              <h2 id="games-title">
                {games.length} {games.length === 1 ? 'game' : 'games'}, one link
              </h2>
              <p>
                Classics for every kind of group — from quick dice rolls to full rounds of charades.
              </p>
            </div>
            <ul className={styles.gameGrid} aria-label="Game catalogue preview">
              {games.map((game, index) => (
                <li key={game.meta.id} className={styles.gameItem}>
                  <GameTile interaction={game.meta.interaction} index={index} size="sm" />
                  <div className={styles.gameText}>
                    <h3 className={styles.gameTitle}>{game.meta.title}</h3>
                    <p className={styles.gameDescription}>{game.meta.description}</p>
                    <p className={styles.gamePlayers}>
                      <Icon name="users" size="1em" /> {playersLabel(game.meta.players)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.sectionCta}>
              <LaunchLink
                href={paths.play}
                className={buttonClassName({ variant: 'secondary', size: 'lg' })}
              >
                Browse all games
              </LaunchLink>
            </div>
          </div>
        </section>

        {/* ── Play your way ────────────────────────────────────── */}
        <section className={styles.section} aria-labelledby="modes-title">
          <div className="container">
            <div className={styles.sectionHeading}>
              <h2 id="modes-title">Play your way</h2>
              <p>Every device works on its own. There’s nothing to connect or sync.</p>
            </div>
            <div className={styles.modes}>
              <Card padding="lg" className={styles.mode}>
                <Icon name="device" size="2rem" className={styles.modeIcon} />
                <h3>One shared screen</h3>
                <p>
                  Put a phone in the middle of the table or pass it around. The game keeps track in
                  that tab.
                </p>
              </Card>
              <Card padding="lg" className={styles.mode}>
                <Icon name="users" size="2rem" className={styles.modeIcon} />
                <h3>Everyone on their own</h3>
                <p>
                  Each friend opens the site on their own device. Every browser runs its own game.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Final call to action ─────────────────────────────── */}
        <section className={styles.final} aria-labelledby="final-title">
          <div className={`container ${styles.finalInner}`}>
            <h2 id="final-title">Ready when your friends are.</h2>
            <LaunchLink
              href={paths.play}
              className={buttonClassName({ variant: 'primary', size: 'lg' })}
            >
              Start playing
            </LaunchLink>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
