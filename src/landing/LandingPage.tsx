import { appConfig } from '@/app/config';
import { PageTitle } from '@/app/PageTitle';

/**
 * The home screen: an intentionally blank canvas. The menu button in the
 * top-left corner (rendered by AppCanvas) is the only control. The heading is
 * for screen readers and the page outline; it isn't shown.
 */
export function LandingPage() {
  return (
    <main className="canvas-main">
      <PageTitle />
      <h1 className="visually-hidden">{appConfig.appName}</h1>
    </main>
  );
}
