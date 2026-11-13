import { createContext, useContext, type ReactNode } from 'react';
import type { GameRegistry } from '@/core/games';

const GameRegistryContext = createContext<GameRegistry | null>(null);

/** Supplies the registry to the UI. Tests pass a registry of fixture games. */
export function GameRegistryProvider({
  registry,
  children,
}: {
  registry: GameRegistry;
  children: ReactNode;
}) {
  return <GameRegistryContext.Provider value={registry}>{children}</GameRegistryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameRegistry(): GameRegistry {
  const registry = useContext(GameRegistryContext);
  if (!registry) throw new Error('useGameRegistry must be used inside <GameRegistryProvider>');
  return registry;
}
