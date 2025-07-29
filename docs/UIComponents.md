# Composants UI - OffliPay

## 📋 Vue d'ensemble

Cette documentation couvre l'ensemble des composants UI réutilisables d'OffliPay, conçus pour maintenir une cohérence visuelle et une expérience utilisateur optimale à travers l'application.

## 🎨 Design System

### Principes de design
- **Cohérence** : Composants uniformes dans toute l'application
- **Accessibilité** : Support complet des technologies d'assistance
- **Responsive** : Adaptation automatique aux différentes tailles d'écran
- **Thématique** : Support des modes clair/sombre
- **Performance** : Optimisés pour React Native

### Palette de couleurs

```typescript
// utils/theme.ts
export const COLORS = {
  light: {
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
    disabled: '#D1D1D6',
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    disabled: '#48484A',
  },
};
```

### Typographie

```typescript
export const TYPO = {
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  subtitle: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: 'normal', lineHeight: 22 },
  caption: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
  small: { fontSize: 12, fontWeight: 'normal', lineHeight: 18 },
};
```

## 🧩 Composants de base

### ActionButton

Bouton d'action principal avec différentes variantes et états.

```typescript
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  testID?: string;
}

// Exemple d'utilisation
<ActionButton
  title="Confirmer le paiement"
  onPress={handleConfirm}
  variant="primary"
  size="large"
  loading={isProcessing}
  icon="check"
  fullWidth
  testID="confirm-button"
/>
```

#### Variantes disponibles

```typescript
// Primary - Action principale
<ActionButton title="Confirmer" variant="primary" />

// Secondary - Action secondaire
<ActionButton title="Annuler" variant="secondary" />

// Danger - Action destructive
<ActionButton title="Supprimer" variant="danger" />

// Ghost - Action discrète
<ActionButton title="Ignorer" variant="ghost" />
```

#### États du bouton

```typescript
// État de chargement
<ActionButton title="Traitement..." loading={true} />

// État désactivé
<ActionButton title="Non disponible" disabled={true} />

// Avec icône
<ActionButton 
  title="Scanner QR" 
  icon="qr-code" 
  iconPosition="left" 
/>
```

### AmountInput

Composant spécialisé pour la saisie de montants avec formatage automatique.

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
  showCurrency?: boolean;
  autoFocus?: boolean;
  testID?: string;
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
  showCurrency={true}
  testID="amount-input"
/>
```

#### Fonctionnalités

```typescript
// Formatage automatique des nombres
// Input: "10000" → Display: "10 000 FCFA"

// Validation en temps réel
const [amount, setAmount] = useState(0);
const [error, setError] = useState('');

const handleAmountChange = (value: number) => {
  if (value < 500) {
    setError('Montant minimum: 500 FCFA');
  } else if (value > 100000) {
    setError('Montant maximum: 100 000 FCFA');
  } else {
    setError('');
    setAmount(value);
  }
};
```

### SectionCard

Conteneur pour organiser le contenu en sections avec titre et actions.

```typescript
interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  testID?: string;
}

// Exemple d'utilisation
<SectionCard
  title="Informations de paiement"
  subtitle="Détails de la transaction"
  collapsible={true}
  defaultExpanded={true}
  headerAction={
    <ActionButton title="Modifier" variant="ghost" size="small" />
  }
  variant="elevated"
>
  <Text>Contenu de la section</Text>
</SectionCard>
```

#### Variantes de carte

```typescript
// Carte par défaut
<SectionCard variant="default">
  <Text>Contenu standard</Text>
</SectionCard>

// Carte élevée avec ombre
<SectionCard variant="elevated">
  <Text>Contenu avec ombre</Text>
</SectionCard>

// Carte avec bordure
<SectionCard variant="outlined">
  <Text>Contenu avec bordure</Text>
</SectionCard>
```

### ModalContainer

Conteneur modal réutilisable avec animations et gestion des gestes.

```typescript
interface ModalContainerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  position?: 'center' | 'bottom' | 'top';
  fullScreen?: boolean;
  testID?: string;
}

// Exemple d'utilisation
<ModalContainer
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  title="Ajouter des fonds"
  subtitle="Choisissez votre méthode de paiement"
  animationType="slide"
  position="bottom"
  closeOnBackdrop={true}
  testID="cash-in-modal"
>
  <CashInContent />
</ModalContainer>
```

#### Positions et animations

```typescript
// Modal centré avec fade
<ModalContainer 
  animationType="fade" 
  position="center" 
/>

// Modal bottom sheet
<ModalContainer 
  animationType="slide" 
  position="bottom" 
