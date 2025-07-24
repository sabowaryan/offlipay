# Guide du Développeur - Onboarding Premium OffliPay

## Vue d'ensemble

L'onboarding premium d'OffliPay est une expérience immersive multi-slides avec des illustrations modernes de qualité professionnelle. Ce guide explique comment utiliser, personnaliser et étendre le système d'onboarding premium.

## Architecture

### Structure des Composants

```
components/onboarding/
├── OnboardingContainer.tsx           # Conteneur principal avec navigation multi-directionnelle
├── OnboardingScreen.tsx              # Écran avec support multi-slides
├── OnboardingSlideCarousel.tsx       # Carrousel de slides pour chaque écran
├── OnboardingProgress.tsx            # Indicateur de progression multi-niveaux
├── OnboardingGestureHandler.tsx      # Gestionnaire de gestes avancés
├── OnboardingTransitions.tsx         # Animations de transition personnalisées
├── OnboardingAccessibility.tsx       # Support d'accessibilité avancée
├── OnboardingCompletion.tsx          # Animation de célébration finale
├── OnboardingQuickPreview.tsx        # Mode aperçu rapide
├── types/
│   └── PremiumOnboardingConfig.ts    # Types et interfaces
└── illustrations/                    # Illustrations premium
    ├── welcome/
    ├── payment/
    ├── wallet/
    └── offline/
```

## Configuration

### Configuration de Base

```typescript
import { PremiumOnboardingConfig } from './types/PremiumOnboardingConfig';

const config: PremiumOnboardingConfig = {
  screens: [
    {
      id: 'welcome',
      title: 'Bienvenue',
      slides: [
        {
          id: 'intro',
          illustration: 'welcome_intro',
          title: 'Bienvenue dans l\'avenir des paiements',
          subtitle: 'Découvrez OffliPay',
          animationType: 'fadeIn',
          duration: 3000,
        },
        // ... autres slides
      ],
      transitionType: 'slide',
    },
    // ... autres écrans
  ],
  transitions: {
    screenTransitionDuration: 300,
    slideTransitionDuration: 250,
    easing: 'easeInOut',
    parallaxIntensity: 0.5,
  },
  gestures: {
    horizontalThreshold: 50,
    verticalThreshold: 30,
    velocityThreshold: 500,
    simultaneousGestures: false,
  },
  performance: {
    lazyLoadingEnabled: true,
    adaptiveAnimationsEnabled: true,
    memoryMonitoringEnabled: true,
  },
  accessibility: {
    screenReaderSupport: true,
    reduceMotionSupport: true,
    audioDescriptionsEnabled: true,
  },
};
```

### Personnalisation des Illustrations

Pour créer une nouvelle illustration :

1. Créez un composant React dans le dossier approprié
2. Implémentez l'interface `IllustrationProps`
3. Ajoutez le composant au mapping dans `OnboardingContainer`

```typescript
// Exemple d'illustration personnalisée
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface CustomIllustrationProps {
  theme: 'light' | 'dark';
  animationProgress: Animated.SharedValue<number>;
}

const CustomIllustration: React.FC<CustomIllustrationProps> = ({
  theme,
  animationProgress,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(animationProgress.value),
    transform: [
      { scale: withTiming(0.8 + animationProgress.value * 0.2) }
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Votre illustration ici */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomIllustration;
```

## Utilisation

### Intégration de Base

```typescript
import React from 'react';
import OnboardingContainer from './components/onboarding/OnboardingContainer';

const App = () => {
  const handleOnboardingComplete = () => {
    // Navigation vers l'écran principal
    console.log('Onboarding terminé');
  };

  const handleOnboardingSkip = () => {
    // Gestion de l'ignorance de l'onboarding
    console.log('Onboarding ignoré');
  };

  return (
    <OnboardingContainer
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
    />
  );
};

export default App;
```

### Navigation Gestuelle

Le système supporte plusieurs types de gestes :

- **Swipe horizontal** : Navigation entre écrans principaux
- **Swipe vertical** : Navigation entre slides d'un même écran
- **Tap** : Progression automatique vers le slide/écran suivant

### Optimisations de Performance

