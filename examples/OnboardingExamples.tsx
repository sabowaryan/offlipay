/**
 * Exemples d'usage et de personnalisation de l'onboarding OffliPay
 * 
 * Ce fichier contient des exemples pratiques d'intégration et de personnalisation
 * du système d'onboarding élégant.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Analytics from 'expo-analytics';

import { OnboardingContainer } from '@/components/onboarding';
import { OnboardingService } from '@/services/OnboardingService';
import { OnboardingSettings, OnboardingScreenConfig } from '@/components/onboarding/types';
import { useThemeColors } from '@/hooks/useThemeColors';

// ============================================================================
// EXEMPLE 1: Intégration basique
// ============================================================================

/**
 * Exemple d'intégration simple de l'onboarding
 * Utilise la configuration par défaut
 */
export function BasicOnboardingExample() {
  const navigation = useNavigation();

  const handleOnboardingComplete = useCallback(() => {
    // Redirection vers l'écran principal après completion
    navigation.navigate('Home' as never);
  }, [navigation]);

  const handleOnboardingSkip = useCallback(() => {
    // Redirection vers l'authentification si skip
    navigation.navigate('Auth' as never);
  }, [navigation]);

  return (
    <OnboardingContainer
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
    />
  );
}

// ============================================================================
// EXEMPLE 2: Onboarding conditionnel avec vérification
// ============================================================================

/**
 * Exemple d'onboarding conditionnel qui vérifie si l'utilisateur
 * a déjà vu l'onboarding avant de l'afficher
 */
export function ConditionalOnboardingExample() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await OnboardingService.hasCompletedOnboarding();
      const preferences = await OnboardingService.getPreferences();
      
      // Afficher l'onboarding si pas complété ou si l'utilisateur veut le revoir
      setShowOnboarding(!hasCompleted || preferences.lastCompletedStep < 4);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'onboarding:', error);
      // En cas d'erreur, afficher l'onboarding par sécurité
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = useCallback(async () => {
    try {
      await OnboardingService.markAsCompleted();
      setShowOnboarding(false);
      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Continuer même en cas d'erreur de sauvegarde
      navigation.navigate('Home' as never);
    }
  }, [navigation]);

  const handleSkip = useCallback(() => {
    setShowOnboarding(false);
    navigation.navigate('Auth' as never);
  }, [navigation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!showOnboarding) {
    return <MainAppScreen />;
  }

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}

// ============================================================================
// EXEMPLE 3: Onboarding avec analytics et tracking
// ============================================================================

/**
 * Exemple d'onboarding avec intégration d'analytics
 * pour suivre l'engagement et les conversions
 */
export function AnalyticsOnboardingExample() {
  const navigation = useNavigation();
  const [startTime] = useState<Date>(new Date());

  useEffect(() => {
    // Tracker le début de l'onboarding
    Analytics.track('onboarding_started', {
      timestamp: startTime.toISOString(),
      platform: Platform.OS,
      screen_size: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
    });
  }, [startTime]);

  const handleComplete = useCallback(async () => {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Tracker la completion
    await Analytics.track('onboarding_completed', {
      duration_ms: duration,
      completion_rate: 100,
      timestamp: endTime.toISOString(),
    });

    // Marquer comme complété
    await OnboardingService.markAsCompleted();
    
    navigation.navigate('Home' as never);
  }, [navigation, startTime]);

  const handleSkip = useCallback(async () => {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Tracker le skip
    await Analytics.track('onboarding_skipped', {
      duration_ms: duration,
      skip_point: 'user_initiated',
      timestamp: endTime.toISOString(),
    });

    navigation.navigate('Auth' as never);
  }, [navigation, startTime]);

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}

// ============================================================================
// EXEMPLE 4: Configuration personnalisée pour une marque
// ============================================================================

/**
 * Configuration personnalisée pour une application de marque
 * avec écrans et contenu spécifiques
 */
const BRAND_ONBOARDING_SCREENS: OnboardingScreenConfig[] = [
  {
    id: 'brand_welcome',
    title: 'Bienvenue chez MoneyFlow',
    subtitle: 'L\'application qui révolutionne vos finances personnelles',
    illustration: 'brand_hero',
    animationType: 'fadeIn',
    interactionType: 'tap',
    duration: 2500,
  },
  {
    id: 'ai_powered',
    title: 'Intelligence Artificielle',
    subtitle: 'Notre IA analyse vos habitudes pour vous faire économiser',
    illustration: 'ai_brain',
    animationType: 'slideUp',
    interactionType: 'tap',
    duration: 2000,
  },
  {
    id: 'social_payments',
    title: 'Paiements sociaux',
    subtitle: 'Partagez les frais avec vos amis en un clic',
    illustration: 'social_network',
    animationType: 'scale',
    interactionType: 'swipe',
    duration: 1800,
  },
  {
    id: 'premium_benefits',
    title: 'Avantages Premium',
    subtitle: 'Débloquez des fonctionnalités exclusives et des récompenses',
    illustration: 'premium_crown',
    animationType: 'custom',
    interactionType: 'tap',
    duration: 2200,
  },
];

