# Hooks Personnalisés - OffliPay

## 📋 Vue d'ensemble

Les hooks personnalisés d'OffliPay encapsulent la logique métier réutilisable et fournissent une interface cohérente pour la gestion d'état, la validation, et les interactions avec les services.

## 🎯 Philosophie des hooks

### Principes de conception
- **Réutilisabilité** : Logique partageable entre composants
- **Séparation des responsabilités** : Chaque hook a un objectif précis
- **Testabilité** : Hooks facilement testables en isolation
- **Performance** : Optimisations avec useMemo et useCallback
- **Type Safety** : TypeScript strict pour tous les hooks

### Structure des hooks

```
hooks/
├── business/              # Hooks métier
│   ├── useCashInValidation.ts
│   ├── useCashInFees.ts
│   ├── useWalletBalance.ts
│   └── useTransactionHistory.ts
├── ui/                   # Hooks d'interface
│   ├── useThemeColors.ts
│   ├── useCustomAlert.ts
│   ├── useModal.ts
│   └── useKeyboard.ts
├── data/                 # Hooks de données
│   ├── useStorage.ts
│   ├── useSecureStorage.ts
│   └── useDatabase.ts
└── utils/                # Hooks utilitaires
    ├── useDebounce.ts
    ├── useAsync.ts
    └── usePrevious.ts
```

## 💼 Hooks métier

### useCashInValidation

Hook pour la validation des formulaires de cash-in avec règles métier.

```typescript
interface ValidationErrors {
  amount?: string;
  agent?: string;
  voucher?: string;
  pin?: string;
  bankAccount?: string;
}

interface ValidationRules {
  minAmount: number;
  maxAmount: number;
  pinLength: number;
  voucherPattern: RegExp;
}

const useCashInValidation = (rules?: Partial<ValidationRules>) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const validateAmount = useCallback((amount: number): boolean => {
    const minAmount = rules?.minAmount ?? 500;
    const maxAmount = rules?.maxAmount ?? 500000;
    
    if (amount < minAmount) {
      setErrors(prev => ({ 
        ...prev, 
        amount: `Montant minimum: ${minAmount} FCFA` 
      }));
      return false;
    }
    
    if (amount > maxAmount) {
      setErrors(prev => ({ 
        ...prev, 
        amount: `Montant maximum: ${maxAmount} FCFA` 
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, amount: undefined }));
    return true;
  }, [rules]);
  
  const validatePin = useCallback((pin: string): boolean => {
    const pinLength = rules?.pinLength ?? 4;
    
    if (pin.length !== pinLength) {
      setErrors(prev => ({ 
        ...prev, 
        pin: `PIN doit contenir ${pinLength} chiffres` 
      }));
      return false;
    }
    
    if (!/^\d+$/.test(pin)) {
      setErrors(prev => ({ 
        ...prev, 
        pin: 'PIN doit contenir uniquement des chiffres' 
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, pin: undefined }));
    return true;
  }, [rules]);
  
  const validateVoucher = useCallback((code: string): boolean => {
    const pattern = rules?.voucherPattern ?? /^[A-Z0-9]{8,12}$/;
    
    if (!pattern.test(code)) {
      setErrors(prev => ({ 
        ...prev, 
        voucher: 'Format de voucher invalide' 
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, voucher: undefined }));
    return true;
  }, [rules]);
  
  const validateAgent = useCallback((agentId: string): boolean => {
    if (!agentId) {
      setErrors(prev => ({ 
        ...prev, 
        agent: 'Veuillez sélectionner un agent' 
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, agent: undefined }));
    return true;
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);
  
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== undefined);
  }, [errors]);
  
  return {
    errors,
    validateAmount,
    validatePin,
    validateVoucher,
    validateAgent,
    clearErrors,
    clearError,
    hasErrors,
  };
};

// Exemple d'utilisation
const CashInForm = () => {
  const { 
    errors, 
    validateAmount, 
    validatePin, 
    hasErrors 
  } = useCashInValidation({
    minAmount: 1000,
    maxAmount: 100000,
  });
  
  const [amount, setAmount] = useState(0);
  const [pin, setPin] = useState('');
  
  const handleAmountChange = (value: number) => {
    setAmount(value);
    validateAmount(value);
  };
  
  const handlePinChange = (value: string) => {
    setPin(value);
    validatePin(value);
  };
  
  const canSubmit = !hasErrors && amount > 0 && pin.length === 4;
  
  return (
    <View>
      <AmountInput
        value={amount}
        onChangeValue={handleAmountChange}
        error={errors.amount}
      />
      <PinInput
        value={pin}
        onChangeValue={handlePinChange}
        error={errors.pin}
      />
      <ActionButton
        title="Continuer"
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </View>
  );
};
```

