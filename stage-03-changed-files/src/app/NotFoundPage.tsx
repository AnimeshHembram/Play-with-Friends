import { Link } from 'react-router';
import { buttonClassName } from '@/shared/ui/buttonStyles';
import { AppBar } from '@/shared/ui/AppBar';
import { StatePanel } from '@/shared/ui/StatePanel';
import { Brand } from './Brand';
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
    <>
      <PageTitle title={title} />
      <AppBar start={<Brand />} />
      <main id="main" tabIndex={-1} className="status-page">
        <StatePanel
          tone="info"
          icon="help"
          headingLevel={1}
          title="Page not found"
          actions={
            <>
              <Link to={paths.play} className={buttonClassName({ variant: 'primary' })}>
                Go to the games
              </Link>
              <Link to={paths.landing} className={buttonClassName({ variant: 'secondary' })}>
                Home
              </Link>
            </>
          }
        >
          <p>{message}</p>
        </StatePanel>
      </main>
    </>
  );
}
