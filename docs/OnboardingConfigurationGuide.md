# Guide de Configuration - Onboarding Personnalisable

## Vue d'ensemble

Ce guide détaille toutes les options de configuration disponibles pour personnaliser l'expérience d'onboarding selon vos besoins spécifiques.

## Configuration des écrans

### Structure de base

```typescript
interface OnboardingScreenConfig {
  id: string;                    // Identifiant unique de l'écran
  title: string;                 // Titre principal
  subtitle: string;              // Sous-titre descriptif
  illustration: string;          // Nom de l'illustration
  animationType: AnimationType;  // Type d'animation
  interactionType?: InteractionType; // Type d'interaction
  duration: number;              // Durée de l'animation (ms)
}
```

### Exemple de configuration personnalisée

```typescript
// components/onboarding/customConfig.ts
import { OnboardingScreenConfig, OnboardingSettings } from './types';

export const CUSTOM_ONBOARDING_SCREENS: OnboardingScreenConfig[] = [
  {
    id: 'brand_intro',
    title: 'Bienvenue chez [Votre Marque]',
    subtitle: 'Découvrez une nouvelle façon de gérer vos finances',
    illustration: 'brand_logo',
    animationType: 'fadeIn',
    interactionType: 'tap',
    duration: 2500,
  },
  {
    id: 'security_first',
    title: 'Sécurité maximale',
    subtitle: 'Vos données sont protégées par un chiffrement de niveau bancaire',
    illustration: 'security_shield',
    animationType: 'slideUp',
    interactionType: 'tap',
    duration: 2000,
  },
  {
    id: 'easy_payments',
    title: 'Paiements simplifiés',
    subtitle: 'Payez en quelques secondes avec notre technologie avancée',
    illustration: 'payment_flow',
    animationType: 'scale',
    interactionType: 'swipe',
    duration: 1800,
  },
  {
    id: 'get_started',
    title: 'Prêt à commencer ?',
    subtitle: 'Créez votre compte et profitez de tous nos avantages',
    illustration: 'rocket_launch',
    animationType: 'custom',
    interactionType: 'tap',
    duration: 2200,
  },
];
```

## Types d'animations disponibles

### AnimationType

```typescript
type AnimationType = 'fadeIn' | 'slideUp' | 'scale' | 'custom';
```

#### fadeIn
- **Description :** Apparition en fondu
- **Durée recommandée :** 1500-2500ms
- **Utilisation :** Écrans d'introduction, messages importants

```typescript
{
  animationType: 'fadeIn',
  duration: 2000,
}
```

#### slideUp
- **Description :** Glissement depuis le bas
- **Durée recommandée :** 1000-2000ms
- **Utilisation :** Révélation de contenu, transitions dynamiques

```typescript
{
  animationType: 'slideUp',
  duration: 1500,
}
```

#### scale
- **Description :** Effet de zoom/échelle
- **Durée recommandée :** 1200-2000ms
- **Utilisation :** Mise en valeur d'éléments, effets d'impact

```typescript
{
  animationType: 'scale',
  duration: 1800,
}
```

#### custom
- **Description :** Animation personnalisée définie dans l'illustration
- **Durée recommandée :** Variable selon l'animation
- **Utilisation :** Animations complexes spécifiques

```typescript
{
  animationType: 'custom',
  duration: 2500, // Dépend de l'animation personnalisée
}
```

## Types d'interactions

### InteractionType

```typescript
type InteractionType = 'tap' | 'swipe' | 'none';
```

#### tap
- **Description :** Appui simple pour continuer
- **Utilisation :** Navigation standard, confirmations

```typescript
{
  interactionType: 'tap',
  interactionHint: 'Appuyez pour continuer',
}
```

#### swipe
- **Description :** Glissement horizontal pour naviguer
- **Utilisation :** Navigation fluide, exploration de contenu

```typescript
{
  interactionType: 'swipe',
  interactionHint: 'Glissez pour explorer',
}
```

#### none
- **Description :** Progression automatique
- **Utilisation :** Démonstrations, animations automatiques

```typescript
{
  interactionType: 'none',
  // Progression automatique après la durée spécifiée
}
```

## Configuration globale

### OnboardingSettings

```typescript
interface OnboardingSettings {
  screens: OnboardingScreenConfig[];
  theme: ThemeType;
  animationSpeed: AnimationSpeed;
  skipEnabled: boolean;
  progressIndicatorStyle: ProgressIndicatorStyle;
}
```

### Exemple de configuration complète

