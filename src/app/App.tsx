// RouterProvider is imported from 'react-router', not 'react-router/dom'. The
// /dom entry only adds optional flushSync support, and under Vitest it resolves
// to a separate copy of the router context, which breaks route rendering.
import { RouterProvider, type DataRouter } from 'react-router';
import type { GameRegistry } from '@/core/games';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { GameRegistryProvider } from './GameRegistryContext';

export function App({ router, registry }: { router: DataRouter; registry: GameRegistry }) {
  return (
    <ErrorBoundary>
      <GameRegistryProvider registry={registry}>
        <RouterProvider router={router} />
      </GameRegistryProvider>
    </ErrorBoundary>
  );
}
