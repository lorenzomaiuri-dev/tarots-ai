export type CardType = 'major' | 'minor' | 'oracle' | 'other';
export type CardSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | 'none';

export interface CardMeta {
  type: CardType;
  suit?: CardSuit;
  number?: number;
  element?: string;
  zodiac?: string;
}

export interface Card {
  id: string;          // es: "maj_00"
  sortIndex: number;
  image: string;       // es: "maj_00.jpg"
  meta: CardMeta;
}

export interface DeckInfo {
  id: string;          // es: "rider-waite"
  author?: string;
  totalCards: number;
}

export interface Deck {
  info: DeckInfo;
  cards: Card[];
}