```typescript
export const CUSTOM_ONBOARDING_SETTINGS: OnboardingSettings = {
  screens: CUSTOM_ONBOARDING_SCREENS,
  theme: 'auto', // Suit les préférences système
  animationSpeed: 'normal',
  skipEnabled: true,
  progressIndicatorStyle: 'dots',
};
```

## Thèmes et apparence

### ThemeType

```typescript
type ThemeType = 'light' | 'dark' | 'auto';
```

#### Configuration des thèmes

```typescript
// Thème clair uniquement
{
  theme: 'light'
}

// Thème sombre uniquement
{
  theme: 'dark'
}

// Adaptation automatique selon les préférences système
{
  theme: 'auto'
}
```

### Personnalisation des couleurs par thème

```typescript
// components/onboarding/themeConfig.ts
export const ONBOARDING_THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#007AFF',
    secondary: '#8E8E93',
    progress: '#007AFF',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    accent: '#0A84FF',
    secondary: '#8E8E93',
    progress: '#0A84FF',
  },
};
```

## Vitesse d'animation

### AnimationSpeed

```typescript
type AnimationSpeed = 'slow' | 'normal' | 'fast';
```

#### Configuration des vitesses

```typescript
// Multiplicateurs de durée
const SPEED_MULTIPLIERS = {
  slow: 1.5,   // 50% plus lent
  normal: 1.0, // Vitesse normale
  fast: 0.7,   // 30% plus rapide
};

// Exemple d'utilisation
{
  animationSpeed: 'fast', // Toutes les animations seront 30% plus rapides
}
```

## Indicateurs de progression

### ProgressIndicatorStyle

```typescript
type ProgressIndicatorStyle = 'dots' | 'bar' | 'steps';
```

#### dots (par défaut)
- **Apparence :** Points circulaires
- **Utilisation :** Design minimaliste, peu d'écrans

```typescript
{
  progressIndicatorStyle: 'dots'
}
```

#### bar
- **Apparence :** Barre de progression linéaire
- **Utilisation :** Progression claire, nombreux écrans

```typescript
{
  progressIndicatorStyle: 'bar'
}
```

#### steps
- **Apparence :** Étapes numérotées
- **Utilisation :** Processus complexes, étapes importantes

```typescript
{
  progressIndicatorStyle: 'steps'
}
```

## Illustrations personnalisées

### Création d'illustrations

```typescript
// components/onboarding/illustrations/CustomIllustration.tsx
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { IllustrationProps } from '../types';

export default function CustomIllustration({ 
  animated = true, 
  theme, 
  onAnimationComplete 
}: IllustrationProps) {
  // Votre logique d'illustration personnalisée
  return (
    <Animated.View>
      {/* Votre contenu SVG ou composants */}
    </Animated.View>
  );
}
```

### Enregistrement des illustrations

```typescript
// components/onboarding/illustrationRegistry.ts
import CustomIllustration from './illustrations/CustomIllustration';

export const ILLUSTRATION_REGISTRY = {
  welcome: WelcomeIllustration,
  qr_payment: QRPaymentIllustration,
  wallet: WalletIllustration,
  offline: OfflineIllustration,
  // Vos illustrations personnalisées
  custom_brand: CustomIllustration,
  security_shield: SecurityIllustration,
  payment_flow: PaymentFlowIllustration,
  rocket_launch: RocketLaunchIllustration,
};
```

## Configuration de performance

### Adaptation selon l'appareil

```typescript
// components/onboarding/performanceConfig.ts
export const PERFORMANCE_CONFIGS = {
  // Appareils haut de gamme
  highEnd: {
    duration: 1.0,        // Multiplicateur normal
    complexity: 'full',   // Animations complètes
    particleCount: 150,   // Nombreuses particules
    enableBlur: true,     // Effets de flou activés
    enableShadows: true,  // Ombres activées
    frameRate: 60,        // 60 FPS cible
  },
  
  // Appareils milieu de gamme
  midRange: {
    duration: 1.0,
    complexity: 'medium',
    particleCount: 75,
    enableBlur: true,
    enableShadows: false, // Ombres désactivées
    frameRate: 60,
  },
  
  // Appareils bas de gamme
  lowEnd: {
    duration: 1.2,        // 20% plus lent pour éviter les saccades
    complexity: 'simple', // Animations simplifiées
    particleCount: 30,    // Peu de particules
    enableBlur: false,    // Pas d'effets gourmands
    enableShadows: false,
    frameRate: 30,        // 30 FPS cible
  },
};
```

### Seuils de détection automatique

