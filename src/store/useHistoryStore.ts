import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storageAdapter';
import { HistoryState } from '../types/reading';
import { STORAGE_KEYS } from "../constants";

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      readings: [],

      addReading: (reading) => 
        set((state) => ({
          // Add card on top
          readings: [reading, ...state.readings]
        })),

      updateReadingInterpretation: (id, text) =>
        set((state) => ({
          readings: state.readings.map((r) => 
            r.id === id ? { ...r, aiInterpretation: text } : r
          ),
        })),

      deleteReading: (id) =>
        set((state) => ({
          readings: state.readings.filter((r) => r.id !== id),
        })),      

      clearHistory: () => set({ readings: [] }),

      updateUserNotes: (id, notes) =>
        set((state) => ({
          readings: state.readings.map((r) => 
            r.id === id ? { ...r, userNotes: notes } : r
          ),
      })),
    }),
    {
      name: STORAGE_KEYS.HISTORY,
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);