const BRAND_ONBOARDING_SETTINGS: OnboardingSettings = {
  screens: BRAND_ONBOARDING_SCREENS,
  theme: 'dark', // Thème sombre pour cette marque
  animationSpeed: 'normal',
  skipEnabled: false, // Onboarding obligatoire
  progressIndicatorStyle: 'bar',
};

export function BrandOnboardingExample() {
  const navigation = useNavigation();

  const handleComplete = useCallback(async () => {
    // Logique spécifique à la marque
    await Analytics.track('brand_onboarding_completed');
    await OnboardingService.markAsCompleted();
    
    // Redirection vers l'écran de création de compte premium
    navigation.navigate('PremiumSignup' as never);
  }, [navigation]);

  const handleSkip = useCallback(() => {
    // Pas de skip pour cette marque, mais on peut gérer le cas
    Alert.alert(
      'Découverte recommandée',
      'Nous recommandons de découvrir toutes les fonctionnalités avant de commencer.',
      [
        { text: 'Continuer la découverte', style: 'default' },
        { 
          text: 'Passer quand même', 
          style: 'destructive',
          onPress: () => navigation.navigate('Auth' as never)
        },
      ]
    );
  }, [navigation]);

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={handleSkip}
      // La configuration personnalisée est appliquée via le système de config
    />
  );
}

// ============================================================================
// EXEMPLE 5: Onboarding adaptatif selon le type d'utilisateur
// ============================================================================

interface UserProfile {
  type: 'personal' | 'business' | 'premium';
  experience: 'beginner' | 'intermediate' | 'expert';
  preferences: {
    skipAnimations: boolean;
    preferredLanguage: string;
  };
}

/**
 * Exemple d'onboarding qui s'adapte selon le profil utilisateur
 */
export function AdaptiveOnboardingExample({ userProfile }: { userProfile: UserProfile }) {
  const navigation = useNavigation();

  // Configuration adaptée selon le profil
  const getAdaptedSettings = useCallback((): OnboardingSettings => {
    const baseScreens = [...BRAND_ONBOARDING_SCREENS];
    
    // Adapter selon le type d'utilisateur
    if (userProfile.type === 'business') {
      baseScreens.push({
        id: 'business_features',
        title: 'Fonctionnalités Business',
        subtitle: 'Gestion d\'équipe, facturation et comptabilité intégrées',
        illustration: 'business_tools',
        animationType: 'slideUp',
        interactionType: 'tap',
        duration: 2000,
      });
    }

    // Adapter selon l'expérience
    const animationSpeed = userProfile.experience === 'expert' ? 'fast' : 'normal';
    const skipEnabled = userProfile.experience !== 'beginner';

    return {
      screens: baseScreens,
      theme: 'auto',
      animationSpeed,
      skipEnabled,
      progressIndicatorStyle: userProfile.type === 'business' ? 'steps' : 'dots',
    };
  }, [userProfile]);

  const handleComplete = useCallback(async () => {
    await Analytics.track('adaptive_onboarding_completed', {
      user_type: userProfile.type,
      user_experience: userProfile.experience,
    });

    await OnboardingService.markAsCompleted();
    
    // Redirection adaptée selon le type d'utilisateur
    const destination = userProfile.type === 'business' ? 'BusinessDashboard' : 'Home';
    navigation.navigate(destination as never);
  }, [navigation, userProfile]);

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={() => navigation.navigate('Auth' as never)}
    />
  );
}

// ============================================================================
// EXEMPLE 6: Onboarding avec gestion d'erreurs avancée
// ============================================================================

/**
 * Exemple d'onboarding avec gestion complète des erreurs
 * et mécanismes de récupération
 */
export function RobustOnboardingExample() {
  const navigation = useNavigation();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const handleComplete = useCallback(async () => {
    try {
      await OnboardingService.markAsCompleted();
      navigation.navigate('Home' as never);
    } catch (saveError) {
      console.error('Erreur de sauvegarde:', saveError);
      
      if (retryCount < 3) {
        // Tentative de retry automatique
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleComplete(), 1000);
      } else {
        // Fallback: continuer sans sauvegarder
        Alert.alert(
          'Problème de sauvegarde',
          'Nous n\'avons pas pu sauvegarder vos préférences, mais vous pouvez continuer.',
          [
            { 
              text: 'Continuer quand même',
              onPress: () => navigation.navigate('Home' as never)
            },
            {
              text: 'Réessayer',
              onPress: () => {
                setRetryCount(0);
                handleComplete();
              }
            }
          ]
        );
      }
    }
  }, [navigation, retryCount]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    Analytics.track('onboarding_error', {
      error_message: errorMessage,
      retry_count: retryCount,
    });
  }, [retryCount]);

  if (error) {
    return (
      <ErrorRecoveryScreen 
        error={error}
        onRetry={() => {
          setError(null);
          setRetryCount(0);
        }}
        onSkip={() => navigation.navigate('Auth' as never)}
      />
    );
  }

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={() => navigation.navigate('Auth' as never)}
      onError={handleError}
    />
  );
}

