import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../constants';
import { HistoryState } from '../types/reading';
import { zustandStorage } from './storageAdapter';

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      readings: [],

      addReading: (reading) =>
        set((state) => ({
          // Add card on top
          readings: [reading, ...state.readings],
        })),

      updateReadingInterpretation: (id, text) =>
        set((state) => ({
          readings: state.readings.map((r) => (r.id === id ? { ...r, aiInterpretation: text } : r)),
        })),

      deleteReading: (id) =>
        set((state) => ({
          readings: state.readings.filter((r) => r.id !== id),
        })),

      clearHistory: () => set({ readings: [] }),

      updateUserNotes: (id, notes) =>
        set((state) => ({
          readings: state.readings.map((r) => (r.id === id ? { ...r, userNotes: notes } : r)),
        })),
    }),
    {
      name: STORAGE_KEYS.HISTORY,
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
