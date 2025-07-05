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