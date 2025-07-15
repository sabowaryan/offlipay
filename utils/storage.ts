import * as SQLite from 'expo-sqlite';
import { User, Transaction, QRPaymentData, CashInTransaction, Agent, Voucher, BankAccount } from '@/types';
import { secureStorage } from './secureStorage/index';

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

      CREATE TABLE IF NOT EXISTS cash_in_transactions (
        id TEXT PRIMARY KEY,
        walletId TEXT NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        signature TEXT NOT NULL,
        agentId TEXT,
        voucherCode TEXT,
        bankAccountId TEXT,
        fees REAL DEFAULT 0,
        syncStatus TEXT DEFAULT 'local'
      );

      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        phone TEXT NOT NULL,
        publicKey TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        maxAmount REAL NOT NULL,
        dailyLimit REAL NOT NULL,
        commission REAL NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vouchers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        isUsed INTEGER DEFAULT 0,
        usedBy TEXT,
        usedAt TEXT,
        expiresAt TEXT NOT NULL,
        signature TEXT NOT NULL,
        series TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        walletId TEXT NOT NULL,
        bankName TEXT NOT NULL,
        accountNumber TEXT NOT NULL,
        accountHolder TEXT NOT NULL,
        isVerified INTEGER DEFAULT 0,
        dailyLimit REAL NOT NULL,
        monthlyLimit REAL NOT NULL,
        lastUsed TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS balances (
        user_id TEXT PRIMARY KEY,
        current_balance REAL DEFAULT 0,
        pending_balance REAL DEFAULT 0,
        last_update TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(fromWalletId, toWalletId);
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_cash_in_wallet ON cash_in_transactions(walletId);
      CREATE INDEX IF NOT EXISTS idx_cash_in_status ON cash_in_transactions(status);
      CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
      CREATE INDEX IF NOT EXISTS idx_vouchers_used ON vouchers(isUsed);
      CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(isActive);
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_wallet ON bank_accounts(walletId);
      CREATE INDEX IF NOT EXISTS idx_balances_user ON balances(user_id);
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

      // Créer l'entrée de balance pour l'utilisateur
      await this.saveBalance({
        user_id: user.id,
        current_balance: user.balance,
        pending_balance: 0,
        last_update: new Date()
      });
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
      id: result.id,
      name: result.name,
      phone: result.phone,
      walletId: result.walletId,
      balance: result.balance,
      pin: result.pin,
      publicKey: result.publicKey,
      privateKey: result.privateKey,
      createdAt: new Date(result.createdAt),
      lastSyncAt: result.lastSyncAt ? new Date(result.lastSyncAt) : undefined
    };
  }

  static async updateUser(user: User): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `UPDATE users 
       SET name = ?, phone = ?, balance = ?, pin = ?, publicKey = ?, privateKey = ?, lastSyncAt = ?
       WHERE walletId = ?`,
      [
        user.name,
        user.phone,
        user.balance,
        user.pin,
        user.publicKey,
        user.privateKey,
        user.lastSyncAt?.toISOString() || null,
        user.walletId
      ]
    );

    // Mettre à jour la balance
    await this.updateBalance(user.id, user.balance, 0);
  }

  static async updateUserBalance(walletId: string, newBalance: number): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE users SET balance = ? WHERE walletId = ?',
      [newBalance, walletId]
    );

    // Récupérer l'ID utilisateur et mettre à jour la balance
    const user = await this.getUser(walletId);
    if (user) {
      await this.updateBalance(user.id, newBalance, 0);
    }
  }

  // Balance management
  static async saveBalance(balance: {
    user_id: string;
    current_balance: number;
    pending_balance: number;
    last_update: Date;
  }): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT OR REPLACE INTO balances 
       (user_id, current_balance, pending_balance, last_update) 
       VALUES (?, ?, ?, ?)`,
      [
        balance.user_id,
        balance.current_balance,
        balance.pending_balance,
        balance.last_update.toISOString()
      ]
    );
  }

  static async getBalance(userId: string): Promise<{
    current_balance: number;
    pending_balance: number;
    last_update: Date;
  } | null> {
    await this.initializeDatabase();
    
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM balances WHERE user_id = ?',
      [userId]
    );
    
    if (!result) return null;
    
    return {
      current_balance: result.current_balance,
      pending_balance: result.pending_balance,
      last_update: new Date(result.last_update)
    };
  }

  static async updateBalance(userId: string, currentBalance: number, pendingBalance: number): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `UPDATE balances 
       SET current_balance = ?, pending_balance = ?, last_update = ?
       WHERE user_id = ?`,
      [currentBalance, pendingBalance, new Date().toISOString(), userId]
    );
  }

  static async addPendingBalance(userId: string, amount: number): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE balances SET pending_balance = pending_balance + ?, last_update = ? WHERE user_id = ?',
      [amount, new Date().toISOString(), userId]
    );
  }

  static async clearPendingBalance(userId: string): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE balances SET pending_balance = 0, last_update = ? WHERE user_id = ?',
      [new Date().toISOString(), userId]
    );
  }

  // Transaction management
  static async saveTransaction(transaction: Transaction): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT INTO transactions 
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
      id: result.id,
      fromWalletId: result.fromWalletId,
      toWalletId: result.toWalletId,
      amount: result.amount,
      description: result.description,
      signature: result.signature,
      timestamp: new Date(result.timestamp),
      status: result.status,
      type: result.type,
      qrData: result.qrData,
      syncStatus: result.syncStatus
    }));
  }

  static async getPendingSyncTransactions(walletId: string): Promise<Transaction[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      `SELECT * FROM transactions 
       WHERE (fromWalletId = ? OR toWalletId = ?) AND syncStatus = 'local'
       ORDER BY timestamp ASC`,
      [walletId, walletId]
    );
    
    return results.map(result => ({
      id: result.id,
      fromWalletId: result.fromWalletId,
      toWalletId: result.toWalletId,
      amount: result.amount,
      description: result.description,
      signature: result.signature,
      timestamp: new Date(result.timestamp),
      status: result.status,
      type: result.type,
      qrData: result.qrData,
      syncStatus: result.syncStatus
    }));
  }

  // Cash-in transaction management
  static async saveCashInTransaction(transaction: CashInTransaction): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT INTO cash_in_transactions 
       (id, walletId, amount, method, status, timestamp, expiresAt, signature, agentId, voucherCode, bankAccountId, fees, syncStatus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.walletId,
        transaction.amount,
        transaction.method,
        transaction.status,
        transaction.timestamp.toISOString(),
        transaction.expiresAt.toISOString(),
        transaction.signature,
        transaction.agentId || null,
        transaction.voucherCode || null,
        transaction.bankAccountId || null,
        transaction.fees,
        transaction.syncStatus
      ]
    );
  }

  static async getCashInTransactions(walletId: string, limit: number = 50): Promise<CashInTransaction[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      `SELECT * FROM cash_in_transactions 
       WHERE walletId = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      [walletId, limit]
    );
    
    return results.map(result => ({
      id: result.id,
      walletId: result.walletId,
      amount: result.amount,
      method: result.method,
      status: result.status,
      timestamp: new Date(result.timestamp),
      expiresAt: new Date(result.expiresAt),
      signature: result.signature,
      agentId: result.agentId,
      voucherCode: result.voucherCode,
      bankAccountId: result.bankAccountId,
      fees: result.fees,
      syncStatus: result.syncStatus
    }));
  }

  static async updateCashInTransactionStatus(transactionId: string, status: CashInTransaction['status']): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE cash_in_transactions SET status = ? WHERE id = ?',
      [status, transactionId]
    );
  }

  static async getCashInTransaction(transactionId: string): Promise<CashInTransaction | null> {
    await this.initializeDatabase();
    
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM cash_in_transactions WHERE id = ?',
      [transactionId]
    );
    
    if (!result) return null;
    
    return {
      id: result.id,
      walletId: result.walletId,
      amount: result.amount,
      method: result.method,
      status: result.status,
      timestamp: new Date(result.timestamp),
      expiresAt: new Date(result.expiresAt),
      signature: result.signature,
      agentId: result.agentId,
      voucherCode: result.voucherCode,
      bankAccountId: result.bankAccountId,
      fees: result.fees,
      syncStatus: result.syncStatus
    };
  }

  // Agent management
  static async saveAgent(agent: Agent): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT OR REPLACE INTO agents 
       (id, name, location, phone, publicKey, isActive, maxAmount, dailyLimit, commission, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agent.id,
        agent.name,
        agent.location,
        agent.phone,
        agent.publicKey,
        agent.isActive ? 1 : 0,
        agent.maxAmount,
        agent.dailyLimit,
        agent.commission,
        agent.createdAt.toISOString()
      ]
    );
  }

  static async getActiveAgents(): Promise<Agent[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      'SELECT * FROM agents WHERE isActive = 1 ORDER BY name ASC'
    );
    
    return results.map(result => ({
      id: result.id,
      name: result.name,
      location: result.location,
      phone: result.phone,
      publicKey: result.publicKey,
      isActive: result.isActive === 1,
      maxAmount: result.maxAmount,
      dailyLimit: result.dailyLimit,
      commission: result.commission,
      createdAt: new Date(result.createdAt)
    }));
  }

  static async getAgentById(agentId: string): Promise<Agent | null> {
    await this.initializeDatabase();
    
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM agents WHERE id = ?',
      [agentId]
    );
    
    if (!result) return null;
    
    return {
      id: result.id,
      name: result.name,
      location: result.location,
      phone: result.phone,
      publicKey: result.publicKey,
      isActive: result.isActive === 1,
      maxAmount: result.maxAmount,
      dailyLimit: result.dailyLimit,
      commission: result.commission,
      createdAt: new Date(result.createdAt)
    };
  }

  // Voucher management
  static async saveVoucher(voucher: Voucher): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT OR REPLACE INTO vouchers 
       (id, code, amount, currency, isUsed, usedBy, usedAt, expiresAt, signature, series, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucher.id,
        voucher.code,
        voucher.amount,
        voucher.currency,
        voucher.isUsed ? 1 : 0,
        voucher.usedBy || null,
        voucher.usedAt?.toISOString() || null,
        voucher.expiresAt.toISOString(),
        voucher.signature,
        voucher.series,
        voucher.createdAt.toISOString()
      ]
    );
  }

  static async getVoucherByCode(code: string): Promise<Voucher | null> {
    await this.initializeDatabase();
    
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM vouchers WHERE code = ?',
      [code.toUpperCase()]
    );
    
    if (!result) return null;
    
    return {
      id: result.id,
      code: result.code,
      amount: result.amount,
      currency: result.currency,
      isUsed: result.isUsed === 1,
      usedBy: result.usedBy,
      usedAt: result.usedAt ? new Date(result.usedAt) : undefined,
      expiresAt: new Date(result.expiresAt),
      signature: result.signature,
      series: result.series,
      createdAt: new Date(result.createdAt)
    };
  }

  static async markVoucherAsUsed(voucherId: string, walletId: string): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE vouchers SET isUsed = 1, usedBy = ?, usedAt = ? WHERE id = ?',
      [walletId, new Date().toISOString(), voucherId]
    );
  }

  static async getVouchers(): Promise<Voucher[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      'SELECT * FROM vouchers ORDER BY createdAt DESC'
    );
    
    return results.map(result => ({
      id: result.id,
      code: result.code,
      amount: result.amount,
      currency: result.currency,
      isUsed: result.isUsed === 1,
      usedBy: result.usedBy,
      usedAt: result.usedAt ? new Date(result.usedAt) : undefined,
      expiresAt: new Date(result.expiresAt),
      signature: result.signature,
      series: result.series,
      createdAt: new Date(result.createdAt)
    }));
  }

  // Bank account management
  static async saveBankAccount(account: BankAccount): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      `INSERT OR REPLACE INTO bank_accounts 
       (id, walletId, bankName, accountNumber, accountHolder, isVerified, dailyLimit, monthlyLimit, lastUsed, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        account.walletId,
        account.bankName,
        account.accountNumber,
        account.accountHolder,
        account.isVerified ? 1 : 0,
        account.dailyLimit,
        account.monthlyLimit,
        account.lastUsed.toISOString(),
        account.createdAt.toISOString()
      ]
    );
  }

  static async getBankAccounts(walletId: string): Promise<BankAccount[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>(
      'SELECT * FROM bank_accounts WHERE walletId = ? ORDER BY createdAt DESC',
      [walletId]
    );
    
    return results.map(result => ({
      id: result.id,
      walletId: result.walletId,
      bankName: result.bankName,
      accountNumber: result.accountNumber,
      accountHolder: result.accountHolder,
      isVerified: result.isVerified === 1,
      dailyLimit: result.dailyLimit,
      monthlyLimit: result.monthlyLimit,
      lastUsed: new Date(result.lastUsed),
      createdAt: new Date(result.createdAt)
    }));
  }

  static async updateBankAccountLastUsed(accountId: string): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.runAsync(
      'UPDATE bank_accounts SET lastUsed = ? WHERE id = ?',
      [new Date().toISOString(), accountId]
    );
  }

  // Secure storage
  static async storeSecureData(key: string, value: string): Promise<void> {
    await secureStorage.setItemAsync(key, value);
  }

  static async getSecureData(key: string): Promise<string | null> {
    return await secureStorage.getItemAsync(key);
  }

  static async removeSecureData(key: string): Promise<void> {
    await secureStorage.deleteItemAsync(key);
  }

  // Database management
  static async clearAllData(): Promise<void> {
    await this.initializeDatabase();
    
    await this.db!.execAsync(`
      DELETE FROM transactions;
      DELETE FROM cash_in_transactions;
      DELETE FROM balances;
      DELETE FROM users;
      DELETE FROM agents;
      DELETE FROM vouchers;
      DELETE FROM bank_accounts;
    `);
  }

  static async resetDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
    
    await this.initializeDatabase();
  }

  static async getAllUsers(): Promise<User[]> {
    await this.initializeDatabase();
    
    const results = await this.db!.getAllAsync<any>('SELECT * FROM users ORDER BY createdAt DESC');
    
    return results.map(result => ({
      id: result.id,
      name: result.name,
      phone: result.phone,
      walletId: result.walletId,
      balance: result.balance,
      pin: result.pin,
      publicKey: result.publicKey,
      privateKey: result.privateKey,
      createdAt: new Date(result.createdAt),
      lastSyncAt: result.lastSyncAt ? new Date(result.lastSyncAt) : undefined
    }));
  }
}