# CashInModal - Documentation

## 📋 Vue d'ensemble

Le `CashInModal` est un composant modal complexe qui gère l'ensemble du processus d'ajout de fonds au portefeuille utilisateur. Il supporte trois méthodes de cash-in : agents, vouchers et virements bancaires.

## 🎯 Fonctionnalités

- **Multi-méthodes** : Support des agents, vouchers et virements bancaires
- **Validation en temps réel** : Validation des montants, codes et données
- **Calcul automatique des frais** : Frais calculés selon la méthode choisie
- **Interface progressive** : Navigation étape par étape
- **Gestion d'erreurs** : Affichage des erreurs avec messages explicites
- **Animations fluides** : Transitions animées entre les étapes

## 🏗️ Architecture

### Structure des composants

```
CashInModal/
├── CashInModal.tsx           # Composant principal
├── components/
│   ├── MethodSelector.tsx    # Sélection de méthode
│   ├── AmountStep.tsx        # Saisie du montant
│   ├── AgentStep.tsx         # Sélection d'agent
│   ├── VoucherStep.tsx       # Saisie de voucher
│   ├── BankStep.tsx          # Sélection de compte bancaire
│   ├── ConfirmationStep.tsx  # Confirmation finale
│   └── SuccessStep.tsx       # Écran de succès
├── hooks/
│   ├── useCashInState.ts     # État du modal
│   ├── useCashInValidation.ts # Validation
│   └── useCashInFees.ts      # Calcul des frais
└── types/
    └── index.ts              # Types TypeScript
```

## 🚀 Utilisation

### Import et utilisation de base

```typescript
import React, { useState } from 'react';
import { CashInModal } from '@/components/cash-in/CashInModal';

const MyComponent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userId] = useState('user_123');

  const handleCashInComplete = (transaction) => {
    console.log('Cash-in terminé:', transaction);
    setIsModalVisible(false);
  };

  const handleCashInError = (error) => {
    console.error('Erreur cash-in:', error);
  };

  return (
    <>
      <Button 
        title="Ajouter des fonds" 
        onPress={() => setIsModalVisible(true)} 
      />
      
      <CashInModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        userId={userId}
        onComplete={handleCashInComplete}
        onError={handleCashInError}
      />
    </>
  );
};
```

### Utilisation avancée avec configuration

```typescript
import { CashInModal, CashInConfig } from '@/components/cash-in/CashInModal';

const config: CashInConfig = {
  enabledMethods: ['agent', 'voucher'], // Désactiver les virements bancaires
  minAmount: 1000,
  maxAmount: 100000,
  defaultMethod: 'agent',
  showFees: true,
  allowMethodChange: true,
  autoCalculateFees: true,
};

<CashInModal
  visible={isModalVisible}
  onClose={() => setIsModalVisible(false)}
  userId={userId}
  config={config}
  onComplete={handleCashInComplete}
  onError={handleCashInError}
  onStepChange={(step) => console.log('Étape:', step)}
/>
```

## 📝 Props

### CashInModalProps

```typescript
interface CashInModalProps {
  // Props obligatoires
  visible: boolean;
  onClose: () => void;
  userId: string;

  // Props optionnelles
  config?: CashInConfig;
  initialMethod?: CashInMethod;
  initialAmount?: number;
  
  // Callbacks
  onComplete?: (transaction: Transaction) => void;
  onError?: (error: CashInError) => void;
  onStepChange?: (step: CashInStep) => void;
  onMethodChange?: (method: CashInMethod) => void;
  onAmountChange?: (amount: number) => void;
  
  // Styling
  theme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
  borderRadius?: number;
}
```

### CashInConfig

```typescript
interface CashInConfig {
  // Méthodes activées
  enabledMethods?: CashInMethod[];
  
  // Limites de montant
  minAmount?: number;
  maxAmount?: number;
  
  // Configuration par défaut
  defaultMethod?: CashInMethod;
  defaultAmount?: number;
  
  // Options d'affichage
  showFees?: boolean;
  showStepIndicator?: boolean;
  allowMethodChange?: boolean;
  
  // Comportement
  autoCalculateFees?: boolean;
  validateOnChange?: boolean;
  closeOnSuccess?: boolean;
  
  // Personnalisation
  customLabels?: Record<string, string>;
  customValidation?: ValidationRules;
}
```

## 🔄 États et flux

### États du modal

