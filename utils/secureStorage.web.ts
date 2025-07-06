import { SecureStorage } from './secureStorage';

export const secureStorage: SecureStorage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    localStorage.setItem(`offlipay_${key}`, value);
  },

  async getItemAsync(key: string): Promise<string | null> {
    return localStorage.getItem(`offlipay_${key}`);
  },

  async deleteItemAsync(key: string): Promise<void> {
    localStorage.removeItem(`offlipay_${key}`);
  },
};