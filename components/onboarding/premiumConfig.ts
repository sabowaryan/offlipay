import { 
  PremiumOnboardingConfig, 
  PremiumScreenConfig, 
  SlideConfig,
  TransitionConfig,
  GestureConfig,
  PerformanceConfig,
  AccessibilityConfig,
  ResponsiveConfig,
  Dimensions,
  DeviceCapability,
  AnimationLevel,
  GestureThresholds
} from '../../types';

// Configuration par défaut pour l'onboarding premium
export const defaultPremiumConfig: PremiumOnboardingConfig = {
  screens: [
    {
      id: 'welcome',
      title: 'Bienvenue',
      transitionType: 'fade',
      slides: [
        {
          id: 'welcome-intro',
          illustration: 'WelcomeIntro',
          title: 'Bienvenue dans OffliPay',
          subtitle: 'L\'avenir des paiements est arrivé',
          animationType: 'fadeIn',
          duration: 3000,
          interactionHint: 'Glissez vers le haut pour continuer'
        },
        {
          id: 'welcome-features',
          illustration: 'WelcomeFeatures',
          title: 'Fonctionnalités Avancées',
          subtitle: 'Paiements, portefeuille, et bien plus',
          animationType: 'scale',
          duration: 3500,
          interactionHint: 'Découvrez nos fonctionnalités'
        },
        {
          id: 'welcome-promise',
          illustration: 'WelcomePromise',
          title: 'Notre Promesse',
          subtitle: 'Sécurisé, simple, toujours disponible',
          animationType: 'morphing',
          duration: 4000,
          interactionHint: 'Glissez pour continuer'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Paiements QR',
      transitionType: 'slide',
      slides: [
        {
          id: 'qr-scan',
          illustration: 'QRScanDemo',
          title: 'Scanner un QR Code',
          subtitle: 'Paiements instantanés et sécurisés',
          animationType: 'parallax',
          duration: 3000,
          interactionHint: 'Pointez votre caméra vers un QR code'
        },
        {
          id: 'qr-generate',
          illustration: 'QRGenerateDemo',
          title: 'Générer un QR Code',
          subtitle: 'Recevez des paiements facilement',
          animationType: 'slideUp',
          duration: 3500,
          interactionHint: 'Créez votre QR code personnalisé'
        },
        {
          id: 'payment-success',
          illustration: 'PaymentSuccess',
          title: 'Paiement Réussi',
          subtitle: 'Transaction confirmée et sécurisée',
          animationType: 'scale',
          duration: 2500,
          interactionHint: 'Célébrez votre succès!'
        }
      ]
    },
    {
      id: 'wallet',
      title: 'Portefeuille',
      transitionType: 'cube',
      slides: [
        {
          id: 'wallet-overview',
          illustration: 'WalletOverview',
          title: 'Vue d\'ensemble',
          subtitle: 'Gérez votre argent intelligemment',
          animationType: 'fadeIn',
          duration: 3000,
          interactionHint: 'Explorez votre portefeuille'
        },
        {
          id: 'cash-in-methods',
          illustration: 'CashInMethods',
          title: 'Méthodes de Rechargement',
          subtitle: 'Agents, vouchers, virements bancaires',
          animationType: 'parallax',
          duration: 3500,
          interactionHint: 'Choisissez votre méthode préférée'
        },
        {
          id: 'transaction-history',
          illustration: 'TransactionHistory',
          title: 'Historique des Transactions',
          subtitle: 'Suivez tous vos paiements',
          animationType: 'morphing',
          duration: 3000,
          interactionHint: 'Consultez votre historique'
        }
      ]
    },
    {
      id: 'offline',
      title: 'Mode Hors Ligne',
      transitionType: 'flip',
      slides: [
        {
          id: 'offline-capability',
          illustration: 'OfflineCapability',
          title: 'Capacités Hors Ligne',
          subtitle: 'Payez même sans internet',
          animationType: 'slideUp',
          duration: 3000,
          interactionHint: 'Découvrez la liberté hors ligne'
        },
        {
          id: 'sync-process',
          illustration: 'SyncProcess',
          title: 'Synchronisation',
          subtitle: 'Vos données se synchronisent automatiquement',
          animationType: 'parallax',
          duration: 3500,
          interactionHint: 'Restez toujours à jour'
        },
        {
          id: 'security-features',
          illustration: 'SecurityFeatures',
          title: 'Sécurité Avancée',
          subtitle: 'Chiffrement et protection maximale',
          animationType: 'morphing',
          duration: 4000,
          interactionHint: 'Votre sécurité est notre priorité'
        }
      ]
    }
  ],
  transitions: {
    screenTransitionDuration: 800,
    slideTransitionDuration: 600,
    easing: 'easeInOut',
    parallaxIntensity: 0.3
  },
  gestures: {
    horizontalThreshold: 50,
    verticalThreshold: 30,
    velocityThreshold: 0.5,
    simultaneousGestures: false
  },
  performance: {
    deviceCapability: 'medium',
    animationLevel: 'standard',
    enableLazyLoading: true,
    maxConcurrentAnimations: 3,
    memoryThreshold: 100
  },
  accessibility: {
    reduceMotion: false,
    enableAudioDescriptions: false,
    alternativeNavigation: true,
    highContrast: false
  }
};

// Configuration responsive pour différentes tailles d'écran
export const responsiveConfig: ResponsiveConfig = {
  breakpoints: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 }
  },
  adaptations: {
    illustrationSize: (screenSize: Dimensions) => {
      const baseSize = Math.min(screenSize.width, screenSize.height) * 0.6;
      return Math.max(200, Math.min(400, baseSize));
    },
    animationComplexity: (deviceCapability: DeviceCapability): AnimationLevel => {
      switch (deviceCapability) {
        case 'low': return 'minimal';
        case 'medium': return 'standard';
        case 'high': return 'premium';
        default: return 'standard';
      }
    },
    gestureThresholds: (screenSize: Dimensions): GestureThresholds => {
      const scale = Math.min(screenSize.width, screenSize.height) / 375;
      return {
        horizontal: 50 * scale,
        vertical: 30 * scale,
        velocity: 0.5
      };
    }
  }
};

