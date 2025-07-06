import { useMemo } from 'react';
import { CashInMethod, Agent, BankAccount } from '@/types';

interface FeeCalculation {
  amount: number;
  fees: number;
  totalAmount: number;
  feePercentage: number;
  feeType: 'fixed' | 'percentage' | 'mixed';
}

interface FeeRates {
  agent: {
    fixed: number;
    percentage: number;
  };
  voucher: {
    fixed: number;
    percentage: number;
  };
  banking: {
    fixed: number;
    percentage: number;
  };
}

const DEFAULT_FEE_RATES: FeeRates = {
  agent: {
    fixed: 0.50,
    percentage: 1.5,
  },
  voucher: {
    fixed: 0.25,
    percentage: 0.5,
  },
  banking: {
    fixed: 1.00,
    percentage: 0.8,
  },
};

export function useCashInFees() {
  const calculateFees = useMemo(() => {
    return (
      amount: number,
      method: CashInMethod,
      selectedAgent?: Agent,
      selectedBankAccount?: BankAccount
    ): FeeCalculation => {
      const rates = DEFAULT_FEE_RATES[method];
      let fixedFee = rates.fixed;
      let percentageFee = rates.percentage;

      // Ajuster les frais selon l'agent sélectionné
      if (method === 'agent' && selectedAgent) {
        fixedFee = selectedAgent.commission;
        percentageFee = 0; // Les agents ont généralement des frais fixes
      }

      // Ajuster les frais selon le compte bancaire
      if (method === 'banking' && selectedBankAccount) {
        // Les comptes vérifiés peuvent avoir des frais réduits
        if (selectedBankAccount.isVerified) {
          percentageFee *= 0.8; // 20% de réduction
        }
      }

      // Calculer les frais
      const percentageAmount = (amount * percentageFee) / 100;
      const totalFees = fixedFee + percentageAmount;
      const totalAmount = amount + totalFees;

      // Déterminer le type de frais
      let feeType: 'fixed' | 'percentage' | 'mixed' = 'mixed';
      if (fixedFee > 0 && percentageFee === 0) {
        feeType = 'fixed';
      } else if (fixedFee === 0 && percentageFee > 0) {
        feeType = 'percentage';
      }

      return {
        amount,
        fees: totalFees,
        totalAmount,
        feePercentage: percentageFee,
        feeType,
      };
    };
  }, []);

  const getFeeDescription = useMemo(() => {
    return (method: CashInMethod, selectedAgent?: Agent): string => {
      switch (method) {
        case 'agent':
          if (selectedAgent) {
            return `Frais d'agent: ${selectedAgent.commission}€`;
          }
          return 'Frais d\'agent: 0.50€ + 1.5%';
        case 'voucher':
          return 'Frais de voucher: 0.25€ + 0.5%';
        case 'banking':
          return 'Frais bancaires: 1.00€ + 0.8%';
        default:
          return '';
      }
    };
  }, []);

  const getProcessingTime = useMemo(() => {
    return (method: CashInMethod): string => {
      switch (method) {
        case 'agent':
          return 'Immédiat';
        case 'voucher':
          return 'Immédiat';
        case 'banking':
          return '1-3 jours ouvrables';
        default:
          return '';
      }
    };
  }, []);

  const getLimits = useMemo(() => {
    return (method: CashInMethod, selectedAgent?: Agent, selectedBankAccount?: BankAccount) => {
      switch (method) {
        case 'agent':
          if (selectedAgent) {
            return {
              min: 5,
              max: selectedAgent.maxAmount,
              daily: selectedAgent.dailyLimit,
            };
          }
          return { min: 5, max: 1000, daily: 5000 };
        case 'voucher':
          return { min: 1, max: 500, daily: 2000 };
        case 'banking':
          if (selectedBankAccount) {
            return {
              min: 10,
              max: 10000,
              daily: selectedBankAccount.dailyLimit,
            };
          }
          return { min: 10, max: 10000, daily: 5000 };
        default:
          return { min: 1, max: 1000, daily: 1000 };
      }
    };
  }, []);

  return {
    calculateFees,
    getFeeDescription,
    getProcessingTime,
    getLimits,
  };
} 