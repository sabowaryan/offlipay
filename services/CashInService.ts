import { StorageService } from '@/utils/storage';
import { 
  CashInMethod, 
  CashInTransaction, 
  Agent, 
  Voucher, 
  BankAccount,
  User 
} from '@/types';
import { WalletService } from './WalletService';

export class CashInService {
  private static instance: CashInService;

  private constructor() {}

  static getInstance(): CashInService {
    if (!CashInService.instance) {
      CashInService.instance = new CashInService();
    }
    return CashInService.instance;
  }

  // Récupérer les agents disponibles
  async getAvailableAgents(): Promise<Agent[]> {
    try {
      const agents = await StorageService.getAgents();
      return agents.filter(agent => agent.isActive);
    } catch (error) {
      console.error('Erreur lors de la récupération des agents:', error);
      return [];
    }
  }

  // Récupérer les vouchers disponibles
  async getAvailableVouchers(): Promise<Voucher[]> {
    try {
      const vouchers = await StorageService.getVouchers();
      return vouchers.filter(voucher => !voucher.isUsed && voucher.expiresAt > new Date());
    } catch (error) {
      console.error('Erreur lors de la récupération des vouchers:', error);
      return [];
    }
  }

  // Récupérer les comptes bancaires de l'utilisateur
  async getUserBankAccounts(walletId: string): Promise<BankAccount[]> {
    try {
      const accounts = await StorageService.getBankAccounts();
      return accounts.filter(account => account.walletId === walletId);
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes bancaires:', error);
      return [];
    }
  }

  // Valider un voucher
  async validateVoucher(code: string): Promise<{ isValid: boolean; voucher?: Voucher; error?: string }> {
    try {
      const vouchers = await this.getAvailableVouchers();
      const voucher = vouchers.find(v => v.code === code.toUpperCase());

      if (!voucher) {
        return { isValid: false, error: 'Voucher introuvable' };
      }

      if (voucher.isUsed) {
        return { isValid: false, error: 'Voucher déjà utilisé' };
      }

      if (voucher.expiresAt <= new Date()) {
        return { isValid: false, error: 'Voucher expiré' };
      }

      return { isValid: true, voucher };
    } catch (error) {
      console.error('Erreur lors de la validation du voucher:', error);
      return { isValid: false, error: 'Erreur de validation' };
    }
  }