// Utilitaires pour la configuration premium
export class PremiumConfigManager {
  private config: PremiumOnboardingConfig;

  constructor(config: PremiumOnboardingConfig = defaultPremiumConfig) {
    this.config = config;
  }

  getConfig(): PremiumOnboardingConfig {
    return this.config;
  }

  updateConfig(updates: Partial<PremiumOnboardingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getScreenConfig(screenId: string): PremiumScreenConfig | undefined {
    return this.config.screens.find(screen => screen.id === screenId);
  }

  getSlideConfig(screenId: string, slideId: string): SlideConfig | undefined {
    const screen = this.getScreenConfig(screenId);
    return screen?.slides.find(slide => slide.id === slideId);
  }

  adaptToDevice(deviceCapability: DeviceCapability, screenSize: Dimensions): void {
    const adaptedConfig = {
      ...this.config,
      performance: {
        ...this.config.performance,
        deviceCapability,
        animationLevel: responsiveConfig.adaptations.animationComplexity(deviceCapability)
      },
      gestures: {
        ...this.config.gestures,
        ...responsiveConfig.adaptations.gestureThresholds(screenSize)
      }
    };
    this.config = adaptedConfig;
  }

  enableAccessibilityMode(options: Partial<AccessibilityConfig>): void {
    this.config.accessibility = { ...this.config.accessibility, ...options };
  }

  validateConfig(): boolean {
    // Validation basique de la configuration
    if (!this.config.screens || this.config.screens.length === 0) {
      return false;
    }

    for (const screen of this.config.screens) {
      if (!screen.slides || screen.slides.length === 0) {
        return false;
      }
    }

    return true;
  }
}

// Instance par défaut du gestionnaire de configuration
export const premiumConfigManager = new PremiumConfigManager();