### useCashInFees

Hook pour le calcul automatique des frais de cash-in.

```typescript
interface FeeBreakdown {
  baseFee: number;
  commissionFee: number;
  processingFee: number;
  totalFees: number;
}

interface FeeCalculationOptions {
  method: CashInMethod;
  amount: number;
  agentId?: string;
  bankAccountId?: string;
}

const useCashInFees = () => {
  const [fees, setFees] = useState<number>(0);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const calculateFees = useCallback(async (options: FeeCalculationOptions) => {
    setIsCalculating(true);
    setError(null);
    
    try {
      const result = await CashInService.calculateFees(
        options.amount,
        options.method,
        {
          agentId: options.agentId,
          bankAccountId: options.bankAccountId,
        }
      );
      
      if (result.success) {
        setFees(result.data.totalFees);
        setFeeBreakdown(result.data.breakdown);
      } else {
        setError(result.error || 'Erreur de calcul des frais');
      }
    } catch (err) {
      setError('Erreur de calcul des frais');
    } finally {
      setIsCalculating(false);
    }
  }, []);
  
  const getFeePercentage = useCallback((amount: number): number => {
    if (amount === 0) return 0;
    return (fees / amount) * 100;
  }, [fees]);
  
  const getNetAmount = useCallback((amount: number): number => {
    return amount - fees;
  }, [fees]);
  
  const reset = useCallback(() => {
    setFees(0);
    setFeeBreakdown(null);
    setError(null);
  }, []);
  
  return {
    fees,
    feeBreakdown,
    isCalculating,
    error,
    calculateFees,
    getFeePercentage,
    getNetAmount,
    reset,
  };
};

// Exemple d'utilisation
const CashInModal = () => {
  const { 
    fees, 
    feeBreakdown, 
    isCalculating, 
    calculateFees 
  } = useCashInFees();
  
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<CashInMethod>('agent');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  
  // Recalculer les frais quand les paramètres changent
  useEffect(() => {
    if (amount > 0 && method) {
      calculateFees({
        amount,
        method,
        agentId: method === 'agent' ? selectedAgent : undefined,
      });
    }
  }, [amount, method, selectedAgent, calculateFees]);
  
  return (
    <View>
      <AmountInput value={amount} onChangeValue={setAmount} />
      
      {isCalculating ? (
        <Text>Calcul des frais...</Text>
      ) : (
        <View>
          <Text>Frais: {fees} FCFA</Text>
          {feeBreakdown && (
            <View>
              <Text>Commission: {feeBreakdown.commissionFee} FCFA</Text>
              <Text>Traitement: {feeBreakdown.processingFee} FCFA</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
```

### useWalletBalance

Hook pour la gestion du solde du portefeuille avec synchronisation.

```typescript
interface WalletBalance {
  currentBalance: number;
  pendingBalance: number;
  lastUpdate: string;
}

const useWalletBalance = (userId: string) => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await WalletService.getBalance(userId);
      if (result.success) {
        setBalance(result.data);
      } else {
        setError(result.error || 'Erreur de récupération du solde');
      }
    } catch (err) {
      setError('Erreur de récupération du solde');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  const refreshBalance = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);
  
  const updateLocalBalance = useCallback((amount: number, type: 'credit' | 'debit') => {
    setBalance(prev => {
      if (!prev) return null;
      
      const newBalance = type === 'credit' 
        ? prev.currentBalance + amount
        : prev.currentBalance - amount;
      
      return {
        ...prev,
        currentBalance: Math.max(0, newBalance),
        lastUpdate: new Date().toISOString(),
      };
    });
  }, []);
  
  // Charger le solde initial
  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
  }, [userId, fetchBalance]);
  
  // Synchronisation périodique
  useEffect(() => {
    const interval = setInterval(refreshBalance, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [refreshBalance]);
  
  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    updateLocalBalance,
  };
};

// Exemple d'utilisation
const WalletScreen = () => {
  const { balance, isLoading, error, refreshBalance } = useWalletBalance('user_123');
  
  if (isLoading) {
    return <LoadingSpinner message="Chargement du solde..." />;
  }
  
  if (error) {
    return (
      <View>
        <Text>Erreur: {error}</Text>
        <ActionButton title="Réessayer" onPress={refreshBalance} />
      </View>
    );
  }
  
  return (
    <View>
      <Text>Solde actuel: {balance?.currentBalance} FCFA</Text>
      {balance?.pendingBalance > 0 && (
        <Text>En attente: {balance.pendingBalance} FCFA</Text>
      )}
      <ActionButton title="Actualiser" onPress={refreshBalance} />
    </View>
  );
};
```

