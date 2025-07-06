export interface User {
  id: string;
  name: string;
  phone: string;
  walletId: string;
  balance: number;
  pin: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  lastSyncAt?: Date;
}

export interface Transaction {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string;
  signature: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  type: 'sent' | 'received';
  qrData?: string;
  syncStatus: 'local' | 'synced' | 'pending_sync';
}

export interface QRPaymentData {
  amount: number;
  fromWalletId: string;
  toWalletId: string;
  description: string;
  timestamp: number;
  signature: string;
  nonce: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
}

export type UserMode = 'buyer' | 'seller';

export interface SyncConfig {
  bluetoothEnabled: boolean;
  smsEnabled: boolean;
  wifiEnabled: boolean;
  autoSync: boolean;
  syncInterval: number;
}

// Types pour le système d'alimentation
export type CashInMethod = 'agent' | 'voucher' | 'banking';

export interface CashInTransaction {
  id: string;
  walletId: string;
  amount: number;
  method: CashInMethod;
  status: 'pending' | 'completed' | 'failed' | 'validated';
  timestamp: Date;
  expiresAt: Date;
  signature: string;
  agentId?: string;
  voucherCode?: string;
  bankAccountId?: string;
  fees: number;
  syncStatus: 'local' | 'synced' | 'pending_sync';
}

export interface Agent {
  id: string;
  name: string;
  location: string;
  phone: string;
  publicKey: string;
  isActive: boolean;
  maxAmount: number;
  dailyLimit: number;
  commission: number;
  createdAt: Date;
}

export interface Voucher {
  id: string;
  code: string;
  amount: number;
  currency: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  expiresAt: Date;
  signature: string;
  series: string;
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  walletId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isVerified: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  lastUsed: Date;
  createdAt: Date;
}

export interface CashInQRData {
  type: 'cash_in';
  amount: number;
  currency: string;
  agentId?: string;
  voucherId?: string;
  expiration: string;
  signature: string;
  publicKey: string;
  nonce: string;
}