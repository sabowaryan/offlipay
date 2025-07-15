# Documentation Onboarding Élégant - OffliPay

## Vue d'ensemble

Le système d'onboarding élégant d'OffliPay offre une expérience d'accueil immersive et personnalisable pour les nouveaux utilisateurs. Il présente les fonctionnalités clés de l'application à travers 4 écrans interactifs avec des animations fluides et des illustrations attrayantes.

## Table des matières

1. [Installation et Configuration](#installation-et-configuration)
2. [Utilisation de base](#utilisation-de-base)
3. [Configuration personnalisée](#configuration-personnalisée)
4. [Composants disponibles](#composants-disponibles)
5. [Gestion des thèmes](#gestion-des-thèmes)
6. [Accessibilité](#accessibilité)
7. [Performance](#performance)
8. [Exemples d'usage](#exemples-dusage)
9. [API Reference](#api-reference)
10. [Dépannage](#dépannage)

## Installation et Configuration

### Prérequis

- React Native 0.72+
- Expo SDK 49+
- React Native Reanimated 3+
- React Native Gesture Handler 2+

### Dépendances requises

```bash
npm install react-native-reanimated react-native-gesture-handler expo-haptics
```

### Configuration initiale

1. **Importez le composant principal :**

```typescript
import { OnboardingContainer } from '@/components/onboarding';
```

2. **Ajoutez l'onboarding à votre flux d'authentification :**

```typescript
import { OnboardingService } from '@/services/OnboardingService';

// Vérifiez si l'utilisateur a déjà vu l'onboarding
const hasSeenOnboarding = await OnboardingService.hasCompletedOnboarding();

if (!hasSeenOnboarding) {
  // Afficher l'onboarding
}
```

## Utilisation de base

### Intégration simple

```typescript
import React from 'react';
import { OnboardingContainer } from '@/components/onboarding';

export default function App() {
  const handleOnboardingComplete = () => {
    // Rediriger vers l'écran d'authentification
    navigation.navigate('Auth');
  };

  const handleOnboardingSkip = () => {
    // Gérer le skip de l'onboarding
    navigation.navigate('Auth');
  };

  return (
    <OnboardingContainer
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
    />
  );
}
```

### Vérification du statut d'onboarding

```typescript
import { OnboardingService } from '@/services/OnboardingService';

// Vérifier si l'onboarding a été complété
const isCompleted = await OnboardingService.hasCompletedOnboarding();

// Obtenir les préférences d'onboarding
const preferences = await OnboardingService.getPreferences();

// Marquer l'onboarding comme complété
await OnboardingService.markAsCompleted();

// Réinitialiser l'onboarding (pour les tests)
await OnboardingService.reset();
```

## Configuration personnalisée

### Configuration des écrans

Vous pouvez personnaliser les écrans d'onboarding en modifiant le fichier `components/onboarding/config.ts` :

```typescript
import { OnboardingScreenConfig } from './types';

const CUSTOM_SCREENS: OnboardingScreenConfig[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur MonApp',
    subtitle: 'Découvrez toutes nos fonctionnalités',
    illustration: 'welcome',
    animationType: 'fadeIn',
    interactionType: 'tap',
    duration: 2000,
  },
  // Ajoutez vos écrans personnalisés...
];
```

### Configuration des paramètres globaux

```typescript
import { OnboardingSettings } from './types';

const CUSTOM_SETTINGS: OnboardingSettings = {
  screens: CUSTOM_SCREENS,
  theme: 'dark', // 'light' | 'dark' | 'auto'
  animationSpeed: 'fast', // 'slow' | 'normal' | 'fast'
  skipEnabled: true,
  progressIndicatorStyle: 'bar', // 'dots' | 'bar' | 'steps'
};
```

### Personnalisation des animations

```typescript
// Configuration des animations par type d'appareil
const CUSTOM_ANIMATION_CONFIG = {
  highEnd: {
    duration: 1.0,
    complexity: 'full',
    particleCount: 150,
    enableBlur: true,
  },
  midRange: {
    duration: 1.0,
    complexity: 'medium',
    particleCount: 75,
    enableBlur: true,
  },
  lowEnd: {
    duration: 1.5,
    complexity: 'simple',
    particleCount: 30,
    enableBlur: false,
  },
};
```

## Composants disponibles

### OnboardingContainer

Le composant principal qui orchestre tout le flux d'onboarding.

**Props :**
- `onComplete: () => void` - Callback appelé quand l'onboarding est terminé
- `onSkip: () => void` - Callback appelé quand l'utilisateur skip l'onboarding

**Fonctionnalités :**
- Navigation par gestes (swipe)
- Sauvegarde automatique de la progression
- Support des thèmes
- Optimisations de performance automatiques

### OnboardingScreen

Composant pour afficher un écran individuel d'onboarding.

**Props :**
- `title: string` - Titre de l'écran
- `subtitle: string` - Sous-titre de l'écran
- `illustration: ComponentType` - Composant d'illustration
- `animationDelay?: number` - Délai avant l'animation
- `onInteraction?: () => void` - Callback d'interaction
- `interactionHint?: string` - Texte d'aide pour l'interaction

### OnboardingProgress

Indicateur de progression personnalisable.

**Props :**
- `currentStep: number` - Étape actuelle
- `totalSteps: number` - Nombre total d'étapes
- `animated?: boolean` - Activer les animations

### OnboardingButton

Bouton stylisé pour les actions d'onboarding.

**Props :**
- `title: string` - Texte du bouton
- `onPress: () => void` - Callback de pression
- `variant?: 'primary' | 'secondary' | 'ghost'` - Style du bouton
- `disabled?: boolean` - État désactivé
- `loading?: boolean` - État de chargement

## Gestion des thèmes

### Thèmes supportés

- **Light** : Thème clair
- **Dark** : Thème sombre
- **Auto** : Suit les préférences système

### Personnalisation des couleurs

```typescript
// Les couleurs sont automatiquement adaptées selon le thème
const colors = useThemeColors();

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
});
```

## Accessibilité

### Fonctionnalités d'accessibilité intégrées

- **Support des lecteurs d'écran** (VoiceOver, TalkBack)
- **Navigation au clavier** (version web)
- **Contrastes élevés** automatiques
- **Tailles de police dynamiques**
- **Descriptions alternatives** pour les illustrations

### Configuration de l'accessibilité

```typescript
// Les textes alternatifs sont configurés automatiquement
import { ILLUSTRATION_ALT_TEXT, SCREEN_DESCRIPTIONS } from './config';

// Personnalisation des descriptions
const customAltText = {
  welcome: 'Votre description personnalisée...',
};
```

## Performance

### Optimisations automatiques

- **Détection de la puissance de l'appareil**
- **Adaptation automatique des animations**
- **Lazy loading des illustrations**
- **Préchargement intelligent**

### Métriques de performance

```typescript
import { usePerformanceMonitoring } from './utils/performanceMonitor';

// Surveillance automatique des performances
const { metrics, isLowEndDevice } = usePerformanceMonitoring();

// Adaptation manuelle si nécessaire
if (isLowEndDevice) {
  // Utiliser des animations simplifiées
}
```

### Configuration de performance

```typescript
// Personnaliser les seuils de performance
const PERFORMANCE_THRESHOLDS = {
  lowEnd: {
    maxMemory: 2048, // MB
    minCpuCores: 4,
    targetFPS: 30,
  },
  midRange: {
    maxMemory: 4096,
    minCpuCores: 6,
    targetFPS: 60,
  },
};
```

## Exemples d'usage

### Exemple 1 : Intégration basique

```typescript
import React from 'react';
import { OnboardingContainer } from '@/components/onboarding';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const navigation = useNavigation();

  return (
    <OnboardingContainer
      onComplete={() => navigation.navigate('Home')}
      onSkip={() => navigation.navigate('Auth')}
    />
  );
}
```

### Exemple 2 : Avec vérification préalable

```typescript
import React, { useEffect, useState } from 'react';
import { OnboardingContainer } from '@/components/onboarding';
import { OnboardingService } from '@/services/OnboardingService';

export default function ConditionalOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await OnboardingService.hasCompletedOnboarding();
      setShowOnboarding(!hasCompleted);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'onboarding:', error);
      setShowOnboarding(true); // Afficher par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!showOnboarding) {
    return <MainApp />;
  }

  return (
    <OnboardingContainer
      onComplete={() => setShowOnboarding(false)}
      onSkip={() => setShowOnboarding(false)}
    />
  );
}
```

### Exemple 3 : Personnalisation avancée

```typescript
import React from 'react';
import { OnboardingContainer } from '@/components/onboarding';
import { CUSTOM_SCREENS, CUSTOM_SETTINGS } from './customConfig';

export default function CustomOnboarding() {
  const handleComplete = async () => {
    // Logique personnalisée de completion
    await analytics.track('onboarding_completed');
    await OnboardingService.markAsCompleted();
    navigation.navigate('Home');
  };

  const handleSkip = async () => {
    // Logique personnalisée de skip
    await analytics.track('onboarding_skipped');
    navigation.navigate('Auth');
  };

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={handleSkip}
      // Configuration personnalisée appliquée via le fichier config
    />
  );
}
```

## API Reference

### OnboardingService

Service principal pour la gestion de l'état d'onboarding.

#### Méthodes

```typescript
class OnboardingService {
  // Vérifier si l'onboarding a été complété
  static async hasCompletedOnboarding(): Promise<boolean>
  
  // Marquer l'onboarding comme complété
  static async markAsCompleted(): Promise<void>
  
  // Obtenir les préférences d'onboarding
  static async getPreferences(): Promise<OnboardingPreferences>
  
  // Sauvegarder les préférences
  static async savePreferences(preferences: OnboardingPreferences): Promise<void>
  
  // Réinitialiser l'onboarding (pour les tests)
  static async reset(): Promise<void>
  
  // Sauvegarder la progression actuelle
  static async saveProgress(step: number): Promise<void>
  
  // Obtenir la progression sauvegardée
  static async getProgress(): Promise<number>
}
```

### Types principaux

```typescript
// Configuration d'un écran
interface OnboardingScreenConfig {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  animationType: AnimationType;
  interactionType?: InteractionType;
  duration: number;
}

// Paramètres globaux
interface OnboardingSettings {
  screens: OnboardingScreenConfig[];
  theme: ThemeType;
  animationSpeed: AnimationSpeed;
  skipEnabled: boolean;
  progressIndicatorStyle: ProgressIndicatorStyle;
}

// Préférences utilisateur
interface OnboardingPreferences {
  hasCompletedOnboarding: boolean;
  lastCompletedStep: number;
  theme: ThemeType;
  skipEnabled: boolean;
  completedAt?: Date;
}
```

## Dépannage

### Problèmes courants

#### 1. Les animations ne s'affichent pas

**Cause :** React Native Reanimated mal configuré
**Solution :**
```bash
# Réinstaller les dépendances
npm install react-native-reanimated
# Sur iOS
cd ios && pod install
```

#### 2. L'onboarding s'affiche à chaque lancement

**Cause :** Problème de sauvegarde des préférences
**Solution :**
```typescript
// Vérifier les permissions de stockage
import { OnboardingService } from '@/services/OnboardingService';

try {
  await OnboardingService.markAsCompleted();
} catch (error) {
  console.error('Erreur de sauvegarde:', error);
  // Utiliser un fallback local
}
```

#### 3. Performance dégradée sur certains appareils

**Cause :** Animations trop complexes
**Solution :**
```typescript
// La détection automatique devrait gérer cela
// Forcer le mode simple si nécessaire
import { ANIMATION_CONFIGS } from './config';

const config = ANIMATION_CONFIGS.lowEnd;
```

#### 4. Problèmes d'accessibilité

**Cause :** Descriptions manquantes
**Solution :**
```typescript
// Vérifier que tous les textes alternatifs sont définis
import { ILLUSTRATION_ALT_TEXT } from './config';

// Ajouter des descriptions personnalisées si nécessaire
```

### Logs de débogage

```typescript
// Activer les logs détaillés
import { OnboardingService } from '@/services/OnboardingService';

// En mode développement
if (__DEV__) {
  OnboardingService.enableDebugLogs(true);
}
```

### Tests de validation

```typescript
// Tester le flux complet
import { validateOnboardingFlow } from '@/__tests__/onboarding/validation';

// Exécuter les tests de validation
await validateOnboardingFlow();
```

## Support et contribution

Pour signaler des bugs ou proposer des améliorations, veuillez consulter la documentation de contribution du projet.

### Ressources utiles

- [Guide de conception](./design.md)
- [Spécifications techniques](./requirements.md)
- [Tests d'accessibilité](../__tests__/components/OnboardingAccessibility.test.tsx)
- [Tests de performance](../__tests__/components/OnboardingPerformance.test.tsx)