import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
  getString: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('Storage Get Error:', e);
      return null;
    }
  },
  
  setString: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Storage Set Error:', e);
    }
  },

  // Helper JSON
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error(`Errore parsing key: ${key}`, e);
      return null;
    }
  },

  setItem: async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage Set Item Error:', e);
    }
  },

  delete: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
  
  clearAll: async () => {
    await AsyncStorage.clear();
  },
};