/>

// Modal plein écran
<ModalContainer 
  fullScreen={true}
  animationType="slide"
/>
```

### SelectionCard

Carte de sélection pour les choix multiples avec état sélectionné.

```typescript
interface SelectionCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  badge?: string;
  rightElement?: React.ReactNode;
  testID?: string;
}

// Exemple d'utilisation
<SelectionCard
  title="Paiement par agent"
  subtitle="Via notre réseau d'agents"
  description="Trouvez un agent près de chez vous"
  icon="user"
  selected={selectedMethod === 'agent'}
  onPress={() => setSelectedMethod('agent')}
  badge="Recommandé"
  variant="detailed"
  testID="method-agent"
/>
```

#### Variantes de sélection

```typescript
// Carte compacte
<SelectionCard
  title="Agent"
  icon="user"
  variant="compact"
  selected={selected}
  onPress={onSelect}
/>

// Carte détaillée
<SelectionCard
  title="Paiement par agent"
  subtitle="Réseau d'agents physiques"
  description="Plus de 1000 agents disponibles"
  icon="user"
  variant="detailed"
  badge="Populaire"
  rightElement={<Text>2% de frais</Text>}
/>
```

## 📝 Composants de formulaire

### TextInput

Champ de saisie de texte avec validation et états.

```typescript
interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  testID?: string;
}

// Exemple d'utilisation
<TextInput
  value={phoneNumber}
  onChangeText={setPhoneNumber}
  label="Numéro de téléphone"
  placeholder="+221 XX XXX XX XX"
  keyboardType="phone-pad"
  leftIcon="phone"
  error={errors.phone}
  testID="phone-input"
/>
```

### PinInput

Composant spécialisé pour la saisie de code PIN.

```typescript
interface PinInputProps {
  value: string;
  onChangeValue: (pin: string) => void;
  length?: number;
  masked?: boolean;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  testID?: string;
}

// Exemple d'utilisation
<PinInput
  value={pin}
  onChangeValue={setPin}
  length={4}
  masked={true}
  error={errors.pin}
  autoFocus={true}
  testID="pin-input"
/>
```

### Checkbox

Case à cocher avec label et états.

```typescript
interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  testID?: string;
}

// Exemple d'utilisation
<Checkbox
  checked={acceptTerms}
  onPress={() => setAcceptTerms(!acceptTerms)}
  label="J'accepte les conditions d'utilisation"
  testID="terms-checkbox"
/>
```

## 📊 Composants d'affichage

### StatusBadge

Badge pour afficher le statut avec couleurs appropriées.

```typescript
interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  text: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'subtle';
  testID?: string;
}

// Exemple d'utilisation
<StatusBadge
  status="success"
  text="Terminé"
  size="medium"
  variant="filled"
  testID="transaction-status"
/>
```

### ProgressBar

Barre de progression avec animation.

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  showPercentage?: boolean;
  testID?: string;
}

// Exemple d'utilisation
<ProgressBar
  progress={uploadProgress}
  color={colors.primary}
  height={8}
  animated={true}
  showPercentage={true}
  testID="upload-progress"
/>
```

### Avatar

Composant d'avatar avec initiales ou image.

```typescript
interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  testID?: string;
}

// Exemple d'utilisation
<Avatar
  name="John Doe"
  size={48}
  backgroundColor={colors.primary}
  textColor={colors.white}
  testID="user-avatar"
/>

// Avec image
<Avatar
  source={{ uri: 'https://example.com/avatar.jpg' }}
  size={48}
  testID="user-avatar"
/>
```

## 📱 Composants de navigation

### TabBar

Barre d'onglets personnalisée.

```typescript
interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  testID?: string;
}

interface TabItem {
  id: string;
  title: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

// Exemple d'utilisation
<TabBar
  tabs={[
    { id: 'home', title: 'Accueil', icon: 'home' },
    { id: 'wallet', title: 'Portefeuille', icon: 'wallet', badge: 3 },
    { id: 'history', title: 'Historique', icon: 'history' },
  ]}
  activeTab={activeTab}
  onTabPress={setActiveTab}
  variant="pills"
  testID="main-tabs"
/>
```

### Breadcrumb

Fil d'Ariane pour la navigation.

```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemPress?: (item: BreadcrumbItem) => void;
  separator?: string;
  testID?: string;
}

interface BreadcrumbItem {
  id: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
}

// Exemple d'utilisation
<Breadcrumb
  items={[
    { id: 'home', title: 'Accueil' },
    { id: 'wallet', title: 'Portefeuille' },
    { id: 'cash-in', title: 'Ajouter des fonds', active: true },
  ]}
  onItemPress={handleBreadcrumbPress}
  testID="navigation-breadcrumb"
/>
```

