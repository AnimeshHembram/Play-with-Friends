import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useEffect } from 'react';
import { reportError } from '@/shared/lib/reportError';
import { paths } from './paths';

/** Shown when a route fails to load or throws while rendering. */
export function RouteErrorPage() {
  const error = useRouteError();
  useEffect(() => reportError(error, 'route error'), [error]);
  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : null;
  return (
    <main className="placeholder" role="alert">
      <h1>Something went wrong</h1>
      <p>{detail ?? 'This part of the app failed to load. Refreshing usually fixes it.'}</p>
      <p>
        <Link to={paths.landing}>Back to home</Link>
      </p>
    </main>
  );
}
