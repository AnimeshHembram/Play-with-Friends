import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useEffect } from 'react';
import { reportError } from '@/shared/lib/reportError';
import { Button } from '@/shared/ui/Button';
import { buttonClassName } from '@/shared/ui/buttonStyles';
import { ErrorState } from '@/shared/ui/StatePanel';
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
    <main className="status-page">
      <PageTitle title="Something went wrong" />
      <ErrorState
        headingLevel={1}
        title="Something went wrong"
        actions={
          <>
            <Button variant="primary" icon="refresh" onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <Link to={paths.landing} className={buttonClassName({ variant: 'secondary' })}>
              Back to home
            </Link>
          </>
        }
      >
        <p>{detail ?? 'This part of the app failed to load. Refreshing usually fixes it.'}</p>
      </ErrorState>
    </main>
  );
}
