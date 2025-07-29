# Guide des Tests - OffliPay

## 📋 Vue d'ensemble

OffliPay utilise une stratégie de test complète avec **Jest** et **React Native Testing Library** pour garantir la qualité et la fiabilité de l'application.

## 🧪 Types de tests

### 1. Tests unitaires
- Tests des fonctions utilitaires
- Tests des hooks personnalisés
- Tests des services métier
- Tests des composants isolés

### 2. Tests d'intégration
- Tests des flux complets
- Tests d'interaction entre composants
- Tests de navigation

### 3. Tests de performance
- Tests de rendu des listes
- Tests de mémoire
- Tests de temps de réponse

## 🏗️ Structure des tests

```
__tests__/
├── components/           # Tests de composants
│   ├── ui/              # Tests composants UI
│   │   ├── ModalContainer.test.tsx
│   │   ├── AmountInput.test.tsx
│   │   ├── ActionButton.test.tsx
│   │   └── SectionCard.test.tsx
│   ├── cash-in/         # Tests composants cash-in
│   │   ├── MethodSelector.test.tsx
│   │   ├── AgentList.test.tsx
│   │   └── VoucherInput.test.tsx
│   └── onboarding/      # Tests composants onboarding
├── hooks/               # Tests hooks personnalisés
│   ├── useCashInValidation.test.ts
│   ├── useCashInFees.test.ts
│   ├── useThemeColors.test.ts
│   └── useCustomAlert.test.ts
├── services/            # Tests couche service
│   ├── CashInService.test.ts
│   ├── WalletService.test.ts
│   └── OnboardingService.test.ts
├── utils/               # Tests utilitaires
│   ├── storage.test.ts
│   ├── crypto.test.ts
│   ├── validation.test.ts
│   └── theme.test.ts
├── integration/         # Tests d'intégration
│   ├── cash-in-flow.test.tsx
│   ├── payment-flow.test.tsx
│   └── onboarding-flow.test.tsx
└── __mocks__/          # Mocks globaux
    ├── expo-secure-store.js
    ├── expo-sqlite.js
    └── react-native-reanimated.js
```

## 🚀 Commandes de test

### Commandes de base
```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests en mode silencieux
npm run test:silent

# Tests d'un fichier spécifique
npm test -- AmountInput.test.tsx

# Tests avec pattern
npm test -- --testNamePattern="validation"
```

### Commandes avancées
```bash
# Tests avec rapport détaillé
npm test -- --verbose

# Tests avec mise à jour des snapshots
npm test -- --updateSnapshot

# Tests en mode debug
npm test -- --detectOpenHandles

# Tests avec bail (arrêt au premier échec)
npm test -- --bail
```

## 🧩 Tests de composants

### Exemple de test de composant UI

```typescript
// __tests__/components/ui/AmountInput.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AmountInput } from '@/components/ui/AmountInput';

describe('AmountInput', () => {
  const defaultProps = {
    value: 0,
    onChangeValue: jest.fn(),
    currency: 'FCFA',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByTestId } = render(<AmountInput {...defaultProps} />);
    
    expect(getByTestId('amount-input')).toBeTruthy();
  });

  it('should display the correct value', () => {
    const { getByDisplayValue } = render(
      <AmountInput {...defaultProps} value={5000} />
    );
    
    expect(getByDisplayValue('5000')).toBeTruthy();
  });

  it('should call onChangeValue when text changes', async () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <AmountInput {...defaultProps} onChangeValue={mockOnChange} />
    );
    
    const input = getByTestId('amount-input');
    fireEvent.changeText(input, '10000');
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(10000);
    });
  });

  it('should show error message when provided', () => {
    const { getByText } = render(
      <AmountInput {...defaultProps} error="Montant invalide" />
    );
    
    expect(getByText('Montant invalide')).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <AmountInput {...defaultProps} disabled />
    );
    
    const input = getByTestId('amount-input');
    expect(input.props.editable).toBe(false);
  });

  it('should format amount with currency', () => {
    const { getByText } = render(
      <AmountInput {...defaultProps} value={5000} />
    );
    
    expect(getByText('FCFA')).toBeTruthy();
  });

  it('should validate min and max amounts', async () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <AmountInput 
        {...defaultProps} 
        onChangeValue={mockOnChange}
        minAmount={1000}
        maxAmount={50000}
      />
    );
    
    const input = getByTestId('amount-input');
    
    // Test montant trop faible
    fireEvent.changeText(input, '500');
    await waitFor(() => {
      expect(mockOnChange).not.toHaveBeenCalled();
    });
    
    // Test montant valide
    fireEvent.changeText(input, '5000');
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(5000);
    });
  });
});
```