```typescript
type CashInStep = 
  | 'method'        // Sélection de méthode
  | 'amount'        // Saisie du montant
  | 'details'       // Détails spécifiques (agent/voucher/banque)
  | 'confirmation'  // Confirmation finale
  | 'processing'    // Traitement en cours
  | 'success'       // Succès
  | 'error';        // Erreur

interface CashInState {
  currentStep: CashInStep;
  selectedMethod: CashInMethod | null;
  amount: number;
  fees: number;
  selectedAgent?: Agent;
  voucherCode?: string;
  selectedBankAccount?: BankAccount;
  pin: string;
  isProcessing: boolean;
  error: string | null;
  transaction?: Transaction;
}
```

### Flux de navigation

```
1. method → 2. amount → 3. details → 4. confirmation → 5. processing → 6. success
                                                                    ↓
                                                                 7. error
```

## 🎨 Personnalisation

### Thèmes personnalisés

```typescript
const customTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
  },
  typography: {
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 14, fontWeight: 'normal' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

<CashInModal
  theme={customTheme}
  // ... autres props
/>
```

### Labels personnalisés

```typescript
const customLabels = {
  title: 'Recharger mon compte',
  methodTitle: 'Choisir une méthode',
  amountTitle: 'Montant à ajouter',
  agentTitle: 'Sélectionner un agent',
  voucherTitle: 'Code de recharge',
  confirmTitle: 'Confirmer la transaction',
  
  // Boutons
  continue: 'Continuer',
  confirm: 'Confirmer',
  cancel: 'Annuler',
  retry: 'Réessayer',
  
  // Messages
  successMessage: 'Fonds ajoutés avec succès !',
  processingMessage: 'Traitement en cours...',
  
  // Erreurs
  invalidAmount: 'Montant invalide',
  invalidVoucher: 'Code de recharge invalide',
  networkError: 'Erreur de connexion',
};

<CashInModal
  config={{ customLabels }}
  // ... autres props
/>
```

## 🔧 Hooks intégrés

### useCashInState

Hook principal pour la gestion de l'état du modal.

```typescript
const useCashInState = (config?: CashInConfig) => {
  const [state, setState] = useState<CashInState>(initialState);
  
  const actions = {
    setMethod: (method: CashInMethod) => void;
    setAmount: (amount: number) => void;
    setAgent: (agent: Agent) => void;
    setVoucherCode: (code: string) => void;
    setBankAccount: (account: BankAccount) => void;
    setPin: (pin: string) => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: CashInStep) => void;
    reset: () => void;
    setError: (error: string) => void;
    clearError: () => void;
  };
  
  return { state, ...actions };
};
```

### useCashInValidation

Hook pour la validation des données.

```typescript
const useCashInValidation = (config?: CashInConfig) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const validators = {
    validateAmount: (amount: number) => boolean;
    validateMethod: (method: CashInMethod) => boolean;
    validateAgent: (agent: Agent) => boolean;
    validateVoucher: (code: string) => boolean;
    validateBankAccount: (account: BankAccount) => boolean;
    validatePin: (pin: string) => boolean;
    validateStep: (step: CashInStep, state: CashInState) => boolean;
  };
  
  const utils = {
    clearErrors: () => void;
    clearError: (field: string) => void;
    hasErrors: () => boolean;
    getErrorMessage: (field: string) => string | undefined;
  };
  
  return { errors, ...validators, ...utils };
};
```

### useCashInFees

Hook pour le calcul des frais.

```typescript
const useCashInFees = () => {
  const [fees, setFees] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  const calculateFees = async (
    amount: number, 
    method: CashInMethod,
    details?: any
  ) => Promise<void>;
  
  const getFeeBreakdown = () => {
    return {
      baseFee: number;
      commissionFee: number;
      processingFee: number;
      totalFees: number;
    };
  };
  
  return {
    fees,
    isCalculating,
    calculateFees,
    getFeeBreakdown,
  };
};
```

## 🧪 Tests

### Tests unitaires

```typescript
// __tests__/components/CashInModal.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CashInModal } from '@/components/cash-in/CashInModal';

describe('CashInModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    userId: 'user_123',
  };

  it('should render method selection step initially', () => {
    const { getByTestId } = render(<CashInModal {...defaultProps} />);
    
    expect(getByTestId('method-selector')).toBeTruthy();
  });

  it('should navigate to amount step after method selection', async () => {
    const { getByTestId } = render(<CashInModal {...defaultProps} />);
    
    const agentMethod = getByTestId('method-agent');
    fireEvent.press(agentMethod);
    
    await waitFor(() => {
      expect(getByTestId('amount-input')).toBeTruthy();
    });
  });

  it('should calculate fees when amount changes', async () => {
    const { getByTestId, getByText } = render(<CashInModal {...defaultProps} />);
    
    // Sélectionner méthode agent
    fireEvent.press(getByTestId('method-agent'));
    
    // Saisir montant
    const amountInput = getByTestId('amount-input');
    fireEvent.changeText(amountInput, '10000');
    
    await waitFor(() => {
      expect(getByText('Frais: 200 FCFA')).toBeTruthy();
    });
  });

  it('should handle validation errors', async () => {
    const { getByTestId, getByText } = render(<CashInModal {...defaultProps} />);
    
    fireEvent.press(getByTestId('method-agent'));
    
    const amountInput = getByTestId('amount-input');
    fireEvent.changeText(amountInput, '100'); // Montant trop faible
    
    const continueButton = getByTestId('continue-button');
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      expect(getByText('Montant minimum: 500 FCFA')).toBeTruthy();
    });
  });
});
```

