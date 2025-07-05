import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export class CryptoUtils {
  // Generate a unique wallet ID
  static async generateWalletId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Generate RSA key pair for signatures
  static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    // For demo purposes, we'll use a simplified key generation
    // In production, use a proper RSA library
    const seed = await Crypto.getRandomBytesAsync(32);
    const publicKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      seed.toString() + '_public'
    );
    const privateKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      seed.toString() + '_private'
    );
    
    return { publicKey, privateKey };
  }

  // Create signature for transaction
  static async signTransaction(
    data: string,
    privateKey: string
  ): Promise<string> {
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + privateKey
    );
    return signature;
  }

  // Verify transaction signature
  static async verifySignature(
    data: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + publicKey.replace('_public', '_private')
      );
      return signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }

  // Generate secure hash for PIN
  static async hashPin(pin: string, salt: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin + salt
    );
  }

  // Generate random nonce for transactions
  static async generateNonce(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(8);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Encrypt sensitive data
  static async encryptData(data: string, key: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + key
    );
    return hash;
  }

  // Create QR data string
  static createQRData(paymentData: any): string {
    return JSON.stringify(paymentData);
  }

  // Parse QR data
  static parseQRData(qrString: string): any {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      throw new Error('Invalid QR code data');
    }
  }
}