import type { RouteObject } from 'react-router';
import { paths } from './paths';
import { LandingPage } from '@/landing/LandingPage';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorPage } from './RouteErrorPage';

/**
 * Route map.
 *
 *   /               landing page (marketing side, light bundle)
 *   /play           gaming experience: game selection
 *   /play/:gameId   one game's entry point
 *   *               not found
 *
 * The landing page and the gaming experience are separate route trees. The
 * whole /play tree is lazy-loaded, so visitors who only see the landing page
 * never download game code. The landing page opens /play in a new tab.
 */
export const routes: RouteObject[] = [
  {
    path: paths.landing,
    element: <LandingPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: paths.play,
    errorElement: <RouteErrorPage />,
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
  { path: '*', element: <NotFoundPage /> },
];
