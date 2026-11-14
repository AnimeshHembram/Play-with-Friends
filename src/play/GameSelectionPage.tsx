import { Link } from 'react-router';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import { isPlayable } from '@/core/games';

/** Structural placeholder: lists whatever the registry discovered. Final UI comes later. */
export function GameSelectionPage() {
  const games = useGameRegistry().list();
  return (
    <main className="placeholder">
      <PageTitle title="Choose a game" />
      <h1>Choose a game</h1>
      {games.length === 0 ? (
        <p>No games are available yet.</p>
      ) : (
        <ul aria-label="Games">
          {games.map((game) => (
            <li key={game.meta.id}>
              <Link to={paths.game(game.meta.id)}>{game.meta.title}</Link>
              {!isPlayable(game) && <span> (coming soon)</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