### Exemple de test de composant complexe

```typescript
// __tests__/components/cash-in/MethodSelector.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MethodSelector } from '@/components/cash-in/MethodSelector';
import { CashInMethod } from '@/types';

const mockMethods: CashInMethod[] = [
  { id: 'agent', name: 'Agent', icon: 'user', available: true },
  { id: 'voucher', name: 'Voucher', icon: 'ticket', available: true },
  { id: 'banking', name: 'Banque', icon: 'building', available: false },
];

describe('MethodSelector', () => {
  const defaultProps = {
    methods: mockMethods,
    selectedMethod: null,
    onMethodSelect: jest.fn(),
  };

  it('should render all available methods', () => {
    const { getByText } = render(<MethodSelector {...defaultProps} />);
    
    expect(getByText('Agent')).toBeTruthy();
    expect(getByText('Voucher')).toBeTruthy();
    expect(getByText('Banque')).toBeTruthy();
  });

  it('should disable unavailable methods', () => {
    const { getByTestId } = render(<MethodSelector {...defaultProps} />);
    
    const bankingMethod = getByTestId('method-banking');
    expect(bankingMethod.props.accessibilityState.disabled).toBe(true);
  });

  it('should call onMethodSelect when method is selected', () => {
    const mockOnSelect = jest.fn();
    const { getByTestId } = render(
      <MethodSelector {...defaultProps} onMethodSelect={mockOnSelect} />
    );
    
    const agentMethod = getByTestId('method-agent');
    fireEvent.press(agentMethod);
    
    expect(mockOnSelect).toHaveBeenCalledWith('agent');
  });

  it('should highlight selected method', () => {
    const { getByTestId } = render(
      <MethodSelector {...defaultProps} selectedMethod="agent" />
    );
    
    const agentMethod = getByTestId('method-agent');
    expect(agentMethod.props.accessibilityState.selected).toBe(true);
  });
});
```

## 🎣 Tests de hooks

### Exemple de test de hook personnalisé

```typescript
// __tests__/hooks/useCashInValidation.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCashInValidation } from '@/hooks/useCashInValidation';

describe('useCashInValidation', () => {
  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useCashInValidation());
    
    expect(result.current.errors).toEqual({});
  });

  it('should validate amount correctly', () => {
    const { result } = renderHook(() => useCashInValidation());
    
    act(() => {
      const isValid = result.current.validateAmount(5000);
      expect(isValid).toBe(true);
    });
    
    act(() => {
      const isValid = result.current.validateAmount(100);
      expect(isValid).toBe(false);
      expect(result.current.errors.amount).toBe('Montant trop faible');
    });
  });

  it('should validate PIN correctly', () => {
    const { result } = renderHook(() => useCashInValidation());
    
    act(() => {
      const isValid = result.current.validatePin('1234');
      expect(isValid).toBe(true);
    });
    
    act(() => {
      const isValid = result.current.validatePin('123');
      expect(isValid).toBe(false);
      expect(result.current.errors.pin).toBe('PIN doit contenir 4 chiffres');
    });
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useCashInValidation());
    
    act(() => {
      result.current.validateAmount(100); // Génère une erreur
    });
    
    expect(result.current.errors.amount).toBeTruthy();
    
    act(() => {
      result.current.clearErrors();
    });
    
    expect(result.current.errors).toEqual({});
  });

  it('should validate voucher code format', () => {
    const { result } = renderHook(() => useCashInValidation());
    
    act(() => {
      const isValid = result.current.validateVoucher('ABCD1234');
      expect(isValid).toBe(true);
    });
    
    act(() => {
      const isValid = result.current.validateVoucher('invalid');
      expect(isValid).toBe(false);
      expect(result.current.errors.voucher).toBe('Format de voucher invalide');
    });
  });
});
```

