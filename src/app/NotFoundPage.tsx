import { Link } from 'react-router';
import { PageTitle } from './PageTitle';
import { paths } from './paths';

export function NotFoundPage({
  message = "This page doesn't exist.",
  title = 'Page not found',
}: {
  message?: string;
  /** Browser tab title. */
  title?: string;
}) {
  return (
    <main className="placeholder">
      <PageTitle title={title} />
      <h1>Page not found</h1>
      <p>{message}</p>
      <p>
        <Link to={paths.play}>Go to the games</Link> · <Link to={paths.landing}>Home</Link>
      </p>
    </main>
  );
}
