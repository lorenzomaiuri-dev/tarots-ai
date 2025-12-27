import seedrandom from 'seedrandom';

import { Deck } from '../types/deck';

/**
 * Generate standard random seed
 * Format: "YYYY-MM-DD"
 */
export const getDailySeed = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // es: "2025-12-24"
};

/**
 * Pesca N carte uniche da un mazzo dato un seed.
 */
export const drawCards = (
  deck: Deck,
  count: number,
  seed?: string, // null for randomness
  allowReversed: boolean = true
) => {
  // 1. Init RNG
  const rng = seedrandom(seed || undefined);

  // 2. Create copy
  const deckCards = [...deck.cards];

  // 3. Fisher-Yates Shuffle
  for (let i = deckCards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
  }

  // 4. Draw first N cards
  const selectedCards = deckCards.slice(0, count);

  // 5. Check for orientation
  return selectedCards.map((card) => {
    const isReversed = allowReversed ? rng() < 0.5 : false;

    return {
      card,
      isReversed,
    };
  });
};
