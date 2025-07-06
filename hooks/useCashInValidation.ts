import { useState, useCallback } from 'react';
import { CashInMethod } from '@/types';

interface ValidationErrors {
  amount?: string;
  method?: string;
  agentId?: string;
  voucherCode?: string;
  bankAccountId?: string;
}

interface ValidationRules {
  minAmount: number;
  maxAmount: number;
  requireAgent?: boolean;
  requireVoucher?: boolean;
  requireBankAccount?: boolean;
}

export function useCashInValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateAmount = useCallback((amount: string): string | undefined => {
    if (!amount || amount.trim() === '') {
      return 'Le montant est requis';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return 'Le montant doit être un nombre valide';
    }

    if (numAmount <= 0) {
      return 'Le montant doit être supérieur à 0';
    }

    if (numAmount < rules.minAmount) {
      return `Le montant minimum est de ${rules.minAmount}€`;
    }

    if (numAmount > rules.maxAmount) {
      return `Le montant maximum est de ${rules.maxAmount}€`;
    }

    return undefined;
  }, [rules.minAmount, rules.maxAmount]);

  const validateMethod = useCallback((method: CashInMethod | null): string | undefined => {
    if (!method) {
      return 'Veuillez sélectionner une méthode';
    }
    return undefined;
  }, []);

  const validateAgent = useCallback((agentId: string | undefined, method: CashInMethod): string | undefined => {
    if (method === 'agent' && rules.requireAgent && !agentId) {
      return 'Veuillez sélectionner un agent';
    }
    return undefined;
  }, [rules.requireAgent]);

  const validateVoucher = useCallback((voucherCode: string, method: CashInMethod): string | undefined => {
    if (method === 'voucher' && rules.requireVoucher) {
      if (!voucherCode || voucherCode.trim() === '') {
        return 'Le code du voucher est requis';
      }
      if (voucherCode.length < 6) {
        return 'Le code du voucher doit contenir au moins 6 caractères';
      }
    }
    return undefined;
  }, [rules.requireVoucher]);

  const validateBankAccount = useCallback((bankAccountId: string | undefined, method: CashInMethod): string | undefined => {
    if (method === 'banking' && rules.requireBankAccount && !bankAccountId) {
      return 'Veuillez sélectionner un compte bancaire';
    }
    return undefined;
  }, [rules.requireBankAccount]);

  const validateForm = useCallback((data: {
    amount: string;
    method: CashInMethod | null;
    agentId?: string;
    voucherCode?: string;
    bankAccountId?: string;
  }): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation du montant
    const amountError = validateAmount(data.amount);
    if (amountError) {
      newErrors.amount = amountError;
    }

    // Validation de la méthode
    const methodError = validateMethod(data.method);
    if (methodError) {
      newErrors.method = methodError;
    }

    // Validation spécifique selon la méthode
    if (data.method) {
      const agentError = validateAgent(data.agentId, data.method);
      if (agentError) {
        newErrors.agentId = agentError;
      }

      const voucherError = validateVoucher(data.voucherCode || '', data.method);
      if (voucherError) {
        newErrors.voucherCode = voucherError;
      }

      const bankAccountError = validateBankAccount(data.bankAccountId, data.method);
      if (bankAccountError) {
        newErrors.bankAccountId = bankAccountError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateAmount, validateMethod, validateAgent, validateVoucher, validateBankAccount]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: keyof ValidationErrors, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof ValidationErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateForm,
    validateAmount,
    validateMethod,
    validateAgent,
    validateVoucher,
    validateBankAccount,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
} 