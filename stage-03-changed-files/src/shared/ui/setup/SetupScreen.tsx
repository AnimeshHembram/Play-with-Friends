import { useId, type ReactNode } from 'react';
import { AppBar } from '../AppBar';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { SkipLink } from '../SkipLink';
import styles from './SetupScreen.module.css';

interface SetupScreenProps {
  /** Game title, shown as the page heading. */
  title: string;
  /** Short line under the title. */
  intro?: ReactNode;
  /** Leave setup (back to game selection). */
  onBack: () => void;
  backLabel?: string;
  /** Setup sections. Each game decides what goes here. */
  children: ReactNode;
  /** Primary action label. Default "Start game". */
  startLabel?: string;
  onStart: () => void;
  /**
   * When set, the start button is disabled and this explains why
   * ("Add 1 more player"). The reason is shown next to the button and
   * linked to it, so it's never a mystery why nothing happens.
   */
  startBlockedReason?: string | null;
  /** Extra actions in the top bar (e.g. a rules button). */
  headerActions?: ReactNode;
}

/**
 * Layout for a game's setup step: top bar with back, a heading, a column of
 * sections, and the start button. On phones the start button sits in a
 * bar pinned to the bottom (thumb reach, above the home indicator); on larger
 * screens it follows the content.
 *
 * This is layout only. It doesn't know about players or settings: each game
 * fills the sections with whatever it needs (PlayerSetup, SetupSection, or
 * its own controls), or doesn't use a setup screen at all.
 */
export function SetupScreen({
  title,
  intro,
  onBack,
  backLabel = 'Back to games',
  children,
  startLabel = 'Start game',
  onStart,
  startBlockedReason,
  headerActions,
}: SetupScreenProps) {
  const reasonId = useId();
  return (
    <>
      <SkipLink />
      <AppBar
        width="md"
        start={
          <IconButton icon="arrow-left" label={backLabel} onClick={onBack} tooltipAlign="start" />
        }
        end={headerActions}
      />
      <main id="main" tabIndex={-1} className={`page-main ${styles.main}`}>
        <div className={`container container-md ${styles.content}`}>
          <header className={styles.heading}>
            <p className={styles.eyebrow}>Game setup</p>
            <h1 className={styles.title}>{title}</h1>
            {intro && <p className={styles.intro}>{intro}</p>}
          </header>
          <div className={styles.sections}>{children}</div>
        </div>
        <div className={styles.actionBar}>
          <div className={`container container-md ${styles.actionInner}`}>
            {startBlockedReason && (
              <p id={reasonId} className={styles.reason}>
                {startBlockedReason}
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              iconEnd="arrow-right"
              className={styles.start}
              disabled={Boolean(startBlockedReason)}
              aria-describedby={startBlockedReason ? reasonId : undefined}
              onClick={onStart}
            >
              {startLabel}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

interface SetupSectionProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** A titled group of setup controls (players, options, content packs…). */
export function SetupSection({ title, description, children }: SetupSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      {children}
    </section>
  );
}
