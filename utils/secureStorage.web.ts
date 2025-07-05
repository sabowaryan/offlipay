import { SecureStorage } from './secureStorage';

export const secureStorage: SecureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(`offlipay_${key}`, value);
  },

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(`offlipay_${key}`);
  },

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(`offlipay_${key}`);
  },
};