### Tests d'intégration

```typescript
// __tests__/integration/CashInModal.integration.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CashInModal } from '@/components/cash-in/CashInModal';
import { CashInService } from '@/services/CashInService';

jest.mock('@/services/CashInService');

describe('CashInModal Integration', () => {
  it('should complete full agent cash-in flow', async () => {
    const mockOnComplete = jest.fn();
    const { getByTestId } = render(
      <CashInModal
        visible={true}
        onClose={jest.fn()}
        userId="user_123"
        onComplete={mockOnComplete}
      />
    );

    // 1. Sélectionner méthode agent
    fireEvent.press(getByTestId('method-agent'));

    // 2. Saisir montant
    fireEvent.changeText(getByTestId('amount-input'), '10000');
    fireEvent.press(getByTestId('continue-button'));

    // 3. Sélectionner agent
    await waitFor(() => {
      fireEvent.press(getByTestId('agent-agent_1'));
    });
    fireEvent.press(getByTestId('continue-button'));

    // 4. Saisir PIN
    fireEvent.changeText(getByTestId('pin-input'), '1234');

    // 5. Confirmer
    fireEvent.press(getByTestId('confirm-button'));

    // 6. Vérifier le succès
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
```

## 🔍 Debugging

### Logs de debug

```typescript
// Activer les logs de debug
const CashInModalWithDebug = (props) => {
  const debugConfig = {
    ...props.config,
    debug: true,
  };

  return <CashInModal {...props} config={debugConfig} />;
};

// Les logs apparaîtront dans la console :
// [CashInModal] Step changed: method → amount
// [CashInModal] Method selected: agent
// [CashInModal] Amount changed: 10000
// [CashInModal] Fees calculated: 200
```

### Outils de développement

```typescript
// Ajouter des outils de dev en mode développement
if (__DEV__) {
  const DevTools = () => (
    <View style={styles.devTools}>
      <Text>État actuel: {state.currentStep}</Text>
      <Text>Méthode: {state.selectedMethod}</Text>
      <Text>Montant: {state.amount}</Text>
      <Text>Frais: {state.fees}</Text>
      <Button title="Reset" onPress={reset} />
    </View>
  );
}
```

## 🚀 Performance

### Optimisations

```typescript
// Mémorisation des composants lourds
const MemoizedAgentList = React.memo(AgentList);
const MemoizedVoucherInput = React.memo(VoucherInput);

// Lazy loading des étapes
const LazyConfirmationStep = React.lazy(() => import('./ConfirmationStep'));

// Debounce pour le calcul des frais
const debouncedCalculateFees = useCallback(
  debounce(calculateFees, 300),
  [calculateFees]
);
```

### Métriques de performance

```typescript
// Mesurer les temps de rendu
const usePerformanceMetrics = () => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`CashInModal render time: ${endTime - startTime}ms`);
    };
  }, []);
};
```

## 🔧 Configuration avancée

### Validation personnalisée

```typescript
const customValidation: ValidationRules = {
  amount: {
    required: true,
    min: 1000,
    max: 500000,
    custom: (value) => {
      if (value % 100 !== 0) {
        return 'Le montant doit être un multiple de 100';
      }
      return null;
    },
  },
  voucher: {
    required: true,
    pattern: /^[A-Z0-9]{8,12}$/,
    custom: async (code) => {
      const isValid = await VoucherService.validateCode(code);
      return isValid ? null : 'Code de recharge invalide';
    },
  },
};

<CashInModal
  config={{ customValidation }}
  // ... autres props
/>
```

### Intégration avec des services externes

```typescript
const customServices = {
  cashInService: new CustomCashInService(),
  feeCalculator: new CustomFeeCalculator(),
  agentProvider: new CustomAgentProvider(),
};

<CashInModal
  services={customServices}
  // ... autres props
/>
```

Le `CashInModal` est un composant robuste et flexible qui peut être adapté à différents besoins métier tout en maintenant une expérience utilisateur cohérente.