### useTransactionHistory

Hook pour la gestion de l'historique des transactions avec pagination.

```typescript
interface TransactionHistoryOptions {
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

const useTransactionHistory = (userId: string, options?: TransactionHistoryOptions) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  
  const limit = options?.limit ?? 20;
  
  const fetchTransactions = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setOffset(0);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);
    
    try {
      const result = await WalletService.getTransactionHistory(userId, {
        ...options,
        limit,
        offset: reset ? 0 : offset,
      });
      
      if (result.success) {
        const newTransactions = result.data;
        
        if (reset) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }
        
        setHasMore(newTransactions.length === limit);
        setOffset(prev => reset ? limit : prev + limit);
      } else {
        setError(result.error || 'Erreur de récupération des transactions');
      }
    } catch (err) {
      setError('Erreur de récupération des transactions');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [userId, options, limit, offset]);
  
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchTransactions(false);
    }
  }, [fetchTransactions, isLoadingMore, hasMore]);
  
  const refresh = useCallback(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);
  
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);
  
  const updateTransaction = useCallback((transactionId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId ? { ...t, ...updates } : t
      )
    );
  }, []);
  
  // Charger les transactions initiales
  useEffect(() => {
    fetchTransactions(true);
  }, [userId, JSON.stringify(options)]);
  
  return {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    addTransaction,
    updateTransaction,
  };
};

// Exemple d'utilisation
const TransactionHistoryScreen = () => {
  const { 
    transactions, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    loadMore, 
    refresh 
  } = useTransactionHistory('user_123', {
    type: 'cash_in',
    limit: 10,
  });
  
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem transaction={item} />
  );
  
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <LoadingSpinner size="small" />;
  };
  
  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      refreshing={isLoading}
      onRefresh={refresh}
    />
  );
};
```

## 🎨 Hooks d'interface

### useThemeColors

Hook pour la gestion des couleurs du thème avec support du mode sombre.

```typescript
type ThemeMode = 'light' | 'dark' | 'auto';

const useThemeColors = (mode: ThemeMode = 'auto') => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    if (mode === 'auto') {
      // Détecter le thème système
      const colorScheme = Appearance.getColorScheme();
      setCurrentTheme(colorScheme === 'dark' ? 'dark' : 'light');
      
      // Écouter les changements
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setCurrentTheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
      
      return () => subscription?.remove();
    } else {
      setCurrentTheme(mode);
    }
  }, [mode]);
  
  const colors = useMemo(() => COLORS[currentTheme], [currentTheme]);
  
  const isDark = currentTheme === 'dark';
  
  return {
    colors,
    isDark,
    currentTheme,
  };
};

// Exemple d'utilisation
const ThemedComponent = () => {
  const { colors, isDark } = useThemeColors();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Mode {isDark ? 'sombre' : 'clair'} actif
      </Text>
    </View>
  );
};
```

### useCustomAlert

Hook pour l'affichage d'alertes personnalisées avec queue.

