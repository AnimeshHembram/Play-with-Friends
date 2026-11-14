import { lazy, Suspense, useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { NotFoundPage } from '@/app/NotFoundPage';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import { isPlayable, type PlayableGameDefinition } from '@/core/games';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { LoadingMessage } from '@/shared/ui/LoadingMessage';

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
        <main className="placeholder" role="alert">
          <h1>{meta.title} ran into a problem</h1>
          <p>
            <button type="button" onClick={retry}>
              Try again
            </button>{' '}
            <button type="button" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </p>
          <p>
            <Link to={paths.play}>Back to games</Link>
          </p>
        </main>
      )}
    >
      <Suspense fallback={<LoadingMessage>{`Loading ${meta.title}…`}</LoadingMessage>}>
        <Entry meta={meta} onExit={onExit} />
      </Suspense>
    </ErrorBoundary>
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

  if (!isPlayable(definition)) {
    return (
      <main className="placeholder">
        <PageTitle title={meta.title} />
        <h1>{meta.title}</h1>
        <p>Coming soon.</p>
        <Link to={paths.play}>Back to games</Link>
      </main>
    );
  }

  return (
    <>
      <PageTitle title={meta.title} />
      <PlayableGame key={meta.id} definition={definition} />
    </>
  );
}
