import type { ReactNode } from 'react';
import { Button } from '../Button';
import { StatePanel } from '../StatePanel';

interface GameCompletionProps {
  /** e.g. "Game over", "Round complete", "Ravi wins!" — the game decides. */
  title: ReactNode;
  /** Summary or results, rendered by the game (scores, a final card, stats). */
  children?: ReactNode;
  /** Shows "Play again" when provided. */
  onPlayAgain?: () => void;
  playAgainLabel?: string;
  /** Shows "Back to games" when provided. */
  onExit?: () => void;
  exitLabel?: string;
  /** Extra actions, after the standard ones. */
  extraActions?: ReactNode;
}

/**
 * End-of-game panel. Only a layout: what "finished" means, and what the
 * results look like, is up to each game.
 * Announced politely when it appears, so screen-reader users know the game ended.
 */
export function GameCompletion({
  title,
  children,
  onPlayAgain,
  playAgainLabel = 'Play again',
  onExit,
  exitLabel = 'Back to games',
  extraActions,
}: GameCompletionProps) {
  return (
    <StatePanel
      tone="success"
      icon="sparkle"
      title={title}
      role="status"
      actions={
        (onPlayAgain || onExit || extraActions) && (
          <>
            {onPlayAgain && (
              <Button variant="primary" size="lg" icon="refresh" onClick={onPlayAgain}>
                {playAgainLabel}
              </Button>
            )}
            {onExit && (
              <Button variant="secondary" size="lg" onClick={onExit}>
                {exitLabel}
              </Button>
            )}
            {extraActions}
          </>
        )
      }
    >
      {children}
    </StatePanel>
  );
}
