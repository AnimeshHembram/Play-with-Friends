import { Link } from 'react-router';
import { paths } from './paths';

export function NotFoundPage({ message = "This page doesn't exist." }: { message?: string }) {
  return (
    <main className="placeholder">
      <h1>Page not found</h1>
      <p>{message}</p>
      <p>
        <Link to={paths.play}>Go to the games</Link> · <Link to={paths.landing}>Home</Link>
      </p>
    </main>
  );
}
