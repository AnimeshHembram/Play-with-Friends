import type { RouteObject } from 'react-router';
import { paths } from './paths';
import { AppCanvas } from './AppCanvas';
import { LandingPage } from '@/landing/LandingPage';
import { LoadingMessage } from '@/shared/ui/LoadingMessage';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorPage } from './RouteErrorPage';

/**
 * Route map.
 *
 *   /               home: a blank, full-screen canvas
 *   /play           gaming experience: game selection
 *   /play/:gameId   one game's entry point
 *   *               not found
 *
 * Every route renders inside AppCanvas, which provides the full-screen canvas
 * and the menu (appearance settings) in the top-left corner.
 *
 * The landing page and the gaming experience are separate route trees. The
 * whole /play tree is lazy-loaded, so visitors who only see the landing page
 * never download game code. The menu's "Launch games" link opens /play in a new tab.
 */
export const routes: RouteObject[] = [
  {
    element: <AppCanvas />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: paths.landing,
        element: <LandingPage />,
        errorElement: <RouteErrorPage />,
      },
      {
        path: paths.play,
        errorElement: <RouteErrorPage />,
        // Shown while the lazy /play code loads on a direct visit (e.g. a new tab).
        hydrateFallbackElement: <LoadingMessage />,
        lazy: async () => ({ Component: (await import('@/play/PlayLayout')).PlayLayout }),
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/play/GameSelectionPage')).GameSelectionPage,
            }),
          },
          {
            path: ':gameId',
            lazy: async () => ({ Component: (await import('@/play/GameRoute')).GameRoute }),
          },
        ],
      },
      { path: '*', element: <NotFoundPage />, errorElement: <RouteErrorPage /> },
    ],
  },
];
