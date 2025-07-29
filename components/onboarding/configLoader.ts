import { OnboardingSettings, OnboardingError, OnboardingErrorCode } from './types';
import { OnboardingScreenConfig } from '@/services/OnboardingService';
import { DEFAULT_ONBOARDING_SETTINGS, ONBOARDING_SCREENS } from './config';
import { validateOnboardingConfig } from './configValidator';

/**
 * Service de chargement de configuration d'onboarding
 * Gère le chargement, la validation et les fallbacks de configuration
 */
export class OnboardingConfigLoader {
  private static instance: OnboardingConfigLoader;
  private cachedConfig: OnboardingSettings | null = null;

  private constructor() {}

  /**
   * Singleton pattern pour éviter les instances multiples
   */
  public static getInstance(): OnboardingConfigLoader {
    if (!OnboardingConfigLoader.instance) {
      OnboardingConfigLoader.instance = new OnboardingConfigLoader();
    }
    return OnboardingConfigLoader.instance;
  }

  /**
   * Charge la configuration d'onboarding avec validation
   * @param customConfig Configuration personnalisée optionnelle
   * @returns Configuration validée ou configuration par défaut
   */
  public async loadConfig(customConfig?: Partial<OnboardingSettings>): Promise<OnboardingSettings> {
    try {
      // Si une configuration est déjà en cache, la retourner
      if (this.cachedConfig && !customConfig) {
        return this.cachedConfig;
      }

      // Fusionner la configuration personnalisée avec la configuration par défaut
      const config: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        ...customConfig,
        screens: customConfig?.screens || ONBOARDING_SCREENS,
      };

      // Valider la configuration
      const validationResult = validateOnboardingConfig(config);
      if (!validationResult.isValid) {
        console.warn('Configuration d\'onboarding invalide:', validationResult.errors);
        throw new Error(`Configuration invalide: ${validationResult.errors.join(', ')}`);
      }

      // Mettre en cache la configuration validée
      this.cachedConfig = config;
      return config;

    } catch (error) {
      console.error('Erreur lors du chargement de la configuration d\'onboarding:', error);
      
      // Retourner la configuration par défaut en cas d'erreur
      return this.getFallbackConfig();
    }
  }

  /**
   * Charge une configuration spécifique pour un écran
   * @param screenId Identifiant de l'écran
   * @returns Configuration de l'écran ou null si non trouvé
   */
  public async loadScreenConfig(screenId: string): Promise<OnboardingScreenConfig | null> {
    try {
      const config = await this.loadConfig();
      return config.screens.find(screen => screen.id === screenId) || null;
    } catch (error) {
      console.error(`Erreur lors du chargement de l'écran ${screenId}:`, error);
      return null;
    }
  }

  /**
   * Recharge la configuration en invalidant le cache
   * @param customConfig Nouvelle configuration personnalisée
   */
  public async reloadConfig(customConfig?: Partial<OnboardingSettings>): Promise<OnboardingSettings> {
    this.cachedConfig = null;
    return this.loadConfig(customConfig);
  }

  /**
   * Retourne la configuration de fallback en cas d'erreur
   */
  private getFallbackConfig(): OnboardingSettings {
    console.info('Utilisation de la configuration de fallback');
    return {
      ...DEFAULT_ONBOARDING_SETTINGS,
      // Configuration simplifiée en cas d'erreur
      screens: ONBOARDING_SCREENS.slice(0, 2), // Seulement les 2 premiers écrans
      animationSpeed: 'normal',
      skipEnabled: true,
    };
  }

  /**
   * Vérifie si une configuration est en cache
   */
  public hasCache(): boolean {
    return this.cachedConfig !== null;
  }

  /**
   * Vide le cache de configuration
   */
  public clearCache(): void {
    this.cachedConfig = null;
  }

  /**
   * Retourne la configuration actuelle en cache
   */
  public getCachedConfig(): OnboardingSettings | null {
    return this.cachedConfig;
  }
}

/**
 * Instance singleton du loader de configuration
 */
export const configLoader = OnboardingConfigLoader.getInstance();

/**
 * Fonction utilitaire pour charger rapidement la configuration
 */
export const loadOnboardingConfig = (customConfig?: Partial<OnboardingSettings>) => {
  return configLoader.loadConfig(customConfig);
};

/**
 * Fonction utilitaire pour charger la configuration d'un écran spécifique
 */
export const loadScreenConfig = (screenId: string) => {
  return configLoader.loadScreenConfig(screenId);
};