import { validateScreenConfig, validateOnboardingConfig } from '@/components/onboarding/configValidator';
import { OnboardingScreenConfig, OnboardingSettings } from '@/components/onboarding/types';
import { DEFAULT_ONBOARDING_SETTINGS, ONBOARDING_SCREENS } from '@/components/onboarding/config';

describe('Configuration Validator', () => {
  // Tests pour validateScreenConfig
  describe('validateScreenConfig', () => {
    it('devrait valider un écran correctement configuré', () => {
      const validScreen: OnboardingScreenConfig = {
        id: 'test-screen',
        title: 'Titre de test',
        subtitle: 'Sous-titre de test',
        illustration: 'welcome',
        animationType: 'fadeIn',
        interactionType: 'tap',
        duration: 2000,
      };
      
      const result = validateScreenConfig(validScreen);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('devrait détecter les champs obligatoires manquants', () => {
      const invalidScreen = {
        id: 'test-screen',
        title: 'Titre de test',
        // subtitle manquant
        illustration: 'welcome',
        animationType: 'fadeIn',
        duration: 2000,
      } as OnboardingScreenConfig;
      
      const result = validateScreenConfig(invalidScreen);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('subtitle');
    });
    
    it('devrait valider la durée minimale et maximale', () => {
      const tooShortScreen: OnboardingScreenConfig = {
        ...ONBOARDING_SCREENS[0],
        duration: 100, // Trop court
      };
      
      const tooLongScreen: OnboardingScreenConfig = {
        ...ONBOARDING_SCREENS[0],
        duration: 10000, // Trop long
      };
      
      const shortResult = validateScreenConfig(tooShortScreen);
      const longResult = validateScreenConfig(tooLongScreen);
      
      expect(shortResult.isValid).toBe(false);
      expect(shortResult.errors[0]).toContain('durée');
      
      expect(longResult.isValid).toBe(false);
      expect(longResult.errors[0]).toContain('durée');
    });
    
    it('devrait valider les types d\'animation', () => {
      const invalidAnimationScreen: OnboardingScreenConfig = {
        ...ONBOARDING_SCREENS[0],
        animationType: 'invalid' as any,
      };
      
      const result = validateScreenConfig(invalidAnimationScreen);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('animation');
    });
    
    it('devrait valider les types d\'interaction', () => {
      const invalidInteractionScreen: OnboardingScreenConfig = {
        ...ONBOARDING_SCREENS[0],
        interactionType: 'invalid' as any,
      };
      
      const result = validateScreenConfig(invalidInteractionScreen);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('interaction');
    });
  });
  
  // Tests pour validateOnboardingConfig
  describe('validateOnboardingConfig', () => {
    it('devrait valider une configuration complète valide', () => {
      const result = validateOnboardingConfig(DEFAULT_ONBOARDING_SETTINGS);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('devrait détecter un tableau d\'écrans manquant', () => {
      const invalidConfig = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        screens: undefined as any,
      };
      
      const result = validateOnboardingConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('tableau d\'écrans');
    });
    
    it('devrait détecter des IDs d\'écrans en double', () => {
      const duplicateIdConfig: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        screens: [
          ONBOARDING_SCREENS[0],
          { ...ONBOARDING_SCREENS[1], id: ONBOARDING_SCREENS[0].id }, // ID en double
          ONBOARDING_SCREENS[2],
        ],
      };
      
      const result = validateOnboardingConfig(duplicateIdConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('ID unique');
    });
    
    it('devrait valider les paramètres globaux', () => {
      const invalidThemeConfig: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        theme: 'invalid' as any,
      };
      
      const invalidSpeedConfig: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        animationSpeed: 'invalid' as any,
      };
      
      const invalidStyleConfig: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        progressIndicatorStyle: 'invalid' as any,
      };
      
      const themeResult = validateOnboardingConfig(invalidThemeConfig);
      const speedResult = validateOnboardingConfig(invalidSpeedConfig);
      const styleResult = validateOnboardingConfig(invalidStyleConfig);
      
      expect(themeResult.isValid).toBe(false);
      expect(themeResult.errors[0]).toContain('Thème');
      
      expect(speedResult.isValid).toBe(false);
      expect(speedResult.errors[0]).toContain('Vitesse');
      
      expect(styleResult.isValid).toBe(false);
      expect(styleResult.errors[0]).toContain('Style');
    });
    
    it('devrait valider le nombre minimum et maximum d\'écrans', () => {
      const tooFewScreensConfig: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        screens: [],
      };
      
      const tooManyScreensConfig: OnboardingSettings = {
        ...DEFAULT_ONBOARDING_SETTINGS,
        screens: Array(15).fill(ONBOARDING_SCREENS[0]).map((screen, i) => ({
          ...screen,
          id: `screen-${i}`,
        })),
      };
      
      const fewResult = validateOnboardingConfig(tooFewScreensConfig);
      const manyResult = validateOnboardingConfig(tooManyScreensConfig);
      
      expect(fewResult.isValid).toBe(false);
      expect(fewResult.errors[0]).toContain('écran(s) requis');
      
      expect(manyResult.isValid).toBe(false);
      expect(manyResult.errors[0]).toContain('Maximum');
    });
  });
});