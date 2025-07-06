import * as SecureStore from 'expo-secure-store';
import { SecureStorage } from './secureStorage';

export const secureStorage: SecureStorage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItemAsync(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async deleteItemAsync(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};