import { OnboardingConfigLoader, configLoader, loadOnboardingConfig } from '@/components/onboarding/configLoader';
import { DEFAULT_ONBOARDING_SETTINGS, ONBOARDING_SCREENS } from '@/components/onboarding/config';
import { OnboardingSettings } from '@/components/onboarding/types';
import * as validator from '@/components/onboarding/configValidator';

// Mock the validator
jest.mock('@/components/onboarding/configValidator', () => ({
  validateOnboardingConfig: jest.fn(),
}));

describe('OnboardingConfigLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the loader's cache
    configLoader.clearCache();
    // Mock the validator to return valid by default
    (validator.validateOnboardingConfig as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
  });

  describe('loadConfig', () => {
    it('devrait charger la configuration par défaut', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config).toEqual(DEFAULT_ONBOARDING_SETTINGS);
      expect(validator.validateOnboardingConfig).toHaveBeenCalledWith(DEFAULT_ONBOARDING_SETTINGS);
    });

    it('devrait fusionner la configuration personnalisée avec les valeurs par défaut', async () => {
      const customConfig = {
        theme: 'dark' as const,
        skipEnabled: false,
      };
      
      const config = await configLoader.loadConfig(customConfig);
      
      expect(config.theme).toBe('dark');
      expect(config.skipEnabled).toBe(false);
      expect(config.screens).toEqual(ONBOARDING_SCREENS);
      expect(config.animationSpeed).toBe('normal');
    });

    it('devrait utiliser la configuration en cache si disponible', async () => {
      // Premier appel pour mettre en cache
      await configLoader.loadConfig();
      
      // Réinitialiser le mock pour vérifier qu'il n'est pas appelé à nouveau
      (validator.validateOnboardingConfig as jest.Mock).mockClear();
      
      // Deuxième appel qui devrait utiliser le cache
      await configLoader.loadConfig();
      
      // Le validateur ne devrait pas être appelé une seconde fois
      expect(validator.validateOnboardingConfig).not.toHaveBeenCalled();
    });

    it('devrait retourner la configuration de fallback en cas d\'erreur de validation', async () => {
      // Simuler une erreur de validation
      (validator.validateOnboardingConfig as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Configuration invalide'],
      });
      
      // Espionner console.warn et console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      
      const config = await configLoader.loadConfig();
      
      // Vérifier que les erreurs sont loguées
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledWith('Utilisation de la configuration de fallback');
      
      // Vérifier que la configuration de fallback est retournée
      expect(config.screens.length).toBeLessThan(ONBOARDING_SCREENS.length);
      expect(config.skipEnabled).toBe(true);
      
      // Restaurer les fonctions de console
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });
  });

  describe('loadScreenConfig', () => {
    it('devrait charger la configuration d\'un écran spécifique', async () => {
      const screenId = 'welcome';
      const screenConfig = await configLoader.loadScreenConfig(screenId);
      
      expect(screenConfig).toEqual(ONBOARDING_SCREENS.find(s => s.id === screenId));
    });

    it('devrait retourner null si l\'écran n\'existe pas', async () => {
      const screenConfig = await configLoader.loadScreenConfig('nonexistent');
      expect(screenConfig).toBeNull();
    });

    it('devrait gérer les erreurs et retourner null', async () => {
      // Simuler une erreur lors du chargement de la configuration
      jest.spyOn(configLoader, 'loadConfig').mockRejectedValueOnce(new Error('Test error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const screenConfig = await configLoader.loadScreenConfig('welcome');
      
      expect(screenConfig).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('reloadConfig', () => {
    it('devrait recharger la configuration en invalidant le cache', async () => {
      // Premier chargement
      await configLoader.loadConfig();
      
      // Vérifier que le cache est utilisé
      expect(configLoader.hasCache()).toBe(true);
      
      // Réinitialiser le mock
      (validator.validateOnboardingConfig as jest.Mock).mockClear();
      
      // Recharger avec une nouvelle configuration
      const customConfig = { theme: 'light' as const };
      await configLoader.reloadConfig(customConfig);
      
      // Le validateur devrait être appelé à nouveau
      expect(validator.validateOnboardingConfig).toHaveBeenCalled();
      
      // Vérifier que la nouvelle configuration est utilisée
      const config = configLoader.getCachedConfig();
      expect(config?.theme).toBe('light');
    });
  });

  describe('Fonctions utilitaires', () => {
    it('loadOnboardingConfig devrait appeler configLoader.loadConfig', async () => {
      const spy = jest.spyOn(configLoader, 'loadConfig');
      
      await loadOnboardingConfig();
      
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });
});