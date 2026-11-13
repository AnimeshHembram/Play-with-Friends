import type { ComponentType } from 'react';

/**
 * The contract every game module implements.
 *
 * The platform only needs two things from a game:
 *   1. `meta`  - plain data, used for discovery, the selection screen and routing.
 *   2. `load`  - a lazy import of the game's entry component.
 *
 * Everything else (rules, state, turn handling or the lack of it, randomization,
 * content, controls, settings, session lifecycle) is owned by the game itself,
 * inside its own folder. The platform core offers helpers for those concerns
 * but never forces a game to use them.
 */

/** How a game is played. Descriptive only: the platform does not enforce it. */
export type InteractionStyle =
  | 'turn-based' //     players act one at a time (Truth or Dare)
  | 'simultaneous' //   everyone responds at once (Never Have I Ever, voting)
  | 'team-based' //     players split into teams (Dumb Charades)
  | 'single-action'; // one tap produces a result, no turns needed (dice, picker)

export interface PlayerRequirements {
  /** Minimum players the game needs. 0 means it works without entering names. */
  readonly min: number;
  /** Maximum players, or null for no game-specific limit. */
  readonly max: number | null;
}

export interface GameMeta {
  /** URL-safe slug, unique across the platform. Used in routes: /play/<id>. */
  readonly id: string;
  readonly title: string;
  /** One or two sentences for the selection screen. */
  readonly description: string;
  readonly players: PlayerRequirements;
  readonly interaction: readonly InteractionStyle[];
  /** Sort position on the selection screen. Lower comes first. */
  readonly order?: number;
}

/** Services the platform hands to a running game. Kept deliberately small. */
export interface GameEntryProps {
  readonly meta: GameMeta;
  /** Leave the game and return to game selection. */
  readonly onExit: () => void;
}

export interface GameEntryModule {
  default: ComponentType<GameEntryProps>;
}

export interface GameDefinition {
  readonly meta: GameMeta;
  /**
   * Lazily loads the game's entry component. Omit it while a game is still
   * planned: the platform lists it as "coming soon" and won't try to start it.
   */
  readonly load?: () => Promise<GameEntryModule>;
}

/** Identity helper so game definitions are type-checked against the contract. */
export function defineGame(definition: GameDefinition): GameDefinition {
  return definition;
}

export function isPlayable(definition: GameDefinition): boolean {
  return typeof definition.load === 'function';
}