## 🔧 Tests de services

### Exemple de test de service

```typescript
// __tests__/services/CashInService.test.ts
import { CashInService } from '@/services/CashInService';
import * as storage from '@/utils/storage';
import * as crypto from '@/utils/crypto';

// Mock des dépendances
jest.mock('@/utils/storage');
jest.mock('@/utils/crypto');

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;

describe('CashInService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processAgentCashIn', () => {
    const mockCashInData = {
      amount: 10000,
      agentId: 'agent_123',
      userId: 'user_456',
      pin: '1234',
    };

    it('should process valid agent cash-in successfully', async () => {
      // Setup mocks
      mockCrypto.verifyPin.mockResolvedValue(true);
      mockStorage.getUserById.mockResolvedValue({
        id: 'user_456',
        name: 'John Doe',
        phone: '+221123456789',
        pinHash: 'hashed_pin',
        createdAt: '2024-01-01',
        isActive: true,
      });
      mockStorage.getAgentById.mockResolvedValue({
        id: 'agent_123',
        name: 'Agent Smith',
        location: 'Dakar',
        commissionRate: 0.02,
        status: 'active',
      });
      mockStorage.createTransaction.mockResolvedValue('transaction_789');

      const result = await CashInService.processAgentCashIn(mockCashInData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.amount).toBe(10000);
      expect(mockStorage.createTransaction).toHaveBeenCalled();
    });

    it('should fail with invalid PIN', async () => {
      mockCrypto.verifyPin.mockResolvedValue(false);

      const result = await CashInService.processAgentCashIn(mockCashInData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('PIN invalide');
    });

    it('should fail with inactive agent', async () => {
      mockCrypto.verifyPin.mockResolvedValue(true);
      mockStorage.getUserById.mockResolvedValue({
        id: 'user_456',
        name: 'John Doe',
        phone: '+221123456789',
        pinHash: 'hashed_pin',
        createdAt: '2024-01-01',
        isActive: true,
      });
      mockStorage.getAgentById.mockResolvedValue({
        id: 'agent_123',
        name: 'Agent Smith',
        location: 'Dakar',
        commissionRate: 0.02,
        status: 'inactive',
      });

      const result = await CashInService.processAgentCashIn(mockCashInData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent non disponible');
    });

    it('should calculate fees correctly', async () => {
      mockCrypto.verifyPin.mockResolvedValue(true);
      mockStorage.getUserById.mockResolvedValue({
        id: 'user_456',
        name: 'John Doe',
        phone: '+221123456789',
        pinHash: 'hashed_pin',
        createdAt: '2024-01-01',
        isActive: true,
      });
      mockStorage.getAgentById.mockResolvedValue({
        id: 'agent_123',
        name: 'Agent Smith',
        location: 'Dakar',
        commissionRate: 0.02,
        status: 'active',
      });
      mockStorage.createTransaction.mockResolvedValue('transaction_789');

      const result = await CashInService.processAgentCashIn(mockCashInData);

      expect(result.success).toBe(true);
      expect(result.data?.fees).toBe(200); // 2% de 10000
    });
  });

  describe('calculateFees', () => {
    it('should calculate agent fees correctly', async () => {
      const fees = await CashInService.calculateFees(10000, 'agent');
      expect(fees).toBe(200); // 2% de 10000
    });

    it('should return zero fees for vouchers', async () => {
      const fees = await CashInService.calculateFees(10000, 'voucher');
      expect(fees).toBe(0);
    });

    it('should calculate fixed bank fees', async () => {
      const fees = await CashInService.calculateFees(10000, 'banking');
      expect(fees).toBe(500); // Frais fixe
    });
  });

  describe('getAvailableAgents', () => {
    it('should return active agents only', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1', status: 'active' },
        { id: '2', name: 'Agent 2', status: 'inactive' },
        { id: '3', name: 'Agent 3', status: 'active' },
      ];
      
      mockStorage.getAgents.mockResolvedValue(mockAgents);

      const agents = await CashInService.getAvailableAgents();

      expect(agents).toHaveLength(2);
      expect(agents.every(agent => agent.status === 'active')).toBe(true);
    });

    it('should filter agents by location', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1', location: 'Dakar', status: 'active' },
        { id: '2', name: 'Agent 2', location: 'Thiès', status: 'active' },
      ];
      
      mockStorage.getAgents.mockResolvedValue(mockAgents);

      const agents = await CashInService.getAvailableAgents('Dakar');

      expect(agents).toHaveLength(1);
      expect(agents[0].location).toBe('Dakar');
    });
  });
});
```

