import { OnboardingScreenConfig } from '@/services/OnboardingService';
import { OnboardingSettings } from './types';

/**
 * Configuration des écrans d'onboarding avec contenu français
 * Basé sur les spécifications du document de conception
 */
export const ONBOARDING_SCREENS: OnboardingScreenConfig[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur OffliPay',
    subtitle: 'Votre portefeuille numérique pour des paiements simples et sécurisés, même hors ligne',
    illustration: 'welcome',
    animationType: 'fadeIn',
    interactionType: 'tap',
    duration: 2000,
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
    id: 'qr_payment',
    title: 'Payez en un scan',
    subtitle: 'Scannez ou générez des QR codes pour des transactions instantanées',
    illustration: 'qr_payment',
    animationType: 'slideUp',
    interactionType: 'tap',
    duration: 1500,
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
    title: 'Gérez votre argent',
    subtitle: 'Rechargez facilement via agents, vouchers ou virement bancaire',
    illustration: 'wallet',
    animationType: 'scale',
    interactionType: 'swipe',
    duration: 2000,
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
    title: 'Toujours connecté',
    subtitle: 'Effectuez des paiements même sans connexion internet',
    illustration: 'offline',
    animationType: 'custom',
    interactionType: 'tap',
    duration: 1800,
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
  },
];

/**
 * Configuration par défaut de l'onboarding
 */
export const DEFAULT_ONBOARDING_SETTINGS: OnboardingSettings = {
  screens: ONBOARDING_SCREENS,
  theme: 'auto',
  animationSpeed: 'normal',
  skipEnabled: true,
  progressIndicatorStyle: 'dots',
};

/**
 * Constantes pour la validation
 */
export const ONBOARDING_CONSTANTS = {
  MIN_SCREENS: 1,
  MAX_SCREENS: 10,
  MIN_DURATION: 500,
  MAX_DURATION: 5000,
  REQUIRED_FIELDS: ['id', 'title', 'subtitle', 'illustration', 'animationType', 'duration', 'slides'] as const,
} as const;

/**
 * Descriptions détaillées des écrans pour l'accessibilité
 */
export const SCREEN_DESCRIPTIONS = {
  welcome: 'Écran de bienvenue avec 3 slides présentant l\'application OffliPay, ses fonctionnalités et promesses.',
  qr_payment: 'Écran avec 3 slides présentant les fonctionnalités de paiement par QR code : scan, génération et confirmation.',
  wallet: 'Écran avec 3 slides présentant la gestion d\'argent : vue d\'ensemble, méthodes de rechargement et historique.',
  offline: 'Écran avec 3 slides présentant les capacités hors ligne : fonctionnement, synchronisation et sécurité.',
};

/**
 * Textes alternatifs pour les illustrations (accessibilité)
 */
export const ILLUSTRATION_ALT_TEXT = {
  // Welcome screen slides
  WelcomeIntro: 'Logo OffliPay avec animation d\'entrée et effets de particules.',
  WelcomeFeatures: 'Icônes des fonctionnalités principales avec animations interactives.',
  WelcomePromise: 'Illustration de la promesse de sécurité et simplicité d\'OffliPay.',

  // QR Payment screen slides
  QRScanDemo: 'Démonstration animée du scan d\'un code QR avec un téléphone.',
  QRGenerateDemo: 'Génération animée d\'un code QR personnalisé pour recevoir des paiements.',
  PaymentSuccess: 'Animation de confirmation de paiement réussi avec effets visuels.',

  // Wallet screen slides
  WalletOverview: 'Vue d\'ensemble du portefeuille avec solde et cartes flottantes.',
  CashInMethods: 'Illustration des différentes méthodes de rechargement disponibles.',
  TransactionHistory: 'Historique des transactions avec animations de défilement.',

  // Offline screen slides
  OfflineCapability: 'Illustration des capacités de paiement hors ligne.',
  SyncProcess: 'Processus de synchronisation automatique des données.',
  SecurityFeatures: 'Fonctionnalités de sécurité avancées et chiffrement.',
};

/**
 * Textes des boutons pour chaque écran
 */
export const BUTTON_TEXTS = {
  next: 'Suivant',
  previous: 'Précédent',
  skip: 'Ignorer',
  start: 'Commencer',
};

/**
 * Messages d'interaction pour chaque écran
 */
export const INTERACTION_HINTS = {
  tap: 'Appuyez pour continuer',
  swipe: 'Glissez pour continuer',
  final: 'Appuyez pour commencer',
};

/**
 * Configuration des animations par type d'appareil
 * Permet d'adapter les animations selon la puissance de l'appareil
 */
export const ANIMATION_CONFIGS = {
  highEnd: {
    duration: 1.0, // Multiplicateur de durée (1.0 = normal)
    complexity: 'full', // Niveau de complexité des animations
    particleCount: 100, // Nombre de particules pour les effets
    enableBlur: true, // Activer les effets de flou
  },
  midRange: {
    duration: 1.0,
    complexity: 'medium',
    particleCount: 50,
    enableBlur: true,
  },
  lowEnd: {
    duration: 1.2, // Plus lent pour éviter les saccades
    complexity: 'simple',
    particleCount: 20,
    enableBlur: false, // Désactiver les effets gourmands
  },
};