## 🔔 Composants de feedback

### Alert

Composant d'alerte avec différents types.

```typescript
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  visible: boolean;
  onClose?: () => void;
  actions?: AlertAction[];
  dismissible?: boolean;
  testID?: string;
}

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

// Exemple d'utilisation
<Alert
  type="success"
  title="Transaction réussie"
  message="Votre paiement a été traité avec succès"
  visible={showAlert}
  onClose={() => setShowAlert(false)}
  actions={[
    { text: 'OK', onPress: () => setShowAlert(false) }
  ]}
  testID="success-alert"
/>
```

### Toast

Notification toast temporaire.

```typescript
interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top' | 'bottom';
  visible: boolean;
  onHide: () => void;
  testID?: string;
}

// Exemple d'utilisation
<Toast
  message="Transaction en cours..."
  type="info"
  duration={3000}
  position="top"
  visible={showToast}
  onHide={() => setShowToast(false)}
  testID="transaction-toast"
/>
```

### LoadingSpinner

Indicateur de chargement avec message optionnel.

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  testID?: string;
}

// Exemple d'utilisation
<LoadingSpinner
  size="large"
  color={colors.primary}
  message="Traitement en cours..."
  overlay={true}
  testID="loading-spinner"
/>
```

## 📋 Composants de liste

### ListItem

Élément de liste avec contenu flexible.

```typescript
interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  divider?: boolean;
  testID?: string;
}

// Exemple d'utilisation
<ListItem
  title="Agent Dakar Centre"
  subtitle="Médina, Dakar"
  description="Ouvert 24h/24"
  leftElement={<Avatar name="DC" size={40} />}
  rightElement={<StatusBadge status="success" text="Actif" />}
  onPress={() => selectAgent('agent_1')}
  testID="agent-item"
/>
```

### EmptyState

État vide avec illustration et actions.

```typescript
interface EmptyStateProps {
  title: string;
  subtitle?: string;
  illustration?: React.ReactNode;
  action?: {
    title: string;
    onPress: () => void;
  };
  testID?: string;
}

// Exemple d'utilisation
<EmptyState
  title="Aucune transaction"
  subtitle="Vous n'avez pas encore effectué de transaction"
  illustration={<EmptyTransactionsIcon />}
  action={{
    title: "Effectuer un paiement",
    onPress: () => navigation.navigate('Payment')
  }}
  testID="empty-transactions"
/>
```

## 🎨 Utilisation des thèmes

### Hook useThemeColors

```typescript
import { useThemeColors } from '@/hooks/useThemeColors';

const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
};
```

### Composant avec thème

```typescript
interface ThemedComponentProps {
  theme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
}

const ThemedComponent: React.FC<ThemedComponentProps> = ({ 
  theme = 'auto',
  accentColor 
}) => {
  const colors = useThemeColors(theme);
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
    accent: {
      color: accentColor || colors.primary,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Contenu</Text>
      <Text style={styles.accent}>Accent</Text>
    </View>
  );
};
```

## 🧪 Tests des composants UI

### Exemple de test

```typescript
// __tests__/components/ui/ActionButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActionButton } from '@/components/ui/ActionButton';

describe('ActionButton', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <ActionButton title="Test Button" onPress={jest.fn()} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const { getByTestId } = render(
      <ActionButton 
        title="Test Button" 
        onPress={jest.fn()} 
        loading={true}
        testID="test-button"
      />
    );
    
    expect(getByTestId('test-button-loading')).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton 
        title="Test Button" 
        onPress={mockOnPress} 
        disabled={true}
      />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

## 📚 Storybook (optionnel)

### Configuration Storybook

```typescript
// .storybook/main.js
module.exports = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-react-native-controls',
  ],
};
```

### Story d'exemple

```typescript
// components/ui/ActionButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ActionButton } from './ActionButton';

const meta: Meta<typeof ActionButton> = {
  title: 'UI/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
    onPress: () => console.log('Pressed'),
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Button',
    variant: 'primary',
    loading: true,
    onPress: () => console.log('Pressed'),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Button with Icon',
    variant: 'primary',
    icon: 'check',
    onPress: () => console.log('Pressed'),
  },
};
```

Cette bibliothèque de composants UI garantit une expérience utilisateur cohérente et professionnelle dans toute l'application OffliPay.