Le système s'adapte automatiquement aux capacités de l'appareil :

```typescript
import { getDeviceCapabilities, getOptimizedAnimationConfig } from '@/utils/performanceOptimizer';

const deviceCapabilities = getDeviceCapabilities();
const animationConfig = getOptimizedAnimationConfig();

// Utilisation des capacités détectées
if (deviceCapabilities.supportsComplexAnimations) {
  // Activer les animations complexes
} else {
  // Utiliser des animations simplifiées
}
```

## Accessibilité

### Support des Technologies d'Assistance

Le système inclut un support complet pour :

- **VoiceOver/TalkBack** : Descriptions audio automatiques
- **Réduction de mouvement** : Alternatives statiques élégantes
- **Navigation au clavier** : Contrôles alternatifs

### Configuration d'Accessibilité

```typescript
import OnboardingAccessibility from './OnboardingAccessibility';

const AccessibleOnboarding = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <OnboardingAccessibility
      title="Écran actuel"
      description="Description détaillée"
      isScreenActive={true}
      reduceMotionEnabled={reduceMotion}
      onReduceMotionChange={setReduceMotion}
    >
      {/* Contenu de l'onboarding */}
    </OnboardingAccessibility>
  );
};
```

## Tests

### Tests Unitaires

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingContainer from '../OnboardingContainer';

describe('OnboardingContainer', () => {
  it('should navigate to next screen on swipe left', () => {
    const { getByTestId } = render(
      <OnboardingContainer onComplete={jest.fn()} onSkip={jest.fn()} />
    );
    
    const container = getByTestId('onboarding-container');
    fireEvent(container, 'onSwipeLeft');
    
    // Assertions...
  });
});
```

### Tests d'Intégration

```typescript
import { renderWithProviders } from '../test-utils';
import OnboardingFlow from '../OnboardingFlow';

describe('Onboarding Flow', () => {
  it('should complete full onboarding flow', async () => {
    const { getByText, getByTestId } = renderWithProviders(<OnboardingFlow />);
    
    // Simuler la progression complète
    // Assertions...
  });
});
```

## Métriques de Performance

### Objectifs de Performance

- **Fluidité** : 60fps constant sur tous les appareils
- **Chargement** : < 1.5s pour le premier écran
- **Mémoire** : < 80MB d'utilisation maximale
- **Engagement** : Taux de completion > 85%

### Monitoring

```typescript
import { measureOperation, startMemoryMonitoring } from '@/utils/performanceOptimizer';

// Mesurer une opération
const result = await measureOperation(
  () => loadIllustration('welcome_intro'),
  'Load Welcome Illustration'
);

// Démarrer le monitoring mémoire
startMemoryMonitoring();
```

## Dépannage

### Problèmes Courants

1. **Animations saccadées**
   - Vérifiez que `useNativeDriver: true` est activé
   - Réduisez la complexité des animations sur les appareils faibles

2. **Gestes non reconnus**
   - Vérifiez les seuils de gestes dans la configuration
   - Assurez-vous qu'il n'y a pas de conflits de gestes

3. **Problèmes de mémoire**
   - Activez le lazy loading des illustrations
   - Nettoyez le cache régulièrement

### Codes d'Erreur

```typescript
enum PremiumOnboardingErrorCode {
  SLIDE_LOAD_FAILED = 'SLIDE_001',
  GESTURE_CONFLICT = 'GESTURE_001',
  ANIMATION_PERFORMANCE = 'ANIM_002',
  ILLUSTRATION_RENDER = 'ILLUS_001',
  MEMORY_LIMIT = 'MEM_001',
}
```

## Contribution

### Ajout de Nouvelles Fonctionnalités

1. Créez une branche feature
2. Implémentez les changements avec tests
3. Mettez à jour la documentation
4. Soumettez une pull request

### Standards de Code

- Utilisez TypeScript strict
- Suivez les conventions de nommage React Native
- Documentez les interfaces publiques
- Incluez des tests pour les nouvelles fonctionnalités

## Ressources

- [Documentation React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Guide d'Accessibilité React Native](https://reactnative.dev/docs/accessibility)
- [Optimisation des Performances](https://reactnative.dev/docs/performance)

