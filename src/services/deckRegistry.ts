import { Deck, DeckInfo } from '../types/deck';

// --- STATIC IMPORT ---
// TODO: DYNAMIC IMPORT

// RIDER WAITE (Default)
import riderWaiteData from '../data/rider-waite/deck.json'; 
import riderWaiteImages from '../data/rider-waite/images';

// OTHER DECKS...

// --- REGISTRY ---

type DeckRegistryEntry = {
  data: Deck;
  images: Record<string, any>; // Map id_image -> require()
};

const REGISTRY: Record<string, DeckRegistryEntry> = {
  'rider-waite': {
    data: riderWaiteData as Deck,
    images: riderWaiteImages,
  },
};

/**
 * Get all decks.
 */
export const getAvailableDecks = (): DeckInfo[] => {
  return Object.values(REGISTRY).map((entry) => entry.data.info);
};

/**
 * Get full Deck.
 */
export const getDeck = (deckId: string): Deck | null => {
  return REGISTRY[deckId]?.data || null;
};

/**
 * Get image source for card
 */
export const getCardImageSource = (deckId: string, imageId: string): any => {
  const deck = REGISTRY[deckId];
  if (!deck || !deck.images[imageId]) {
    console.warn(`Immagine non trovata: ${deckId}/${imageId}`);
    // TODO: PLACEHOLDER
    return null; 
  }
  return deck.images[imageId];
};

/**
 * Get back card image
 */
export const getCardBackImage = (deckId: string): any => {
    // TODO: PLACEHOLDER AND SPECIAL HANDLING
    const deck = REGISTRY[deckId];
    return deck?.images['back_image'] || null;
}