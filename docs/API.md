# API Reference - OffliPay

## 📋 Vue d'ensemble

Cette documentation couvre l'API interne d'OffliPay, incluant les services, hooks, utilitaires et composants principaux.

## 🔧 Services

### CashInService

Service principal pour la gestion des ajouts de fonds au portefeuille.

#### Méthodes

##### `processAgentCashIn(data: AgentCashInData): Promise<ServiceResult<Transaction>>`

Traite un ajout de fonds via un agent.

```typescript
interface AgentCashInData {
  amount: number;
  agentId: string;
  userId: string;
  pin: string;
}

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Exemple d'utilisation
const result = await CashInService.processAgentCashIn({
  amount: 10000,
  agentId: 'agent_123',
  userId: 'user_456',
  pin: '1234'
});

if (result.success) {
  console.log('Transaction créée:', result.data);
} else {
  console.error('Erreur:', result.error);
}
```

##### `processVoucherCashIn(data: VoucherCashInData): Promise<ServiceResult<Transaction>>`

Traite un ajout de fonds via voucher.

```typescript
interface VoucherCashInData {
  voucherCode: string;
  userId: string;
  pin: string;
}

// Exemple d'utilisation
const result = await CashInService.processVoucherCashIn({
  voucherCode: 'VOUCHER123',
  userId: 'user_456',
  pin: '1234'
});
```

##### `processBankCashIn(data: BankCashInData): Promise<ServiceResult<Transaction>>`

Traite un ajout de fonds via virement bancaire.

```typescript
interface BankCashInData {
  amount: number;
  bankAccountId: string;
  userId: string;
  pin: string;
}
```

##### `calculateFees(amount: number, method: CashInMethod): Promise<number>`

Calcule les frais pour un ajout de fonds.

```typescript
type CashInMethod = 'agent' | 'voucher' | 'banking';

// Exemple d'utilisation
const fees = await CashInService.calculateFees(10000, 'agent');
console.log(`Frais: ${fees} FCFA`);
```

##### `getAvailableAgents(location?: string): Promise<Agent[]>`

Récupère la liste des agents disponibles.

```typescript
interface Agent {
  id: string;
  name: string;
  location: string;
  commissionRate: number;
  status: 'active' | 'inactive';
  distance?: number;
}

// Exemple d'utilisation
const agents = await CashInService.getAvailableAgents('Dakar');
```

### WalletService

Service pour la gestion du portefeuille utilisateur.

#### Méthodes

##### `getBalance(userId: string): Promise<Balance>`

Récupère le solde d'un utilisateur.

```typescript
interface Balance {
  currentBalance: number;
  pendingBalance: number;
  lastUpdate: string;
}

// Exemple d'utilisation
const balance = await WalletService.getBalance('user_123');
console.log(`Solde actuel: ${balance.currentBalance} FCFA`);
```

##### `updateBalance(userId: string, amount: number, type: 'credit' | 'debit'): Promise<void>`

Met à jour le solde d'un utilisateur.

```typescript
// Créditer le compte
await WalletService.updateBalance('user_123', 5000, 'credit');

// Débiter le compte
await WalletService.updateBalance('user_123', 2000, 'debit');
```

##### `getTransactionHistory(userId: string, options?: HistoryOptions): Promise<Transaction[]>`

Récupère l'historique des transactions.

```typescript
interface HistoryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  type?: 'cash_in' | 'payment' | 'transfer';
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description?: string;
}

// Exemple d'utilisation
const transactions = await WalletService.getTransactionHistory('user_123', {
  limit: 20,
  type: 'cash_in'
});
```

### OnboardingService

Service pour la gestion du processus d'onboarding.

#### Méthodes

##### `completeOnboarding(userId: string): Promise<void>`

Marque l'onboarding comme terminé.

##### `getOnboardingStatus(userId: string): Promise<OnboardingStatus>`

Récupère le statut d'onboarding.

```typescript
interface OnboardingStatus {
  isCompleted: boolean;
  currentStep: number;
  completedSteps: string[];
}
```

## 🎣 Hooks

