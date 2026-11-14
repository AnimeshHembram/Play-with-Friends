import { appConfig } from '@/app/config';
import { PageTitle } from '@/app/PageTitle';
import { paths } from '@/app/paths';
import { LaunchLink } from '@/shared/ui/LaunchLink';

/** Structural placeholder. The real landing page is designed in a later phase. */
export function LandingPage() {
  return (
    <main className="placeholder">
      <PageTitle />
      <h1>{appConfig.appName}</h1>
      <p>Party games for your group. No app, no account.</p>
      <LaunchLink href={paths.play} className="button">
        Launch games
      </LaunchLink>
    </main>
  );
}
