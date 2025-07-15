import { CashInService } from '@/services/CashInService';
import { StorageService } from '@/utils/storage';
import { WalletService } from '@/services/WalletService';
import { CashInMethod, Agent, Voucher, BankAccount, CashInTransaction } from '@/types';

// Create a mock object with the methods we need
const mockStorageService = {
  getAgents: jest.fn(),
  getVouchers: jest.fn(),
  getBankAccounts: jest.fn(),
  saveCashInTransaction: jest.fn(),
  getCashInTransaction: jest.fn(),
  updateCashInTransactionStatus: jest.fn(),
  getCashInTransactions: jest.fn(),
  markVoucherAsUsed: jest.fn(),
  updateUser: jest.fn(),
};

// Mock des dépendances
jest.mock('@/utils/storage', () => ({
  StorageService: mockStorageService
}));
jest.mock('@/services/WalletService');

const mockWalletService = WalletService as jest.Mocked<typeof WalletService>;

describe('CashInService', () => {
  let cashInService: CashInService;

  beforeEach(() => {
    cashInService = CashInService.getInstance();
    jest.clearAllMocks();
  });

  describe('getAvailableAgents', () => {
    it('should return active agents only', async () => {
      const mockAgents: Agent[] = [
        {
          id: 'agent1',
          name: 'Agent 1',
          location: 'Paris',
          phone: '0123456789',
          publicKey: 'key1',
          isActive: true,
          maxAmount: 1000,
          dailyLimit: 5000,
          commission: 0.5,
          createdAt: new Date(),
        },
        {
          id: 'agent2',
          name: 'Agent 2',
          location: 'Lyon',
          phone: '0987654321',
          publicKey: 'key2',
          isActive: false,
          maxAmount: 1000,
          dailyLimit: 5000,
          commission: 0.5,
          createdAt: new Date(),
        },
      ];

      mockStorageService.getAgents = jest.fn().mockResolvedValue(mockAgents);

      const result = await cashInService.getAvailableAgents();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('agent1');
      expect(result[0].isActive).toBe(true);
    });

    it('should return empty array when no agents available', async () => {
      mockStorageService.getAgents = jest.fn().mockResolvedValue([]);

      const result = await cashInService.getAvailableAgents();

      expect(result).toEqual([]);
    });
  });

  describe('getAvailableVouchers', () => {
    it('should return unused and non-expired vouchers only', async () => {
      const mockVouchers: Voucher[] = [
        {
          id: 'voucher1',
          code: 'ABC123',
          amount: 100,
          currency: 'EUR',
          isUsed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire dans 24h
          signature: 'sig1',
          series: 'SERIES1',
          createdAt: new Date(),
        },
        {
          id: 'voucher2',
          code: 'DEF456',
          amount: 200,
          currency: 'EUR',
          isUsed: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          signature: 'sig2',
          series: 'SERIES2',
          createdAt: new Date(),
        },
        {
          id: 'voucher3',
          code: 'GHI789',
          amount: 300,
          currency: 'EUR',
          isUsed: false,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expiré
          signature: 'sig3',
          series: 'SERIES3',
          createdAt: new Date(),
        },
      ];

      mockStorageService.getVouchers = jest.fn().mockResolvedValue(mockVouchers);

      const result = await cashInService.getAvailableVouchers();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('voucher1');
      expect(result[0].isUsed).toBe(false);
    });
  });

  describe('getUserBankAccounts', () => {
    it('should return bank accounts for specific wallet', async () => {
      const mockAccounts: BankAccount[] = [
        {
          id: 'account1',
          walletId: 'wallet1',
          bankName: 'Bank A',
          accountNumber: '123456789',
          accountHolder: 'John Doe',
          isVerified: true,
          dailyLimit: 1000,
          monthlyLimit: 10000,
          lastUsed: new Date(),
          createdAt: new Date(),
        },
      ];

      mockStorageService.getBankAccounts = jest.fn().mockResolvedValue(mockAccounts);

      const result = await cashInService.getUserBankAccounts('wallet1');

      expect(result).toEqual(mockAccounts);
      expect(mockStorageService.getBankAccounts).toHaveBeenCalledWith('wallet1');
    });
  });

  describe('validateVoucher', () => {
    it('should return valid voucher info for valid code', async () => {
      const mockVoucher: Voucher = {
        id: 'voucher1',
        code: 'ABC123',
        amount: 100,
        currency: 'EUR',
        isUsed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signature: 'sig1',
        series: 'SERIES1',
        createdAt: new Date(),
      };

      mockStorageService.getVouchers = jest.fn().mockResolvedValue([mockVoucher]);

      const result = await cashInService.validateVoucher('ABC123');

      expect(result.isValid).toBe(true);
      expect(result.voucher).toEqual(mockVoucher);
    });

    it('should return invalid for used voucher', async () => {
      const mockVoucher: Voucher = {
        id: 'voucher1',
        code: 'ABC123',
        amount: 100,
        currency: 'EUR',
        isUsed: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signature: 'sig1',
        series: 'SERIES1',
        createdAt: new Date(),
      };

      mockStorageService.getVouchers = jest.fn().mockResolvedValue([mockVoucher]);

      const result = await cashInService.validateVoucher('ABC123');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Voucher déjà utilisé');
    });

    it('should return invalid for expired voucher', async () => {
      const mockVoucher: Voucher = {
        id: 'voucher1',
        code: 'ABC123',
        amount: 100,
        currency: 'EUR',
        isUsed: false,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expiré
        signature: 'sig1',
        series: 'SERIES1',
        createdAt: new Date(),
      };

      mockStorageService.getVouchers = jest.fn().mockResolvedValue([mockVoucher]);

      const result = await cashInService.validateVoucher('ABC123');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Voucher expiré');
    });

    it('should return invalid for non-existent voucher', async () => {
      mockStorageService.getVouchers = jest.fn().mockResolvedValue([]);

      const result = await cashInService.validateVoucher('INVALID');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Voucher introuvable');
    });
  });

  describe('createCashInTransaction', () => {
    it('should create and save cash-in transaction', async () => {
      const mockUser = {
        id: 'user1',
        walletId: 'wallet1',
        balance: 100,
        name: 'John Doe',
        phone: '0123456789',
        pin: '1234',
        publicKey: 'pubkey1',
        privateKey: 'privkey1',
        createdAt: new Date(),
      };

      mockWalletService.getCurrentUser = jest.fn().mockReturnValue(mockUser);
      mockStorageService.saveCashInTransaction = jest.fn().mockResolvedValue(undefined);

      const transactionData = {
        walletId: 'wallet1',
        amount: 100,
        method: 'agent' as CashInMethod,
        agentId: 'agent1',
      };

      const result = await cashInService.createCashInTransaction(transactionData);

      expect(result.walletId).toBe('wallet1');
      expect(result.amount).toBe(100);
      expect(result.method).toBe('agent');
      expect(result.status).toBe('pending');
      expect(mockStorageService.saveCashInTransaction).toHaveBeenCalledWith(result);
    });

    it('should throw error when user not logged in', async () => {
      mockWalletService.getCurrentUser = jest.fn().mockReturnValue(null);

      const transactionData = {
        walletId: 'wallet1',
        amount: 100,
        method: 'agent' as CashInMethod,
      };

      await expect(cashInService.createCashInTransaction(transactionData))
        .rejects.toThrow('Utilisateur non connecté');
    });
  });

  describe('processCashInTransaction', () => {
    it('should process agent transaction successfully', async () => {
      const mockTransaction: CashInTransaction = {
        id: 'transaction1',
        walletId: 'wallet1',
        amount: 100,
        method: 'agent',
        status: 'pending',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signature: 'sig1',
        fees: 0.5,
        syncStatus: 'local',
      };

      mockStorageService.getCashInTransaction = jest.fn().mockResolvedValue(mockTransaction);
      mockStorageService.updateCashInTransactionStatus = jest.fn().mockResolvedValue(undefined);

      const result = await cashInService.processCashInTransaction('transaction1');

      expect(result.success).toBe(true);
      expect(mockStorageService.updateCashInTransactionStatus).toHaveBeenCalledWith('transaction1', 'validated');
    });

    it('should return error for non-existent transaction', async () => {
      mockStorageService.getCashInTransaction = jest.fn().mockResolvedValue(null);

      const result = await cashInService.processCashInTransaction('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction introuvable');
    });

    it('should return error for already processed transaction', async () => {
      const mockTransaction: CashInTransaction = {
        id: 'transaction1',
        walletId: 'wallet1',
        amount: 100,
        method: 'agent',
        status: 'completed',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signature: 'sig1',
        fees: 0.5,
        syncStatus: 'local',
      };

      mockStorageService.getCashInTransaction = jest.fn().mockResolvedValue(mockTransaction);

      const result = await cashInService.processCashInTransaction('transaction1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction déjà traitée');
    });
  });

  describe('getCashInHistory', () => {
    it('should return cash-in history for wallet', async () => {
      const mockTransactions: CashInTransaction[] = [
        {
          id: 'transaction1',
          walletId: 'wallet1',
          amount: 100,
          method: 'agent',
          status: 'completed',
          timestamp: new Date(),
          expiresAt: new Date(),
          signature: 'sig1',
          fees: 0.5,
          syncStatus: 'synced',
        },
      ];

      mockStorageService.getCashInTransactions = jest.fn().mockResolvedValue(mockTransactions);

      const result = await cashInService.getCashInHistory('wallet1', 10);

      expect(result).toEqual(mockTransactions);
      expect(mockStorageService.getCashInTransactions).toHaveBeenCalledWith('wallet1', 10);
    });
  });
}); 