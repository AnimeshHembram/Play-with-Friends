import { Suspense, use, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { NotFoundPage } from '@/app/NotFoundPage';
import { paths } from '@/app/paths';
import { isPlayable, type GameDefinition, type GameEntryModule } from '@/core/games';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

// One load promise per game, so the game's code is fetched once and React can
// suspend on a stable promise.
const entryPromises = new WeakMap<GameDefinition, Promise<GameEntryModule>>();

function loadEntry(definition: GameDefinition): Promise<GameEntryModule> {
  let promise = entryPromises.get(definition);
  if (!promise) {
    promise = definition.load!();
    entryPromises.set(definition, promise);
  }
  return promise;
}

function GameHost({ definition, onExit }: { definition: GameDefinition; onExit: () => void }) {
  const { default: Entry } = use(loadEntry(definition));
  return <Entry meta={definition.meta} onExit={onExit} />;
}

/**
 * Resolves /play/:gameId against the registry and mounts that game's entry.
 * Each game runs inside its own error boundary, and its session lives inside
 * its own component tree, so leaving the route discards it.
 */
export function GameRoute() {
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const definition = useGameRegistry().get(gameId);
  const onExit = useCallback(() => navigate(paths.play), [navigate]);

  if (!definition) return <NotFoundPage message="We couldn't find that game." />;

  if (!isPlayable(definition)) {
    return (
      <main className="placeholder">
        <h1>{definition.meta.title}</h1>
        <p>Coming soon.</p>
        <Link to={paths.play}>Back to games</Link>
      </main>
    );
  }

  return (
    <ErrorBoundary
      key={definition.meta.id}
      context={`game:${definition.meta.id}`}
      fallback={
        <main className="placeholder" role="alert">
          <h1>{definition.meta.title} ran into a problem</h1>
          <Link to={paths.play}>Back to games</Link>
        </main>
      }
    >
      <Suspense fallback={<p className="placeholder">Loading {definition.meta.title}…</p>}>
        <GameHost definition={definition} onExit={onExit} />
      </Suspense>
    </ErrorBoundary>
  );
}