  // Créer une transaction de cash-in
  async createCashInTransaction(data: {
    walletId: string;
    amount: number;
    method: CashInMethod;
    agentId?: string;
    voucherCode?: string;
    bankAccountId?: string;
  }): Promise<CashInTransaction> {
    try {
      const user = WalletService.getCurrentUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Calculer les frais selon la méthode
      const fees = await this.calculateFees(data.amount, data.method, data.agentId);
      
      // Créer la transaction
      const transaction: CashInTransaction = {
        id: `cash_in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletId: data.walletId,
        amount: data.amount,
        method: data.method,
        status: 'pending',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire dans 24h
        signature: '', // À implémenter avec la cryptographie
        agentId: data.agentId,
        voucherCode: data.voucherCode,
        bankAccountId: data.bankAccountId,
        fees,
        syncStatus: 'local',
      };

      // Sauvegarder la transaction
      await StorageService.saveCashInTransaction(transaction);

      return transaction;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction cash-in:', error);
      throw error;
    }
  }

  // Calculer les frais
  private async calculateFees(amount: number, method: CashInMethod, agentId?: string): Promise<number> {
    const baseFees = {
      agent: 0.50,
      voucher: 0.25,
      banking: 1.00,
    };

    const percentageFees = {
      agent: 1.5,
      voucher: 0.5,
      banking: 0.8,
    };

    let fixedFee = baseFees[method];
    let percentageFee = percentageFees[method];

    // Ajuster selon l'agent si applicable
    if (method === 'agent' && agentId) {
      const agents = await this.getAvailableAgents();
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        fixedFee = agent.commission;
        percentageFee = 0; // Les agents ont des frais fixes
      }
    }

    const percentageAmount = (amount * percentageFee) / 100;
    return fixedFee + percentageAmount;
  }

  // Traiter une transaction de cash-in
  async processCashInTransaction(transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await StorageService.getCashInTransaction(transactionId);
      if (!transaction) {
        return { success: false, error: 'Transaction introuvable' };
      }

      if (transaction.status !== 'pending') {
        return { success: false, error: 'Transaction déjà traitée' };
      }

      if (transaction.expiresAt <= new Date()) {
        await this.updateTransactionStatus(transactionId, 'failed');
        return { success: false, error: 'Transaction expirée' };
      }

      // Traitement selon la méthode
      switch (transaction.method) {
        case 'agent':
          return await this.processAgentTransaction(transaction);
        case 'voucher':
          return await this.processVoucherTransaction(transaction);
        case 'banking':
          return await this.processBankingTransaction(transaction);
        default:
          return { success: false, error: 'Méthode non supportée' };
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la transaction:', error);
      return { success: false, error: 'Erreur de traitement' };
    }
  }

  // Traiter une transaction agent
  private async processAgentTransaction(transaction: CashInTransaction): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulation de validation par l'agent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.updateTransactionStatus(transaction.id, 'validated');
      await this.creditUserWallet(transaction.walletId, transaction.amount);
      
      return { success: true };
    } catch (error) {
      await this.updateTransactionStatus(transaction.id, 'failed');
      return { success: false, error: 'Échec de la validation par l\'agent' };
    }
  }

  // Traiter une transaction voucher
  private async processVoucherTransaction(transaction: CashInTransaction): Promise<{ success: boolean; error?: string }> {
    try {
      if (!transaction.voucherCode) {
        return { success: false, error: 'Code voucher manquant' };
      }

      const validation = await this.validateVoucher(transaction.voucherCode);
      if (!validation.isValid || !validation.voucher) {
        await this.updateTransactionStatus(transaction.id, 'failed');
        return { success: false, error: validation.error || 'Voucher invalide' };
      }

      // Marquer le voucher comme utilisé
      await StorageService.markVoucherAsUsed(validation.voucher.id, transaction.walletId);
      
      await this.updateTransactionStatus(transaction.id, 'completed');
      await this.creditUserWallet(transaction.walletId, transaction.amount);
      
      return { success: true };
    } catch (error) {
      await this.updateTransactionStatus(transaction.id, 'failed');
      return { success: false, error: 'Échec du traitement du voucher' };
    }
  }

  // Traiter une transaction bancaire
  private async processBankingTransaction(transaction: CashInTransaction): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulation de virement bancaire
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await this.updateTransactionStatus(transaction.id, 'completed');
      await this.creditUserWallet(transaction.walletId, transaction.amount);
      
      return { success: true };
    } catch (error) {
      await this.updateTransactionStatus(transaction.id, 'failed');
      return { success: false, error: 'Échec du virement bancaire' };
    }
  }

  // Mettre à jour le statut d'une transaction
  private async updateTransactionStatus(transactionId: string, status: CashInTransaction['status']): Promise<void> {
    try {
      await StorageService.updateCashInTransactionStatus(transactionId, status);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  }

  // Créditer le portefeuille utilisateur
  private async creditUserWallet(walletId: string, amount: number): Promise<void> {
    try {
      const user = WalletService.getCurrentUser();
      if (user && user.walletId === walletId) {
        user.balance += amount;
        await StorageService.updateUser(user);
      }
    } catch (error) {
      console.error('Erreur lors du crédit du portefeuille:', error);
    }
  }

  // Récupérer l'historique des transactions cash-in
  async getCashInHistory(walletId: string, limit: number = 50): Promise<CashInTransaction[]> {
    try {
      const transactions = await StorageService.getCashInTransactions();
      return transactions
        .filter(t => t.walletId === walletId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }
} 