```typescript
interface AlertOptions {
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  actions?: AlertAction[];
  dismissible?: boolean;
}

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  id: string;
  options: AlertOptions;
  visible: boolean;
}

const useCustomAlert = () => {
  const [alerts, setAlerts] = useState<AlertState[]>([]);
  
  const showAlert = useCallback((options: AlertOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const alert: AlertState = {
      id,
      options,
      visible: true,
    };
    
    setAlerts(prev => [...prev, alert]);
    
    // Auto-dismiss si duration spécifiée
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        hideAlert(id);
      }, options.duration);
    }
    
    return id;
  }, []);
  
  const hideAlert = useCallback((id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, visible: false }
          : alert
      )
    );
    
    // Supprimer après l'animation
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  }, []);
  
  const hideAllAlerts = useCallback(() => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, visible: false }))
    );
    
    setTimeout(() => {
      setAlerts([]);
    }, 300);
  }, []);
  
  const showSuccess = useCallback((title: string, message?: string) => {
    return showAlert({
      title,
      message,
      type: 'success',
      duration: 3000,
    });
  }, [showAlert]);
  
  const showError = useCallback((title: string, message?: string) => {
    return showAlert({
      title,
      message,
      type: 'error',
      dismissible: true,
    });
  }, [showAlert]);
  
  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    return showAlert({
      title,
      message,
      type: 'warning',
      actions: [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: onCancel || (() => {}),
        },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
    });
  }, [showAlert]);
  
  return {
    alerts,
    showAlert,
    hideAlert,
    hideAllAlerts,
    showSuccess,
    showError,
    showConfirm,
  };
};

// Exemple d'utilisation
const MyComponent = () => {
  const { showSuccess, showError, showConfirm } = useCustomAlert();
  
  const handleSuccess = () => {
    showSuccess('Succès', 'Opération réalisée avec succès');
  };
  
  const handleError = () => {
    showError('Erreur', 'Une erreur est survenue');
  };
  
  const handleDelete = () => {
    showConfirm(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet élément ?',
      () => {
        // Logique de suppression
        console.log('Élément supprimé');
      }
    );
  };
  
  return (
    <View>
      <ActionButton title="Succès" onPress={handleSuccess} />
      <ActionButton title="Erreur" onPress={handleError} />
      <ActionButton title="Supprimer" onPress={handleDelete} />
    </View>
  );
};
```

### useModal

Hook pour la gestion des modals avec état et animations.

```typescript
interface ModalState {
  visible: boolean;
  data?: any;
  animating: boolean;
}

const useModal = (initialVisible = false) => {
  const [state, setState] = useState<ModalState>({
    visible: initialVisible,
    data: null,
    animating: false,
  });
  
  const show = useCallback((data?: any) => {
    setState({
      visible: true,
      data,
      animating: true,
    });
    
    // Fin de l'animation d'ouverture
    setTimeout(() => {
      setState(prev => ({ ...prev, animating: false }));
    }, 300);
  }, []);
  
  const hide = useCallback(() => {
    setState(prev => ({ ...prev, animating: true }));
    
    // Fin de l'animation de fermeture
    setTimeout(() => {
      setState({
        visible: false,
        data: null,
        animating: false,
      });
    }, 300);
  }, []);
  
  const toggle = useCallback((data?: any) => {
    if (state.visible) {
      hide();
    } else {
      show(data);
    }
  }, [state.visible, show, hide]);
  
  const setData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data }));
  }, []);
  
  return {
    visible: state.visible,
    data: state.data,
    animating: state.animating,
    show,
    hide,
    toggle,
    setData,
  };
};

// Exemple d'utilisation
const ComponentWithModal = () => {
  const modal = useModal();
  
  const handleShowModal = () => {
    modal.show({ title: 'Modal Data' });
  };
  
  return (
    <View>
      <ActionButton title="Ouvrir Modal" onPress={handleShowModal} />
      
      <ModalContainer
        visible={modal.visible}
        onClose={modal.hide}
        title={modal.data?.title}
      >
        <Text>Contenu du modal</Text>
      </ModalContainer>
    </View>
  );
};
```

## 🗄️ Hooks de données

### useStorage

Hook pour l'interaction avec le stockage local (SQLite).

```typescript
const useStorage = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    initializeDatabase()
      .then(() => setIsReady(true))
      .catch(err => setError(err.message));
  }, []);
  
  const create = useCallback(async <T>(table: string, data: T): Promise<string | null> => {
    if (!isReady) return null;
    
    try {
      const id = await storage.create(table, data);
      return id;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [isReady]);
  
  const read = useCallback(async <T>(table: string, id: string): Promise<T | null> => {
    if (!isReady) return null;
    
    try {
      const data = await storage.read<T>(table, id);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [isReady]);
  
  const update = useCallback(async <T>(table: string, id: string, data: Partial<T>): Promise<boolean> => {
    if (!isReady) return false;
    
    try {
      await storage.update(table, id, data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isReady]);
  
  const remove = useCallback(async (table: string, id: string): Promise<boolean> => {
    if (!isReady) return false;
    
    try {
      await storage.remove(table, id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isReady]);
  
  const query = useCallback(async <T>(table: string, conditions?: any): Promise<T[]> => {
    if (!isReady) return [];
    
    try {
      const data = await storage.query<T>(table, conditions);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [isReady]);
  
  return {
    isReady,
    error,
    create,
    read,
    update,
    remove,
    query,
  };
};
```

