import { User, Transaction, QRPaymentData, WalletBalance } from '@/types';
import { CryptoUtils } from '@/utils/crypto';
import { StorageService } from '@/utils/storage';

export class WalletService {
  private static currentUser: User | null = null;
  private static currentUserMode: 'buyer' | 'seller' = 'buyer';

  // Check if phone number already exists
  static async checkPhoneExists(phone: string): Promise<boolean> {
    return await StorageService.checkPhoneExists(phone);
  }

  // Check if wallet ID already exists
  static async checkWalletIdExists(walletId: string): Promise<boolean> {
    return await StorageService.checkWalletIdExists(walletId);
  }

  // Initialize wallet for new user
  static async createWallet(name: string, phone: string, pin: string): Promise<User> {
    // Validate input data
    if (!name.trim()) {
      throw new Error('Le nom est requis');
    }
    
    if (!phone.trim()) {
      throw new Error('Le numéro de téléphone est requis');
    }
    
    if (pin.length < 4) {
      throw new Error('Le PIN doit contenir au moins 4 chiffres');
    }

    // Check if phone number already exists
    const phoneExists = await this.checkPhoneExists(phone);
    if (phoneExists) {
      throw new Error('Ce numéro de téléphone est déjà utilisé');
    }

    // Generate unique wallet ID
    let walletId: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      walletId = await CryptoUtils.generateWalletId();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Impossible de générer un ID wallet unique');
      }
    } while (await this.checkWalletIdExists(walletId));

    const { publicKey, privateKey } = await CryptoUtils.generateKeyPair();
    const hashedPin = await CryptoUtils.hashPin(pin, walletId);
    
    const user: User = {
      id: walletId,
      name: name.trim(),
      phone: phone.trim(),
      walletId,
      balance: 0,
      pin: hashedPin,
      publicKey,
      privateKey,
      createdAt: new Date(),
    };

    await StorageService.saveUser(user);
    await StorageService.storeSecureData('current_wallet', walletId);
    
    this.currentUser = user;
    return user;
  }

  // Login to existing wallet
  static async loginWallet(walletId: string, pin: string): Promise<User> {
    // Validate input data
    if (!walletId.trim()) {
      throw new Error('L\'ID Wallet est requis');
    }
    
    if (!pin.trim()) {
      throw new Error('Le PIN est requis');
    }

    const user = await StorageService.getUser(walletId.trim());
    if (!user) {
      throw new Error('Wallet non trouvé');
    }

    const hashedPin = await CryptoUtils.hashPin(pin, walletId);
    if (hashedPin !== user.pin) {
      throw new Error('PIN incorrect');
    }

    await StorageService.storeSecureData('current_wallet', walletId);
    this.currentUser = user;
    return user;
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Load current user from storage
  static async loadCurrentUser(): Promise<User | null> {
    const walletId = await StorageService.getSecureData('current_wallet');
    if (!walletId) return null;

    const user = await StorageService.getUser(walletId);
    if (user) {
      this.currentUser = user;
    }
    return user;
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Get wallet balance
  static async getWalletBalance(walletId: string): Promise<WalletBalance> {
    const user = await StorageService.getUser(walletId);
    if (!user) {
      throw new Error('Wallet not found');
    }

    const transactions = await StorageService.getTransactions(walletId);
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    
    const pendingAmount = pendingTransactions.reduce((sum, t) => {
      return sum + (t.type === 'sent' ? -t.amount : t.amount);
    }, 0);

    return {
      available: user.balance,
      pending: pendingAmount,
      total: user.balance + pendingAmount
    };
  }

  // Generate QR code for payment request
  static async generatePaymentQR(
    amount: number,
    description: string,
    receiverWalletId: string
  ): Promise<string> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const nonce = await CryptoUtils.generateNonce();
    const timestamp = Date.now();
    
    const paymentData: QRPaymentData = {
      amount,
      fromWalletId: this.currentUser.walletId,
      toWalletId: receiverWalletId,
      description,
      timestamp,
      signature: '',
      nonce
    };

    // Create signature
    const dataToSign = `${amount}${this.currentUser.walletId}${receiverWalletId}${description}${timestamp}${nonce}`;
    const signature = await CryptoUtils.signTransaction(dataToSign, this.currentUser.privateKey);
    paymentData.signature = signature;

    return CryptoUtils.createQRData(paymentData);
  }

  // Process scanned QR payment
  static async processQRPayment(qrData: string): Promise<Transaction> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const paymentData: QRPaymentData = CryptoUtils.parseQRData(qrData);
    
    // Verify signature
    const dataToSign = `${paymentData.amount}${paymentData.fromWalletId}${paymentData.toWalletId}${paymentData.description}${paymentData.timestamp}${paymentData.nonce}`;
    const isValidSignature = await CryptoUtils.verifySignature(
      dataToSign,
      paymentData.signature,
      paymentData.fromWalletId // In a real implementation, you'd get the public key from the sender
    );

    if (!isValidSignature) {
      throw new Error('Invalid payment signature');
    }

    // Check if we have sufficient balance (for sender)
    const isSender = paymentData.fromWalletId === this.currentUser.walletId;
    if (isSender && this.currentUser.balance < paymentData.amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction: Transaction = {
      id: await CryptoUtils.generateWalletId(),
      fromWalletId: paymentData.fromWalletId,
      toWalletId: paymentData.toWalletId,
      amount: paymentData.amount,
      description: paymentData.description,
      signature: paymentData.signature,
      timestamp: new Date(paymentData.timestamp),
      status: 'completed',
      type: isSender ? 'sent' : 'received',
      qrData,
      syncStatus: 'local'
    };

    // Update balance
    const newBalance = isSender 
      ? this.currentUser.balance - paymentData.amount
      : this.currentUser.balance + paymentData.amount;
    
    await StorageService.updateUserBalance(this.currentUser.walletId, newBalance);
    this.currentUser.balance = newBalance;

    // Save transaction
    await StorageService.saveTransaction(transaction);

    return transaction;
  }

  // Get transaction history
  static async getTransactionHistory(limit: number = 50): Promise<Transaction[]> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    return await StorageService.getTransactions(this.currentUser.walletId, limit);
  }

  // Add money to wallet (for demo purposes)
  static async addMoney(amount: number): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const newBalance = this.currentUser.balance + amount;
    await StorageService.updateUserBalance(this.currentUser.walletId, newBalance);
    this.currentUser.balance = newBalance;

    // Create a transaction record
    const transaction: Transaction = {
      id: await CryptoUtils.generateWalletId(),
      fromWalletId: 'SYSTEM',
      toWalletId: this.currentUser.walletId,
      amount,
      description: 'Added money to wallet',
      signature: 'SYSTEM',
      timestamp: new Date(),
      status: 'completed',
      type: 'received',
      syncStatus: 'local'
    };

    await StorageService.saveTransaction(transaction);
  }

  // Logout
  static async logout(): Promise<void> {
    await StorageService.removeSecureData('current_wallet');
    this.currentUser = null;
  }

  // Get current user mode
  static getCurrentUserMode(): 'buyer' | 'seller' {
    return this.currentUserMode;
  }

  // Set current user mode
  static setCurrentUserMode(mode: 'buyer' | 'seller'): void {
    this.currentUserMode = mode;
  }
}