```typescript
export const DEVICE_PERFORMANCE_THRESHOLDS = {
  // Critères pour déterminer la catégorie d'appareil
  lowEnd: {
    maxMemory: 2048,      // MB
    minCpuCores: 4,
    maxScreenDensity: 2,
  },
  midRange: {
    maxMemory: 4096,
    minCpuCores: 6,
    maxScreenDensity: 3,
  },
  // Au-dessus = highEnd
};
```

## Accessibilité

### Configuration des textes alternatifs

```typescript
// components/onboarding/accessibilityConfig.ts
export const ACCESSIBILITY_TEXTS = {
  // Descriptions des écrans pour les lecteurs d'écran
  screenDescriptions: {
    welcome: 'Écran de bienvenue présentant l\'application et ses avantages principaux.',
    security: 'Écran expliquant les mesures de sécurité et la protection des données.',
    payments: 'Écran démontrant les fonctionnalités de paiement et leur simplicité.',
    completion: 'Écran final invitant à créer un compte pour commencer.',
  },
  
  // Textes alternatifs pour les illustrations
  illustrationAltTexts: {
    welcome: 'Logo de l\'application avec animation de bienvenue.',
    security: 'Bouclier de sécurité avec icônes de protection.',
    payments: 'Interface de paiement avec codes QR et transactions.',
    completion: 'Fusée décollant symbolisant le début de l\'aventure.',
  },
  
  // Instructions d'interaction
  interactionInstructions: {
    tap: 'Appuyez deux fois pour continuer vers l\'écran suivant.',
    swipe: 'Glissez vers la gauche pour continuer ou vers la droite pour revenir.',
    auto: 'Progression automatique vers l\'écran suivant.',
  },
};
```

### Support des lecteurs d'écran

```typescript
// Configuration automatique des propriétés d'accessibilité
export const ACCESSIBILITY_PROPS = {
  container: {
    accessible: true,
    accessibilityRole: 'main',
    accessibilityLabel: 'Écran d\'introduction de l\'application',
  },
  
  title: {
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLevel: 1,
  },
  
  subtitle: {
    accessible: true,
    accessibilityRole: 'text',
  },
  
  illustration: {
    accessible: true,
    accessibilityRole: 'image',
    // accessibilityLabel défini dynamiquement
  },
  
  progressIndicator: {
    accessible: true,
    accessibilityRole: 'progressbar',
    // accessibilityValue défini dynamiquement
  },
};
```

## Validation de configuration

### Schéma de validation

```typescript
// components/onboarding/configValidator.ts
import { OnboardingScreenConfig, OnboardingSettings } from './types';

export function validateScreenConfig(config: OnboardingScreenConfig): boolean {
  const requiredFields = ['id', 'title', 'subtitle', 'illustration', 'animationType', 'duration'];
  
  // Vérifier les champs obligatoires
  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`Champ obligatoire manquant: ${field}`);
      return false;
    }
  }
  
  // Valider la durée
  if (config.duration < 500 || config.duration > 5000) {
    console.error(`Durée invalide: ${config.duration}ms (doit être entre 500 et 5000)`);
    return false;
  }
  
  // Valider le type d'animation
  const validAnimationTypes = ['fadeIn', 'slideUp', 'scale', 'custom'];
  if (!validAnimationTypes.includes(config.animationType)) {
    console.error(`Type d'animation invalide: ${config.animationType}`);
    return false;
  }
  
  return true;
}

