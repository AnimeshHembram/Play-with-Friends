import { shuffle } from './random';
import { browserRandom, type RandomSource } from './source';

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export type PlayingCard =
  | { readonly kind: 'standard'; readonly id: string; readonly suit: Suit; readonly rank: Rank }
  | { readonly kind: 'joker'; readonly id: string };

export interface DeckOptions {
  jokers?: 0 | 1 | 2;
}

/** A fresh 52-card deck in a fixed order (plus optional jokers). */
export function createStandardDeck({ jokers = 0 }: DeckOptions = {}): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) deck.push({ kind: 'standard', id: `${rank}-${suit}`, suit, rank });
  }
  for (let i = 1; i <= jokers; i++) deck.push({ kind: 'joker', id: `joker-${i}` });
  return deck;
}

export function shuffleDeck<T>(deck: readonly T[], rng: RandomSource = browserRandom): T[] {
  return shuffle(deck, rng);
}

/** Takes `count` cards off the top. Returns the drawn cards and the rest of the deck. */
export function drawCards<T>(deck: readonly T[], count = 1): { drawn: T[]; rest: T[] } {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('drawCards: count must be a non-negative integer');
  }
  if (count > deck.length) {
    throw new RangeError(`drawCards: only ${deck.length} cards left, cannot draw ${count}`);
  }
  return { drawn: deck.slice(0, count), rest: deck.slice(count) };
}