## 🔄 Tests d'intégration

### Exemple de test de flux complet

```typescript
// __tests__/integration/cash-in-flow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CashInModal } from '@/components/cash-in/CashInModal';
import { CashInService } from '@/services/CashInService';

// Mock du service
jest.mock('@/services/CashInService');
const mockCashInService = CashInService as jest.Mocked<typeof CashInService>;

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('Cash-In Flow Integration', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    userId: 'user_123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCashInService.getAvailableAgents.mockResolvedValue([
      {
        id: 'agent_1',
        name: 'Agent Test',
        location: 'Dakar',
        commissionRate: 0.02,
        status: 'active',
      },
    ]);
    
    mockCashInService.calculateFees.mockResolvedValue(200);
  });

  it('should complete agent cash-in flow successfully', async () => {
    mockCashInService.processAgentCashIn.mockResolvedValue({
      success: true,
      data: {
        id: 'transaction_123',
        amount: 10000,
        fees: 200,
        status: 'completed',
      },
    });

    const { getByTestId, getByText } = renderWithNavigation(
      <CashInModal {...defaultProps} />
    );

    // 1. Sélectionner la méthode agent
    const agentMethod = getByTestId('method-agent');
    fireEvent.press(agentMethod);

    // 2. Saisir le montant
    const amountInput = getByTestId('amount-input');
    fireEvent.changeText(amountInput, '10000');

    // 3. Attendre le calcul des frais
    await waitFor(() => {
      expect(getByText('Frais: 200 FCFA')).toBeTruthy();
    });

    // 4. Sélectionner un agent
    await waitFor(() => {
      const agentCard = getByTestId('agent-agent_1');
      fireEvent.press(agentCard);
    });

    // 5. Saisir le PIN
    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '1234');

    // 6. Confirmer la transaction
    const confirmButton = getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    // 7. Vérifier le succès
    await waitFor(() => {
      expect(getByText('Transaction réussie')).toBeTruthy();
    });

    expect(mockCashInService.processAgentCashIn).toHaveBeenCalledWith({
      amount: 10000,
      agentId: 'agent_1',
      userId: 'user_123',
      pin: '1234',
    });
  });

  it('should handle validation errors', async () => {
    const { getByTestId, getByText } = renderWithNavigation(
      <CashInModal {...defaultProps} />
    );

    // Sélectionner la méthode agent
    const agentMethod = getByTestId('method-agent');
    fireEvent.press(agentMethod);

    // Saisir un montant invalide
    const amountInput = getByTestId('amount-input');
    fireEvent.changeText(amountInput, '100');

    // Essayer de continuer
    const continueButton = getByTestId('continue-button');
    fireEvent.press(continueButton);

    // Vérifier l'erreur de validation
    await waitFor(() => {
      expect(getByText('Montant minimum: 500 FCFA')).toBeTruthy();
    });
  });

  it('should handle service errors gracefully', async () => {
    mockCashInService.processAgentCashIn.mockResolvedValue({
      success: false,
      error: 'Agent non disponible',
    });

    const { getByTestId, getByText } = renderWithNavigation(
      <CashInModal {...defaultProps} />
    );

    // Compléter le flux jusqu'à la confirmation
    const agentMethod = getByTestId('method-agent');
    fireEvent.press(agentMethod);

    const amountInput = getByTestId('amount-input');
    fireEvent.changeText(amountInput, '10000');

    await waitFor(() => {
      const agentCard = getByTestId('agent-agent_1');
      fireEvent.press(agentCard);
    });

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '1234');

    const confirmButton = getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    // Vérifier l'affichage de l'erreur
    await waitFor(() => {
      expect(getByText('Agent non disponible')).toBeTruthy();
    });
  });
});
```

