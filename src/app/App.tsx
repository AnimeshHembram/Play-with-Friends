import { RouterProvider, type DataRouter } from 'react-router';
import type { GameRegistry } from '@/core/games';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { GameRegistryProvider } from './GameRegistryContext';

export function App({ router, registry }: { router: DataRouter; registry: GameRegistry }) {
  return (
    <ErrorBoundary context="app root">
      <GameRegistryProvider registry={registry}>
        <RouterProvider router={router} />
      </GameRegistryProvider>
    </ErrorBoundary>
  );
}
