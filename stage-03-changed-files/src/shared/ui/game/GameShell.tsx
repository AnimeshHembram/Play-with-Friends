import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '../../lib/cx';
import { AppBar } from '../AppBar';
import { iconButtonClassName } from '../buttonStyles';
import { ConfirmDialog } from '../ConfirmDialog';
import { Dialog } from '../Dialog';
import { Dropdown, type DropdownItem } from '../Dropdown';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { SkipLink } from '../SkipLink';
import { Tooltip } from '../Tooltip';
import styles from './GameShell.module.css';

export interface ExitConfirmation {
  title: string;
  description?: string;
  confirmLabel?: string;
}

interface GameShellProps {
  /** Game title (the page's h1). */
  title: string;
  /** Optional small line under the title (round number, mode…). Game-owned. */
  subtitle?: ReactNode;
  /**
   * How to leave the game. Pass `onExit` (from GameEntryProps) for a button,
   * or `exitTo` for a plain link when nothing needs confirming.
   */
  onExit?: () => void;
  exitTo?: string;
  exitLabel?: string;
  /**
   * Ask before leaving, e.g. while a round is in progress. The game decides
   * when this applies; pass `null`/omit when leaving loses nothing.
   */
  confirmExit?: ExitConfirmation | null;
  /** Rules/help content. When set, a help button opens it in a dialog. */
  rules?: ReactNode;
  /** Extra actions in the "more" menu (e.g. Restart). Game-owned. */
  menuItems?: readonly DropdownItem[];
  /** Player strip under the header (chips, scores, teams). Game-owned. */
  players?: ReactNode;
  /** Primary controls, shown in a bar at the bottom on phones (or the side in landscape). */
  controls?: ReactNode;
  /**
   * `none` stops the browser from scrolling or zooming when the user drags
   * on the stage, for games with swipe/drag interactions. Default `auto`.
   */
  stageTouch?: 'auto' | 'none';
  /** The game itself. */
  children: ReactNode;
  className?: string;
}

/**
 * A reusable frame for a running game: top bar (exit, title, help, menu), an
 * optional player strip, the main stage, and a controls bar.
 *
 * It is only a visual frame. It holds no game state, has no notion of turns,
 * rounds or scores, and never decides what happens next — each game owns its
 * rules and simply fills the slots it needs.
 *
 * Responsive behaviour:
 *   - fills the visible viewport (dynamic viewport units, so the mobile
 *     address bar never hides the controls)
 *   - controls sit above the home indicator (safe-area insets)
 *   - on short landscape screens, controls move to a side column so the stage
 *     keeps its height
 */
export function GameShell({
  title,
  subtitle,
  onExit,
  exitTo,
  exitLabel = 'Back to games',
  confirmExit,
  rules,
  menuItems,
  players,
  controls,
  stageTouch = 'auto',
  children,
  className,
}: GameShellProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmingExit, setConfirmingExit] = useState(false);

  const requestExit = () => {
    if (confirmExit) setConfirmingExit(true);
    else onExit?.();
  };

  const exitControl =
    exitTo && !confirmExit ? (
      <Tooltip content={exitLabel} decorative align="start">
        <Link to={exitTo} aria-label={exitLabel} className={iconButtonClassName()}>
          <Icon name="arrow-left" />
        </Link>
      </Tooltip>
    ) : (
      <IconButton icon="arrow-left" label={exitLabel} onClick={requestExit} tooltipAlign="start" />
    );

  return (
    <div className={cx(styles.shell, controls !== undefined && styles.hasControls, className)}>
      <SkipLink targetId="game-stage">Skip to game</SkipLink>
      <AppBar
        width="md"
        start={exitControl}
        center={
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        }
        end={
          <>
            {rules && (
              <IconButton
                icon="help"
                label="How to play"
                onClick={() => setRulesOpen(true)}
                tooltipAlign="end"
                aria-haspopup="dialog"
              />
            )}
            {menuItems && menuItems.length > 0 && (
              <Dropdown label="Game options" items={menuItems} align="end" />
            )}
          </>
        }
      />

      {players && (
        <div className={styles.players} aria-label="Players" role="region">
          <div className="container container-md">{players}</div>
        </div>
      )}

      <main
        id="game-stage"
        tabIndex={-1}
        className={cx(styles.stage, stageTouch === 'none' && styles.noTouchScroll)}
      >
        <div className={cx('container container-md', styles.stageInner)}>{children}</div>
      </main>

      {controls !== undefined && (
        <div className={styles.controls} role="group" aria-label="Game controls">
          <div className={cx('container container-md', styles.controlsInner)}>{controls}</div>
        </div>
      )}

      {rules && (
        <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)} title={`How to play ${title}`}>
          <div className={styles.rules}>{rules}</div>
        </Dialog>
      )}

      {confirmExit && (
        <ConfirmDialog
          open={confirmingExit}
          title={confirmExit.title}
          description={confirmExit.description}
          confirmLabel={confirmExit.confirmLabel ?? 'Leave game'}
          cancelLabel="Keep playing"
          tone="danger"
          onCancel={() => setConfirmingExit(false)}
          onConfirm={() => {
            setConfirmingExit(false);
            onExit?.();
          }}
        />
      )}
    </div>
  );
}
