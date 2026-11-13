import { Link } from 'react-router';
import { useGameRegistry } from '@/app/GameRegistryContext';
import { paths } from '@/app/paths';
import { isPlayable } from '@/core/games';

/** Structural placeholder: lists whatever the registry discovered. Final UI comes later. */
export function GameSelectionPage() {
  const games = useGameRegistry().list();
  return (
    <main className="placeholder">
      <h1>Choose a game</h1>
      {games.length === 0 ? (
        <p>No games are available yet.</p>
      ) : (
        <ul aria-label="Games">
          {games.map(({ meta, ...def }) => (
            <li key={meta.id}>
              <Link to={paths.game(meta.id)}>{meta.title}</Link>
              {!isPlayable({ meta, ...def }) && <span> (coming soon)</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
