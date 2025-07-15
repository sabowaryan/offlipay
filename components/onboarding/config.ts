import { OnboardingScreenConfig, OnboardingSettings } from './types';

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
  },
  {
    id: 'qr_payment',
    title: 'Payez en un scan',
    subtitle: 'Scannez ou générez des QR codes pour des transactions instantanées',
    illustration: 'qr_payment',
    animationType: 'slideUp',
    interactionType: 'tap',
    duration: 1500,
  },
  {
    id: 'wallet',
    title: 'Gérez votre argent',
    subtitle: 'Rechargez facilement via agents, vouchers ou virement bancaire',
    illustration: 'wallet',
    animationType: 'scale',
    interactionType: 'swipe',
    duration: 2000,
  },
  {
    id: 'offline',
    title: 'Toujours connecté',
    subtitle: 'Effectuez des paiements même sans connexion internet',
    illustration: 'offline',
    animationType: 'custom',
    interactionType: 'tap',
    duration: 1800,
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
  REQUIRED_FIELDS: ['id', 'title', 'subtitle', 'illustration', 'animationType', 'duration'] as const,
} as const;

/**
 * Descriptions détaillées des écrans pour l'accessibilité
 */
export const SCREEN_DESCRIPTIONS = {
  welcome: 'Écran de bienvenue présentant l\'application OffliPay, un portefeuille numérique pour paiements sécurisés.',
  qr_payment: 'Écran présentant la fonctionnalité de paiement par QR code, permettant des transactions instantanées.',
  wallet: 'Écran présentant les fonctionnalités de gestion d\'argent et les différentes méthodes de rechargement.',
  offline: 'Écran présentant la fonctionnalité de paiement hors ligne, permettant des transactions sans connexion internet.',
};

/**
 * Textes alternatifs pour les illustrations (accessibilité)
 */
export const ILLUSTRATION_ALT_TEXT = {
  welcome: 'Illustration montrant le logo OffliPay avec des particules animées représentant la sécurité.',
  qr_payment: 'Illustration montrant un téléphone scannant un code QR pour effectuer un paiement.',
  wallet: 'Illustration montrant un portefeuille numérique avec des transactions et un compteur de solde.',
  offline: 'Illustration montrant un appareil fonctionnant en mode hors ligne avec synchronisation ultérieure.',
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