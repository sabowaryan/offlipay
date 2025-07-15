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
    illustration: 'WelcomeIllustration',
    animationType: 'fadeIn',
    interactionType: 'tap',
    duration: 2000,
  },
  {
    id: 'qr-payments',
    title: 'Payez en un scan',
    subtitle: 'Scannez ou générez des QR codes pour des transactions instantanées',
    illustration: 'QRPaymentIllustration',
    animationType: 'slideUp',
    interactionType: 'tap',
    duration: 1500,
  },
  {
    id: 'wallet',
    title: 'Gérez votre argent',
    subtitle: 'Rechargez facilement via agents, vouchers ou virement bancaire',
    illustration: 'WalletIllustration',
    animationType: 'scale',
    interactionType: 'swipe',
    duration: 2000,
  },
  {
    id: 'offline-mode',
    title: 'Toujours connecté',
    subtitle: 'Effectuez des paiements même sans connexion internet',
    illustration: 'OfflineIllustration',
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