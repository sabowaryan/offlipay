# Document de Conception - Onboarding Élégant

## Vue d'ensemble

L'onboarding élégant d'OffliPay sera une expérience immersive en 4 écrans qui présente les fonctionnalités clés de l'application avec des animations fluides, des illustrations attrayantes et des interactions intuitives. La conception s'intègre parfaitement avec le système de design existant de l'application, utilisant les composants UI, les couleurs et la typographie déjà établis.

## Architecture

### Structure des Composants

```
components/onboarding/
├── OnboardingContainer.tsx      # Conteneur principal avec navigation
├── OnboardingScreen.tsx         # Écran individuel réutilisable
├── OnboardingProgress.tsx       # Indicateur de progression
├── OnboardingAnimation.tsx      # Composant d'animation Lottie/SVG
├── OnboardingButton.tsx         # Boutons d'action personnalisés
└── illustrations/               # Dossier des illustrations SVG
    ├── WelcomeIllustration.tsx
    ├── QRPaymentIllustration.tsx
    ├── WalletIllustration.tsx
    └── OfflineIllustration.tsx
```

### Flux de Navigation

```
Écran d'accueil → Onboarding (si première fois) → Authentification
                ↓
    [Écran 1: Bienvenue] → [Écran 2: Paiements QR] → [Écran 3: Portefeuille] → [Écran 4: Mode Hors Ligne] → Authentification
```

## Composants et Interfaces

### OnboardingContainer

**Responsabilités:**
- Gestion de l'état global de l'onboarding
- Navigation entre les écrans
- Sauvegarde de la progression
- Gestion des gestes de swipe

**Interface:**
```typescript
interface OnboardingContainerProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingState {
  currentScreen: number;
  totalScreens: number;
  isAnimating: boolean;
  hasSeenOnboarding: boolean;
}
```

### OnboardingScreen

**Responsabilités:**
- Affichage du contenu d'un écran individuel
- Gestion des animations d'entrée/sortie
- Support des interactions tactiles

**Interface:**
```typescript
interface OnboardingScreenProps {
  title: string;
  subtitle: string;
  illustration: React.ComponentType;
  animationDelay?: number;
  onInteraction?: () => void;
  interactionHint?: string;
}
```

### OnboardingProgress

**Responsabilités:**
- Affichage de l'indicateur de progression
- Animation des transitions entre étapes
- Support des thèmes clair/sombre

**Interface:**
```typescript
interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  animated?: boolean;
}
```

## Modèles de Données

### OnboardingConfig

```typescript
interface OnboardingScreenConfig {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  animationType: 'fadeIn' | 'slideUp' | 'scale' | 'custom';
  interactionType?: 'tap' | 'swipe' | 'none';
  duration: number;
}

interface OnboardingSettings {
  screens: OnboardingScreenConfig[];
  theme: 'light' | 'dark' | 'auto';
  animationSpeed: 'slow' | 'normal' | 'fast';
  skipEnabled: boolean;
  progressIndicatorStyle: 'dots' | 'bar' | 'steps';
}
```

### Contenu des Écrans

#### Écran 1: Bienvenue
- **Titre:** "Bienvenue sur OffliPay"
- **Sous-titre:** "Votre portefeuille numérique pour des paiements simples et sécurisés, même hors ligne"
- **Illustration:** Logo animé avec effet de particules
- **Animation:** Fade in avec scale effect sur le logo
- **Interaction:** Tap pour continuer

#### Écran 2: Paiements QR
- **Titre:** "Payez en un scan"
- **Sous-titre:** "Scannez ou générez des QR codes pour des transactions instantanées"
- **Illustration:** Animation de scan QR avec effet de reconnaissance
- **Animation:** QR code qui apparaît et se fait scanner
- **Interaction:** Tap sur le QR pour déclencher l'animation

#### Écran 3: Portefeuille Intelligent
- **Titre:** "Gérez votre argent"
- **Sous-titre:** "Rechargez facilement via agents, vouchers ou virement bancaire"
- **Illustration:** Interface de portefeuille avec transactions animées
- **Animation:** Compteur de solde qui s'incrémente, transactions qui apparaissent
- **Interaction:** Swipe sur les transactions pour les faire défiler

#### Écran 4: Mode Hors Ligne
- **Titre:** "Toujours connecté"
- **Sous-titre:** "Effectuez des paiements même sans connexion internet"
- **Illustration:** Icône de connexion qui passe de connecté à hors ligne
- **Animation:** Transition fluide entre les états de connexion
- **Interaction:** Toggle pour basculer entre les modes

## Gestion des Erreurs

### Stratégies de Récupération

1. **Échec de chargement des animations:**
   - Fallback vers des illustrations statiques
   - Message d'erreur discret
   - Possibilité de réessayer

2. **Erreur de sauvegarde des préférences:**
   - Utilisation du stockage local comme fallback
   - Notification utilisateur non intrusive
   - Continuation de l'onboarding

3. **Problèmes de performance:**
   - Réduction automatique de la complexité des animations
   - Mode dégradé avec animations simplifiées
   - Détection de la puissance de l'appareil

### Codes d'Erreur

```typescript
enum OnboardingErrorCode {
  ANIMATION_LOAD_FAILED = 'ANIM_001',
  STORAGE_SAVE_FAILED = 'STOR_001',
  PERFORMANCE_DEGRADED = 'PERF_001',
  NAVIGATION_ERROR = 'NAV_001',
}
```

## Stratégie de Test

### Tests Unitaires

1. **Composants individuels:**
   - Rendu correct selon les props
   - Gestion des états d'erreur
   - Accessibilité

2. **Logique de navigation:**
   - Progression entre écrans
   - Gestion du skip
   - Sauvegarde des préférences

3. **Animations:**
   - Déclenchement correct
   - Performance
   - Fallbacks

### Tests d'Intégration

1. **Flux complet d'onboarding:**
   - Navigation de bout en bout
   - Intégration avec l'authentification
   - Persistance des données

2. **Thèmes et accessibilité:**
   - Basculement entre thèmes
   - Support des lecteurs d'écran
   - Contrastes et tailles de police

### Tests de Performance

1. **Métriques clés:**
   - Temps de chargement initial < 2s
   - Fluidité des animations 60fps
   - Utilisation mémoire < 50MB

2. **Tests sur différents appareils:**
   - Appareils bas de gamme
   - Différentes tailles d'écran
   - Versions Android/iOS variées

## Spécifications Techniques

### Animations

**Bibliothèque:** React Native Reanimated 3
**Format des illustrations:** SVG avec animations CSS
**Durées standard:**
- Transition entre écrans: 300ms
- Animations d'illustration: 1000-2000ms
- Micro-interactions: 150ms

### Stockage

**Préférences utilisateur:** Expo SecureStore
**Cache des illustrations:** Système de fichiers local
**Données d'onboarding:** AsyncStorage pour les données non sensibles

### Accessibilité

**Standards:** WCAG 2.1 AA
**Support:**
- VoiceOver (iOS) et TalkBack (Android)
- Navigation au clavier
- Contrastes élevés
- Tailles de police dynamiques

### Performance

**Optimisations:**
- Lazy loading des illustrations
- Préchargement de l'écran suivant
- Réduction automatique des animations sur appareils lents
- Compression des assets

### Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablette: 768px - 1024px
- Desktop: > 1024px (pour la version web)

**Adaptations:**
- Tailles de police proportionnelles
- Espacement adaptatif
- Illustrations redimensionnées
- Navigation tactile optimisée