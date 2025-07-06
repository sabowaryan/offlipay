import { renderHook, act } from '@testing-library/react-hooks';
import { useCashInValidation } from '@/hooks/useCashInValidation';
import { CashInMethod } from '@/types';

describe('useCashInValidation', () => {
  const defaultRules = {
    minAmount: 1,
    maxAmount: 10000,
    requireAgent: true,
    requireVoucher: true,
    requireBankAccount: true,
  };

  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    expect(result.current.errors).toEqual({});
  });

  it('should validate amount correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Test montant vide
    act(() => {
      const isValid = result.current.validateAmount('');
      expect(isValid).toBe('Le montant est requis');
    });

    // Test montant invalide
    act(() => {
      const isValid = result.current.validateAmount('invalid');
      expect(isValid).toBe('Le montant doit être un nombre valide');
    });

    // Test montant négatif
    act(() => {
      const isValid = result.current.validateAmount('-10');
      expect(isValid).toBe('Le montant doit être supérieur à 0');
    });

    // Test montant trop petit
    act(() => {
      const isValid = result.current.validateAmount('0.5');
      expect(isValid).toBe('Le montant minimum est de 1€');
    });

    // Test montant trop grand
    act(() => {
      const isValid = result.current.validateAmount('15000');
      expect(isValid).toBe('Le montant maximum est de 10000€');
    });

    // Test montant valide
    act(() => {
      const isValid = result.current.validateAmount('100');
      expect(isValid).toBeUndefined();
    });
  });

  it('should validate method correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Test méthode manquante
    act(() => {
      const isValid = result.current.validateMethod(null);
      expect(isValid).toBe('Veuillez sélectionner une méthode');
    });

    // Test méthode valide
    act(() => {
      const isValid = result.current.validateMethod('agent');
      expect(isValid).toBeUndefined();
    });
  });

  it('should validate agent correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Test agent requis mais manquant
    act(() => {
      const isValid = result.current.validateAgent(undefined, 'agent');
      expect(isValid).toBe('Veuillez sélectionner un agent');
    });

    // Test agent fourni
    act(() => {
      const isValid = result.current.validateAgent('agent123', 'agent');
      expect(isValid).toBeUndefined();
    });

    // Test agent non requis pour autres méthodes
    act(() => {
      const isValid = result.current.validateAgent(undefined, 'voucher');
      expect(isValid).toBeUndefined();
    });
  });

  it('should validate voucher correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Test voucher requis mais manquant
    act(() => {
      const isValid = result.current.validateVoucher('', 'voucher');
      expect(isValid).toBe('Le code du voucher est requis');
    });

    // Test voucher trop court
    act(() => {
      const isValid = result.current.validateVoucher('ABC', 'voucher');
      expect(isValid).toBe('Le code du voucher doit contenir au moins 6 caractères');
    });

    // Test voucher valide
    act(() => {
      const isValid = result.current.validateVoucher('ABC123456', 'voucher');
      expect(isValid).toBeUndefined();
    });

    // Test voucher non requis pour autres méthodes
    act(() => {
      const isValid = result.current.validateVoucher('', 'agent');
      expect(isValid).toBeUndefined();
    });
  });

  it('should validate bank account correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Test compte bancaire requis mais manquant
    act(() => {
      const isValid = result.current.validateBankAccount(undefined, 'banking');
      expect(isValid).toBe('Veuillez sélectionner un compte bancaire');
    });

    // Test compte bancaire fourni
    act(() => {
      const isValid = result.current.validateBankAccount('account123', 'banking');
      expect(isValid).toBeUndefined();
    });

    // Test compte bancaire non requis pour autres méthodes
    act(() => {
      const isValid = result.current.validateBankAccount(undefined, 'agent');
      expect(isValid).toBeUndefined();
    });
  });

  it('should validate complete form correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Test formulaire incomplet
    act(() => {
      const isValid = result.current.validateForm({
        amount: '',
        method: null,
      });
      expect(isValid).toBe(false);
      expect(result.current.errors.amount).toBe('Le montant est requis');
      expect(result.current.errors.method).toBe('Veuillez sélectionner une méthode');
    });

    // Test formulaire complet pour agent
    act(() => {
      const isValid = result.current.validateForm({
        amount: '100',
        method: 'agent',
        agentId: 'agent123',
      });
      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    // Test formulaire complet pour voucher
    act(() => {
      const isValid = result.current.validateForm({
        amount: '100',
        method: 'voucher',
        voucherCode: 'ABC123456',
      });
      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    // Test formulaire complet pour banking
    act(() => {
      const isValid = result.current.validateForm({
        amount: '100',
        method: 'banking',
        bankAccountId: 'account123',
      });
      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  it('should clear errors correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Créer des erreurs
    act(() => {
      result.current.validateForm({
        amount: '',
        method: null,
      });
    });
    
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    
    // Effacer les erreurs
    act(() => {
      result.current.clearErrors();
    });
    
    expect(result.current.errors).toEqual({});
  });

  it('should set and clear field errors correctly', () => {
    const { result } = renderHook(() => useCashInValidation(defaultRules));
    
    // Définir une erreur de champ
    act(() => {
      result.current.setFieldError('amount', 'Erreur personnalisée');
    });
    
    expect(result.current.errors.amount).toBe('Erreur personnalisée');
    
    // Effacer l'erreur de champ
    act(() => {
      result.current.clearFieldError('amount');
    });
    
    expect(result.current.errors.amount).toBeUndefined();
  });
}); 