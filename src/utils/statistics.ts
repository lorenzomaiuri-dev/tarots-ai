import { ReadingSession } from '../types/reading';
import { getDeck } from '../services/deckRegistry';

export const calculateStats = (readings: ReadingSession[], deckId: string) => {
  const totalReadings = readings.length;
  const cardCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {
    major: 0,
    wands: 0,
    cups: 0,
    swords: 0,
    pentacles: 0
  };

  let totalCards = 0;

  readings.forEach(reading => {
    reading.cards.forEach(drawn => {
      // 1. Count specific card frequency
      cardCounts[drawn.cardId] = (cardCounts[drawn.cardId] || 0) + 1;

      // 2. Count suits (Need to look up metadata from registry)
      const deck = getDeck(reading.deckId || deckId); 
      if (deck) {
        const cardDef = deck.cards.find(c => c.id === drawn.cardId);
        if (cardDef) {
           if (cardDef.meta.type === 'major') {
             suitCounts.major++;
           } else if (cardDef.meta.suit) {
             suitCounts[cardDef.meta.suit]++;
           }
        }
      }
      totalCards++;
    });
  });

  // 3. Find Top Card
  let topCardId = null;
  let maxCount = 0;
  Object.entries(cardCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCardId = id;
    }
  });

  return {
    totalReadings,
    topCardId,
    topCardCount: maxCount,
    suitCounts,
    totalCards
  };
};