import { lazy, Suspense, useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { interactionLabel, playersLabel } from '@/app/gameLabels';
import { NotFoundPage } from '@/app/NotFoundPage';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import { isPlayable, type GameMeta, type PlayableGameDefinition } from '@/core/games';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { buttonClassName } from '@/shared/ui/buttonStyles';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { GameShell } from '@/shared/ui/game/GameShell';
import { LoadingMessage } from '@/shared/ui/LoadingMessage';
import { EmptyState, ErrorState } from '@/shared/ui/StatePanel';
import styles from './GameRoute.module.css';

/**
 * Loads and mounts a playable game.
 *
 * Each attempt gets its own React.lazy component. A failed download stays
 * failed for that attempt (no repeated requests while the network is down),
 * and "Try again" starts a fresh attempt instead of replaying the old failure.
 * Successful downloads are cached by the browser, so re-creating the lazy
 * component on a later visit does not fetch the game again.
 */
function PlayableGame({ definition }: { definition: PlayableGameDefinition }) {
  const navigate = useNavigate();
  const onExit = useCallback(() => navigate(paths.play), [navigate]);
  const [attempt, setAttempt] = useState(() => ({ id: 0, Entry: lazy(definition.load) }));
  const retry = () => setAttempt((prev) => ({ id: prev.id + 1, Entry: lazy(definition.load) }));
  const { Entry } = attempt;
  const { meta } = definition;

  return (
    <ErrorBoundary
      key={attempt.id}
      fallback={() => (
        <main className="status-page">
          <ErrorState
            headingLevel={1}
            title={`${meta.title} ran into a problem`}
            actions={
              <>
                <Button variant="primary" icon="refresh" onClick={retry}>
                  Try again
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Reload page
                </Button>
                <Link to={paths.play} className={buttonClassName({ variant: 'ghost' })}>
                  Back to games
                </Link>
              </>
            }
          >
            <p>The rest of the site still works. Try loading the game again.</p>
          </ErrorState>
        </main>
      )}
    >
      <Suspense fallback={<LoadingMessage>{`Loading ${meta.title}…`}</LoadingMessage>}>
        <Entry meta={meta} onExit={onExit} />
      </Suspense>
    </ErrorBoundary>
  );
}

/** Shown for a planned game (registered, but no entry component yet). */
function ComingSoon({ meta }: { meta: GameMeta }) {
  const style = interactionLabel(meta.interaction);
  return (
    <GameShell
      title={meta.title}
      exitTo={paths.play}
      rules={
        <>
          <p>{meta.description}</p>
          <p>The full rules will appear here when the game is ready.</p>
        </>
      }
    >
      <EmptyState
        title="Coming soon."
        icon="clock"
        actions={
          <Link to={paths.play} className={buttonClassName({ variant: 'primary' })}>
            Browse other games
          </Link>
        }
      >
        <p>{meta.description}</p>
        <p>We’re still building this one.</p>
        <ul className={styles.badges} aria-label="Details">
          <li>
            <Badge icon="users">{playersLabel(meta.players)}</Badge>
          </li>
          {style && (
            <li>
              <Badge>{style}</Badge>
            </li>
          )}
        </ul>
      </EmptyState>
    </GameShell>
  );
}

/**
 * Resolves /play/:gameId against the registry and mounts that game's entry.
 * Each game runs inside its own error boundary, and its session lives inside
 * its own component tree, so leaving the route discards it.
 */
export function GameRoute() {
  const { gameId = '' } = useParams();
  const definition = useGameRegistry().get(gameId);

  if (!definition) {
    return <NotFoundPage title="Game not found" message="We couldn't find that game." />;
  }

  const { meta } = definition;

  return (
    <>
      <PageTitle title={meta.title} />
      {isPlayable(definition) ? (
        <PlayableGame key={meta.id} definition={definition} />
      ) : (
        <ComingSoon meta={meta} />
      )}
    </>
  );
}
