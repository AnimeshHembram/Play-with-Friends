import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useEffect } from 'react';
import { reportError } from '@/shared/lib/reportError';
import { PageTitle } from './PageTitle';
import { paths } from './paths';

/**
 * Shown when a route fails to load or throws while rendering.
 * Load failures (e.g. a lazy route's code can't be downloaded) never reach
 * React's error hooks, so they are reported here.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  useEffect(() => reportError(error, 'route error'), [error]);
  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : null;
  return (
    <main className="placeholder" role="alert">
      <PageTitle title="Something went wrong" />
      <h1>Something went wrong</h1>
      <p>{detail ?? 'This part of the app failed to load. Refreshing usually fixes it.'}</p>
      <p>
        <Link to={paths.landing}>Back to home</Link>
      </p>
    </main>
  );
}