export function validateOnboardingSettings(settings: OnboardingSettings): boolean {
  // Vérifier qu'il y a au moins un écran
  if (!settings.screens || settings.screens.length === 0) {
    console.error('Au moins un écran est requis');
    return false;
  }
  
  // Vérifier qu'il n'y a pas trop d'écrans
  if (settings.screens.length > 10) {
    console.error('Maximum 10 écrans autorisés');
    return false;
  }
  
  // Valider chaque écran
  for (const screen of settings.screens) {
    if (!validateScreenConfig(screen)) {
      return false;
    }
  }
  
  return true;
}
```

## Exemples de configurations complètes

### Configuration minimaliste (2 écrans)

```typescript
export const MINIMAL_ONBOARDING: OnboardingSettings = {
  screens: [
    {
      id: 'welcome',
      title: 'Bienvenue',
      subtitle: 'Découvrez notre application',
      illustration: 'welcome',
      animationType: 'fadeIn',
      interactionType: 'tap',
      duration: 2000,
    },
    {
      id: 'start',
      title: 'C\'est parti !',
      subtitle: 'Créez votre compte pour commencer',
      illustration: 'rocket',
      animationType: 'scale',
      interactionType: 'tap',
      duration: 1500,
    },
  ],
  theme: 'auto',
  animationSpeed: 'fast',
  skipEnabled: true,
  progressIndicatorStyle: 'dots',
};
```

### Configuration complète (5 écrans)

```typescript
export const COMPLETE_ONBOARDING: OnboardingSettings = {
  screens: [
    {
      id: 'brand_intro',
      title: 'Bienvenue chez FinanceApp',
      subtitle: 'La révolution de la finance mobile commence ici',
      illustration: 'brand_hero',
      animationType: 'fadeIn',
      interactionType: 'tap',
      duration: 3000,
    },
    {
      id: 'security',
      title: 'Sécurité de niveau bancaire',
      subtitle: 'Vos données sont protégées par un chiffrement AES-256',
      illustration: 'security_vault',
      animationType: 'slideUp',
      interactionType: 'tap',
      duration: 2500,
    },
    {
      id: 'features',
      title: 'Fonctionnalités avancées',
      subtitle: 'Paiements instantanés, gestion intelligente, analyses détaillées',
      illustration: 'feature_showcase',
      animationType: 'custom',
      interactionType: 'swipe',
      duration: 3500,
    },
    {
      id: 'benefits',
      title: 'Avantages exclusifs',
      subtitle: 'Cashback, récompenses et offres personnalisées',
      illustration: 'rewards_system',
      animationType: 'scale',
      interactionType: 'tap',
      duration: 2000,
    },
    {
      id: 'call_to_action',
      title: 'Rejoignez des millions d\'utilisateurs',
      subtitle: 'Créez votre compte gratuit en moins de 2 minutes',
      illustration: 'community_growth',
      animationType: 'fadeIn',
      interactionType: 'tap',
      duration: 2500,
    },
  ],
  theme: 'auto',
  animationSpeed: 'normal',
  skipEnabled: false, // Onboarding obligatoire
  progressIndicatorStyle: 'bar',
};
```

### Configuration pour appareils bas de gamme

```typescript
export const LOW_END_ONBOARDING: OnboardingSettings = {
  screens: [
    {
      id: 'simple_welcome',
      title: 'Bienvenue',
      subtitle: 'Application de paiement simple et rapide',
      illustration: 'simple_logo',
      animationType: 'fadeIn',
      interactionType: 'tap',
      duration: 1500, // Plus court
    },
    {
      id: 'simple_features',
      title: 'Fonctionnalités principales',
      subtitle: 'Payez et recevez de l\'argent facilement',
      illustration: 'simple_payment',
      animationType: 'fadeIn', // Animation simple
      interactionType: 'tap',
      duration: 1500,
    },
    {
      id: 'simple_start',
      title: 'Commencer',
      subtitle: 'Créez votre compte maintenant',
      illustration: 'simple_start',
      animationType: 'fadeIn',
      interactionType: 'tap',
      duration: 1000,
    },
  ],
  theme: 'auto',
  animationSpeed: 'fast', // Plus rapide pour compenser la simplicité
  skipEnabled: true,
  progressIndicatorStyle: 'dots',
};
```

## Bonnes pratiques

### Recommandations générales

1. **Nombre d'écrans :** 3-5 écrans maximum pour éviter la fatigue
2. **Durée totale :** Moins de 30 secondes pour l'ensemble
3. **Contenu :** Messages courts et impactants
4. **Interactions :** Cohérentes tout au long du parcours
5. **Accessibilité :** Toujours tester avec les lecteurs d'écran

### Optimisation des performances

1. **Illustrations :** Utiliser des SVG optimisés
2. **Animations :** Privilégier les transformations CSS
3. **Chargement :** Précharger les ressources critiques
4. **Mémoire :** Libérer les ressources non utilisées

### Tests de validation

```typescript
// Exemple de test de configuration
import { validateOnboardingSettings } from './configValidator';
import { CUSTOM_ONBOARDING_SETTINGS } from './customConfig';

describe('Configuration Onboarding', () => {
  test('Configuration personnalisée valide', () => {
    expect(validateOnboardingSettings(CUSTOM_ONBOARDING_SETTINGS)).toBe(true);
  });
  
  test('Durées d\'animation dans les limites', () => {
    CUSTOM_ONBOARDING_SETTINGS.screens.forEach(screen => {
      expect(screen.duration).toBeGreaterThanOrEqual(500);
      expect(screen.duration).toBeLessThanOrEqual(5000);
    });
  });
});
```