## 🎭 Mocks et utilitaires de test

### Setup global des mocks

```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    executeSql: jest.fn(),
  })),
}));

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Global test utilities
global.mockUser = {
  id: 'user_123',
  name: 'Test User',
  phone: '+221123456789',
  pinHash: 'hashed_pin',
  createdAt: '2024-01-01',
  isActive: true,
};

global.mockTransaction = {
  id: 'transaction_123',
  userId: 'user_123',
  type: 'cash_in',
  amount: 10000,
  fees: 200,
  status: 'completed',
  createdAt: '2024-01-01T10:00:00Z',
};
```

### Utilitaires de test personnalisés

```typescript
// __tests__/utils/testUtils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Wrapper personnalisé avec providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </NavigationContainer>
  );
};

// Fonction de rendu personnalisée
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Factory functions pour les données de test
export const createMockUser = (overrides = {}) => ({
  ...global.mockUser,
  ...overrides,
});

export const createMockTransaction = (overrides = {}) => ({
  ...global.mockTransaction,
  ...overrides,
});

export const createMockAgent = (overrides = {}) => ({
  id: 'agent_123',
  name: 'Test Agent',
  location: 'Dakar',
  commissionRate: 0.02,
  status: 'active',
  ...overrides,
});

// Helpers pour les tests async
export const waitForLoadingToFinish = () => 
  waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeNull());

export const fillForm = async (fields: Record<string, string>) => {
  for (const [testId, value] of Object.entries(fields)) {
    const input = screen.getByTestId(testId);
    fireEvent.changeText(input, value);
  }
};

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };
```

## 📊 Couverture de code

### Configuration de couverture

```json
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Rapport de couverture

```bash
# Générer le rapport de couverture
npm run test:coverage

# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

## 🐛 Debugging des tests

### Tests en mode debug

```bash
# Debug avec Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug avec VS Code
# Ajouter dans .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Logs de debug

```typescript
// Dans les tests
import { debug } from '@testing-library/react-native';

it('should debug component tree', () => {
  const { debug: debugComponent } = render(<MyComponent />);
  
  // Afficher l'arbre des composants
  debugComponent();
  
  // Ou utiliser la fonction globale
  debug();
});
```

## 📈 Métriques et reporting

### Scripts de reporting

```bash
# Générer un rapport de test complet
npm run test:report

# Exporter les résultats en JSON
npm test -- --json --outputFile=test-results.json

# Générer un rapport JUnit (pour CI/CD)
npm test -- --reporters=jest-junit
```

### Intégration CI/CD

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - uses: codecov/codecov-action@v1
```

Cette stratégie de test garantit la qualité et la fiabilité de l'application OffliPay à tous les niveaux.