### useSecureStorage

Hook pour le stockage sécurisé des données sensibles.

```typescript
const useSecureStorage = () => {
  const store = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('Erreur stockage sécurisé:', error);
      return false;
    }
  }, []);
  
  const retrieve = useCallback(async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('Erreur récupération sécurisée:', error);
      return null;
    }
  }, []);
  
  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Erreur suppression sécurisée:', error);
      return false;
    }
  }, []);
  
  const exists = useCallback(async (key: string): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }, []);
  
  return {
    store,
    retrieve,
    remove,
    exists,
  };
};
```

## 🛠️ Hooks utilitaires

### useDebounce

Hook pour débouncer les valeurs et éviter les appels excessifs.

```typescript
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Exemple d'utilisation
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Effectuer la recherche
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <TextInput
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Rechercher..."
    />
  );
};
```

### useAsync

Hook pour gérer les opérations asynchrones avec état de chargement.

```typescript
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useAsync = <T>(asyncFunction: () => Promise<T>, dependencies: any[] = []) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, dependencies);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  return {
    ...state,
    execute,
  };
};

// Exemple d'utilisation
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, loading, error, execute } = useAsync(
    () => UserService.getUser(userId),
    [userId]
  );
  
  if (loading) return <LoadingSpinner />;
  if (error) return <Text>Erreur: {error}</Text>;
  if (!user) return <Text>Utilisateur non trouvé</Text>;
  
  return (
    <View>
      <Text>{user.name}</Text>
      <ActionButton title="Actualiser" onPress={execute} />
    </View>
  );
};
```

### usePrevious

Hook pour conserver la valeur précédente d'une variable.

```typescript
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Exemple d'utilisation
const ComponentWithPrevious = ({ count }: { count: number }) => {
  const previousCount = usePrevious(count);
  
  return (
    <View>
      <Text>Actuel: {count}</Text>
      <Text>Précédent: {previousCount ?? 'N/A'}</Text>
      <Text>
        {count > (previousCount ?? 0) ? 'Augmentation' : 'Diminution'}
      </Text>
    </View>
  );
};
```

## 🧪 Tests des hooks

### Exemple de test de hook

```typescript
// __tests__/hooks/useCashInValidation.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCashInValidation } from '@/hooks/useCashInValidation';

describe('useCashInValidation', () => {
  it('should validate amount correctly', () => {
    const { result } = renderHook(() => useCashInValidation());
    
    act(() => {
      const isValid = result.current.validateAmount(5000);
      expect(isValid).toBe(true);
      expect(result.current.errors.amount).toBeUndefined();
    });
    
    act(() => {
      const isValid = result.current.validateAmount(100);
      expect(isValid).toBe(false);
      expect(result.current.errors.amount).toBe('Montant minimum: 500 FCFA');
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
});
```

### Test de hook avec dépendances

```typescript
// __tests__/hooks/useWalletBalance.test.ts
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { WalletService } from '@/services/WalletService';

jest.mock('@/services/WalletService');

describe('useWalletBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch balance on mount', async () => {
    const mockBalance = {
      currentBalance: 10000,
      pendingBalance: 0,
      lastUpdate: '2024-01-01T10:00:00Z',
    };
    
    WalletService.getBalance.mockResolvedValue({
      success: true,
      data: mockBalance,
    });
    
    const { result } = renderHook(() => useWalletBalance('user_123'));
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.balance).toEqual(mockBalance);
    expect(WalletService.getBalance).toHaveBeenCalledWith('user_123');
  });
});
```

Les hooks personnalisés d'OffliPay fournissent une base solide pour le développement de fonctionnalités robustes et réutilisables, tout en maintenant une séparation claire des responsabilités et une facilité de test.