// ============================================================================
// EXEMPLE 7: Onboarding avec préchargement des ressources
// ============================================================================

/**
 * Exemple d'onboarding avec préchargement intelligent des ressources
 * pour optimiser les performances
 */
export function OptimizedOnboardingExample() {
  const navigation = useNavigation();
  const [resourcesLoaded, setResourcesLoaded] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  useEffect(() => {
    preloadResources();
  }, []);

  const preloadResources = async () => {
    try {
      // Simuler le préchargement des illustrations et animations
      const resources = [
        'welcome_illustration',
        'qr_payment_animation',
        'wallet_illustration',
        'offline_animation',
      ];

      for (let i = 0; i < resources.length; i++) {
        // Simuler le chargement de chaque ressource
        await new Promise(resolve => setTimeout(resolve, 200));
        setLoadingProgress((i + 1) / resources.length * 100);
      }

      setResourcesLoaded(true);
    } catch (error) {
      console.error('Erreur de préchargement:', error);
      // Continuer même si le préchargement échoue
      setResourcesLoaded(true);
    }
  };

  if (!resourcesLoaded) {
    return (
      <PreloadingScreen 
        progress={loadingProgress}
        message="Préparation de votre expérience..."
      />
    );
  }

  return (
    <OnboardingContainer
      onComplete={() => navigation.navigate('Home' as never)}
      onSkip={() => navigation.navigate('Auth' as never)}
    />
  );
}

// ============================================================================
// EXEMPLE 8: Onboarding avec A/B testing
// ============================================================================

/**
 * Exemple d'onboarding avec support pour les tests A/B
 */
export function ABTestOnboardingExample() {
  const navigation = useNavigation();
  const [variant, setVariant] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    determineVariant();
  }, []);

  const determineVariant = async () => {
    try {
      // Récupérer la variante depuis un service d'A/B testing
      const userVariant = await ABTestingService.getVariant('onboarding_flow');
      setVariant(userVariant as 'A' | 'B');
      
      // Tracker l'assignation de variante
      Analytics.track('ab_test_assigned', {
        test_name: 'onboarding_flow',
        variant: userVariant,
      });
    } catch (error) {
      console.error('Erreur A/B testing:', error);
      setVariant('A'); // Fallback sur la variante A
    }
  };

  const handleComplete = useCallback(async () => {
    // Tracker la conversion selon la variante
    await Analytics.track('onboarding_completed_ab', {
      variant,
      test_name: 'onboarding_flow',
    });

    await OnboardingService.markAsCompleted();
    navigation.navigate('Home' as never);
  }, [navigation, variant]);

  if (!variant) {
    return <LoadingScreen />;
  }

  // Utiliser une configuration différente selon la variante
  const settings = variant === 'A' ? VARIANT_A_SETTINGS : VARIANT_B_SETTINGS;

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={() => navigation.navigate('Auth' as never)}
      // Configuration appliquée selon la variante
    />
  );
}

// ============================================================================
// COMPOSANTS UTILITAIRES
// ============================================================================

function LoadingScreen() {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      {/* Composant de loading personnalisé */}
    </View>
  );
}

function MainAppScreen() {
  return (
    <View style={styles.centerContainer}>
      {/* Écran principal de l'application */}
    </View>
  );
}

function ErrorRecoveryScreen({ 
  error, 
  onRetry, 
  onSkip 
}: { 
  error: string; 
  onRetry: () => void; 
  onSkip: () => void; 
}) {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      {/* Interface de récupération d'erreur */}
    </View>
  );
}

function PreloadingScreen({ 
  progress, 
  message 
}: { 
  progress: number; 
  message: string; 
}) {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      {/* Interface de préchargement avec barre de progression */}
    </View>
  );
}

// ============================================================================
// CONFIGURATIONS DE VARIANTES A/B
// ============================================================================

const VARIANT_A_SETTINGS: OnboardingSettings = {
  screens: BRAND_ONBOARDING_SCREENS.slice(0, 3), // Version courte
  theme: 'auto',
  animationSpeed: 'fast',
  skipEnabled: true,
  progressIndicatorStyle: 'dots',
};

const VARIANT_B_SETTINGS: OnboardingSettings = {
  screens: BRAND_ONBOARDING_SCREENS, // Version complète
  theme: 'auto',
  animationSpeed: 'normal',
  skipEnabled: false,
  progressIndicatorStyle: 'bar',
};

// ============================================================================
// SERVICES MOCK (à remplacer par vos vrais services)
// ============================================================================

class ABTestingService {
  static async getVariant(testName: string): Promise<string> {
    // Mock implementation
    return Math.random() > 0.5 ? 'A' : 'B';
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  BasicOnboardingExample,
  ConditionalOnboardingExample,
  AnalyticsOnboardingExample,
  BrandOnboardingExample,
  AdaptiveOnboardingExample,
  RobustOnboardingExample,
  OptimizedOnboardingExample,
  ABTestOnboardingExample,
};