### useCashInValidation

Hook pour la validation des formulaires de cash-in.

```typescript
interface ValidationErrors {
  amount?: string;
  agent?: string;
  voucher?: string;
  pin?: string;
}

const useCashInValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const validateAmount = (amount: number) => boolean;
  const validateAgent = (agentId: string) => boolean;
  const validateVoucher = (code: string) => boolean;
  const validatePin = (pin: string) => boolean;
  const clearErrors = () => void;
  
  return {
    errors,
    validateAmount,
    validateAgent,
    validateVoucher,
    validatePin,
    clearErrors
  };
};

// Exemple d'utilisation
const CashInForm = () => {
  const { errors, validateAmount, clearErrors } = useCashInValidation();
  
  const handleAmountChange = (amount: number) => {
    if (!validateAmount(amount)) {
      // Afficher l'erreur
    }
  };
};
```

### useCashInFees

Hook pour le calcul des frais de cash-in.

```typescript
const useCashInFees = () => {
  const [fees, setFees] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  const calculateFees = async (amount: number, method: CashInMethod) => Promise<void>;
  
  return {
    fees,
    isCalculating,
    calculateFees
  };
};

// Exemple d'utilisation
const CashInModal = () => {
  const { fees, calculateFees } = useCashInFees();
  
  useEffect(() => {
    if (amount && method) {
      calculateFees(amount, method);
    }
  }, [amount, method]);
};
```

### useThemeColors

Hook pour la gestion des couleurs du thème.

```typescript
const useThemeColors = () => {
  const colors = {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  
  return colors;
};

// Exemple d'utilisation
const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
};
```

### useCustomAlert

Hook pour l'affichage d'alertes personnalisées.

```typescript
interface AlertOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  actions?: AlertAction[];
}

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

const useCustomAlert = () => {
  const showAlert = (options: AlertOptions) => void;
  const hideAlert = () => void;
  
  return {
    showAlert,
    hideAlert
  };
};

// Exemple d'utilisation
const MyComponent = () => {
  const { showAlert } = useCustomAlert();
  
  const handleError = () => {
    showAlert({
      title: 'Erreur',
      message: 'Une erreur est survenue',
      type: 'error',
      actions: [
        { text: 'OK', onPress: () => {} }
      ]
    });
  };
};
```

## 🧩 Composants UI

### ModalContainer

Conteneur modal réutilisable.

```typescript
interface ModalContainerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}

// Exemple d'utilisation
<ModalContainer
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  title="Cash-In"
  animationType="slide"
>
  <Text>Contenu du modal</Text>
</ModalContainer>
```

### AmountInput

Composant pour la saisie de montants.

```typescript
interface AmountInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  currency?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxAmount?: number;
  minAmount?: number;
}

// Exemple d'utilisation
<AmountInput
  value={amount}
  onChangeValue={setAmount}
  currency="FCFA"
  placeholder="Entrez le montant"
  error={errors.amount}
  maxAmount={100000}
  minAmount={500}
/>
```

### ActionButton

Bouton d'action personnalisé.

```typescript
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

// Exemple d'utilisation
<ActionButton
  title="Confirmer"
  onPress={handleConfirm}
  variant="primary"
  size="large"
  loading={isProcessing}
  fullWidth
/>
```

### SectionCard

Carte de section pour organiser le contenu.

```typescript
interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  headerAction?: React.ReactNode;
}

// Exemple d'utilisation
<SectionCard
  title="Informations de paiement"
  subtitle="Détails de la transaction"
  collapsible
  defaultExpanded
>
  <Text>Contenu de la section</Text>
</SectionCard>
```

## 🛠️ Utilitaires

### Storage

Utilitaires pour la gestion du stockage.

