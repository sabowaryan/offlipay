import * as SQLite from 'expo-sqlite';
import { User, Transaction, QRPaymentData } from '@/types';
import { secureStorage } from './secureStorage.native';

export class StorageService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async initializeDatabase(): Promise<void> {
    if (this.db) return;

    this.db = await SQLite.openDatabaseAsync('offlipay.db');
    
    // Create tables
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        walletId TEXT UNIQUE NOT NULL,
        balance REAL DEFAULT 0,
        pin TEXT NOT NULL,
        publicKey TEXT NOT NULL,
        privateKey TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        lastSyncAt TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        fromWalletId TEXT NOT NULL,
        toWalletId TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        signature TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        qrData TEXT,
        syncStatus TEXT DEFAULT 'local'
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(fromWalletId, toWalletId);
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);
  }

  // Check if phone number exists
  static async checkPhoneExists(phone: string): Promise<boolean> {
    await this.initializeDatabase();
    
    try {
      const result = await this.db!.getFirstAsync<any>(
        'SELECT walletId FROM users WHERE phone = ?',
        [phone.trim()]
      );
      
      return !!result;
    } catch (error) {
      console.error('Erreur lors de la vérification du téléphone:', error);
      return false;
    }
  }

  // Check if wallet ID exists
  static async checkWalletIdExists(walletId: string): Promise<boolean> {
    await this.initializeDatabase();
    
    try {
      const result = await this.db!.getFirstAsync<any>(
        'SELECT walletId FROM users WHERE walletId = ?',
        [walletId]
      );
      
      return !!result;
    } catch (error) {
      console.error('Erreur lors de la vérification du wallet ID:', error);
      return false;
    }
  }

  // User management
  static async saveUser(user: User): Promise<void> {
    await this.initializeDatabase();
    
    try {
      // Vérifier d'abord si le téléphone existe déjà
      const phoneExists = await this.checkPhoneExists(user.phone);
      if (phoneExists) {
        throw new Error('Ce numéro de téléphone est déjà utilisé');
      }

      // Vérifier si le wallet ID existe déjà
      const walletExists = await this.checkWalletIdExists(user.walletId);
      if (walletExists) {
        throw new Error('Cet ID wallet existe déjà');
      }

      await this.db!.runAsync(
        `INSERT INTO users 
         (id, name, phone, walletId, balance, pin, publicKey, privateKey, createdAt, lastSyncAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.phone,
          user.walletId,
          user.balance,
          user.pin,
          user.publicKey,
          user.privateKey,
          user.createdAt.toISOString(),
          user.lastSyncAt?.toISOString() || null
        ]
      );
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('phone')) {
          throw new Error('Ce numéro de téléphone est déjà utilisé');
        } else if (error.message.includes('walletId')) {
          throw new Error('Cet ID wallet existe déjà');
        }
      }
      throw error;
    }
  }

  static async getUser(walletId: string): Promise<User | null> {
    await this.initializeDatabase();
    
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM users WHERE walletId = ?',
      [walletId]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      balance: parseFloat(result.balance),
      createdAt: new Date(result.createdAt),
      lastSyncAt: result.lastSyncAt ? new Date(result.lastSyncAt) : undefined
    };
  }

  static async updateUserBalance(walletId: string, newBalance: number): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE users SET balance = ? WHERE walletId = ?',
      [newBalance, walletId]
    );
  }

  // Transaction management
  static async saveTransaction(transaction: Transaction): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT OR REPLACE INTO transactions 
       (id, fromWalletId, toWalletId, amount, description, signature, timestamp, status, type, qrData, syncStatus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.fromWalletId,
        transaction.toWalletId,
        transaction.amount,
        transaction.description,
        transaction.signature,
        transaction.timestamp.toISOString(),
        transaction.status,
        transaction.type,
        transaction.qrData || null,
        transaction.syncStatus
      ]
    );
  }

  static async getTransactions(walletId: string, limit: number = 50): Promise<Transaction[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      `SELECT * FROM transactions 
       WHERE fromWalletId = ? OR toWalletId = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [walletId, walletId, limit]
    );
    
    return results.map(result => ({
      ...result,
      amount: parseFloat(result.amount),
      timestamp: new Date(result.timestamp)
    }));
  }

  static async getPendingSyncTransactions(walletId: string): Promise<Transaction[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      `SELECT * FROM transactions 
       WHERE (fromWalletId = ? OR toWalletId = ?) AND syncStatus = 'pending_sync'
       ORDER BY timestamp DESC`,
      [walletId, walletId]
    );
    
    return results.map(result => ({
      ...result,
      amount: parseFloat(result.amount),
      timestamp: new Date(result.timestamp)
    }));
  }

  // Secure storage for sensitive data
  static async storeSecureData(key: string, value: string): Promise<void> {
    await secureStorage.setItem(key, value);
  }

  static async getSecureData(key: string): Promise<string | null> {
    return await secureStorage.getItem(key);
  }

  static async removeSecureData(key: string): Promise<void> {
    await secureStorage.removeItem(key);
  }

  // Clear all data (for logout)
  static async clearAllData(): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.execAsync(`
      DELETE FROM users;
      DELETE FROM transactions;
    `);
  }

  // Reset database completely (for testing)
  static async resetDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
    
    // Delete the database file
    try {
      await SQLite.deleteDatabaseAsync('offlipay.db');
    } catch (error) {
      console.log('Database file not found or already deleted');
    }
    
    // Reinitialize
    await this.initializeDatabase();
  }

  // Get all users (for debugging)
  static async getAllUsers(): Promise<User[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>('SELECT * FROM users');
    
    return results.map(result => ({
      ...result,
      balance: parseFloat(result.balance),
      createdAt: new Date(result.createdAt),
      lastSyncAt: result.lastSyncAt ? new Date(result.lastSyncAt) : undefined
    }));
  }
}