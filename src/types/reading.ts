export interface SpreadPosition {
  id: string;        // es: "past", "obstacle"
  // TODO: data for UI (x, y, rotation)
  // layout?: { x: number; y: number; rotation?: number }; 
}

export interface Spread {
  id: string;        // es: "three-card", "celtic-cross"
  slots: SpreadPosition[];
}

export interface DrawnCard {
  cardId: string;    // es: "maj_00"
  deckId: string;
  positionId: string;
  isReversed: boolean;
}

export interface ReadingSession {
  id: string;
  timestamp: number;      // Unix timestamp
  spreadId: string;
  deckId: string;
  cards: DrawnCard[];
  
  aiInterpretation?: string; 
  userNotes?: string;
  
  // Metadata
  seed?: string;
  modelUsed?: string;
}