```typescript
// utils/storage.ts

// SQLite operations
export const createUser = async (userData: UserData): Promise<string>;
export const getUserById = async (id: string): Promise<User | null>;
export const updateUserBalance = async (userId: string, newBalance: number): Promise<void>;
export const createTransaction = async (transactionData: TransactionData): Promise<string>;

// Secure Storage operations
export const storeSecureData = async (key: string, value: string): Promise<void>;
export const getSecureData = async (key: string): Promise<string | null>;
export const deleteSecureData = async (key: string): Promise<void>;

// AsyncStorage operations
export const storeData = async (key: string, value: any): Promise<void>;
export const getData = async (key: string): Promise<any>;
export const removeData = async (key: string): Promise<void>;
```

### Crypto

Utilitaires cryptographiques.

```typescript
// utils/crypto.ts

export const hashPin = async (pin: string): Promise<string>;
export const verifyPin = async (pin: string, hash: string): Promise<boolean>;
export const generateTransactionId = (): string;
export const signTransaction = async (transaction: Transaction): Promise<string>;
export const verifyTransactionSignature = async (transaction: Transaction, signature: string): Promise<boolean>;
```

### Validation

Utilitaires de validation.

```typescript
// utils/validation.ts

export const validatePhoneNumber = (phone: string): boolean;
export const validateAmount = (amount: number, min?: number, max?: number): boolean;
export const validatePin = (pin: string): boolean;
export const validateVoucherCode = (code: string): boolean;
export const sanitizeInput = (input: string): string;
```

## 🔄 Types TypeScript

### Interfaces principales

```typescript
// types/index.ts

export interface User {
  id: string;
  name: string;
  phone: string;
  pinHash: string;
  createdAt: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  fees: number;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'cash_in' | 'payment' | 'transfer' | 'withdrawal';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Agent {
  id: string;
  name: string;
  phone: string;
  location: string;
  commissionRate: number;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalTransactions: number;
}

export interface Voucher {
  code: string;
  amount: number;
  status: 'active' | 'used' | 'expired';
  expiryDate: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
  status: 'active' | 'inactive';
}
```

## 🚨 Gestion d'erreurs

### Codes d'erreur

```typescript
export enum ErrorCodes {
  // Erreurs générales
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Erreurs d'authentification
  INVALID_PIN = 'INVALID_PIN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  
  // Erreurs de cash-in
  INSUFFICIENT_AGENT_BALANCE = 'INSUFFICIENT_AGENT_BALANCE',
  INVALID_VOUCHER = 'INVALID_VOUCHER',
  VOUCHER_EXPIRED = 'VOUCHER_EXPIRED',
  VOUCHER_ALREADY_USED = 'VOUCHER_ALREADY_USED',
  
  // Erreurs de transaction
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_LIMIT_EXCEEDED = 'TRANSACTION_LIMIT_EXCEEDED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
}
```

### Gestion des erreurs

```typescript
// utils/errorHandler.ts

export interface AppError {
  code: ErrorCodes;
  message: string;
  details?: any;
}

export const createError = (code: ErrorCodes, message: string, details?: any): AppError => ({
  code,
  message,
  details
});

export const handleServiceError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  return createError(ErrorCodes.UNKNOWN_ERROR, 'Une erreur inattendue est survenue');
};
```

## 📊 Constantes

### Configuration

```typescript
// utils/constants.ts

export const CONFIG = {
  // Limites de transaction
  MIN_CASH_IN_AMOUNT: 500,
  MAX_CASH_IN_AMOUNT: 500000,
  MIN_PAYMENT_AMOUNT: 100,
  MAX_PAYMENT_AMOUNT: 1000000,
  
  // Frais
  AGENT_COMMISSION_RATE: 0.02, // 2%
  VOUCHER_FEE: 0,
  BANK_TRANSFER_FEE: 500,
  
  // Timeouts
  TRANSACTION_TIMEOUT: 30000, // 30 secondes
  API_TIMEOUT: 10000, // 10 secondes
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const REGEX = {
  PHONE_NUMBER: /^(\+221|221)?[0-9]{9}$/,
  PIN: /^[0-9]{4}$/,
  VOUCHER_CODE: /^[A-Z0-9]{8,12}$/,
};
```

Cette API reference couvre les principales fonctionnalités d'OffliPay. Pour des exemples d'utilisation plus détaillés, consultez le dossier `examples/` du projet.