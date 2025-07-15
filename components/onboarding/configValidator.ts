import { OnboardingScreenConfig, OnboardingSettings, OnboardingError, OnboardingErrorCode } from './types';
import { ONBOARDING_CONSTANTS } from './config';

/**
 * Interface pour le résultat de validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valide une configuration d'écran d'onboarding
 * @param screen Configuration de l'écran à valider
 * @returns Résultat de validation avec erreurs éventuelles
 */
export function validateScreenConfig(screen: OnboardingScreenConfig): ValidationResult {
  const errors: string[] = [];
  
  // Vérifier les champs obligatoires
  for (const field of ONBOARDING_CONSTANTS.REQUIRED_FIELDS) {
    if (!screen[field as keyof OnboardingScreenConfig]) {
      errors.push(`Le champ '${field}' est obligatoire pour l'écran ${screen.id || 'inconnu'}`);
    }
  }
  
  // Vérifier la durée
  if (screen.duration < ONBOARDING_CONSTANTS.MIN_DURATION || 
      screen.duration > ONBOARDING_CONSTANTS.MAX_DURATION) {
    errors.push(
      `La durée de l'écran ${screen.id} doit être entre ${ONBOARDING_CONSTANTS.MIN_DURATION} et ${ONBOARDING_CONSTANTS.MAX_DURATION} ms`
    );
  }
  
  // Vérifier les types d'animation valides
  const validAnimationTypes = ['fadeIn', 'slideUp', 'scale', 'custom'];
  if (!validAnimationTypes.includes(screen.animationType)) {
    errors.push(`Type d'animation '${screen.animationType}' non valide pour l'écran ${screen.id}`);
  }
  
  // Vérifier les types d'interaction valides
  if (screen.interactionType) {
    const validInteractionTypes = ['tap', 'swipe', 'none'];
    if (!validInteractionTypes.includes(screen.interactionType)) {
      errors.push(`Type d'interaction '${screen.interactionType}' non valide pour l'écran ${screen.id}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide une configuration complète d'onboarding
 * @param config Configuration d'onboarding à valider
 * @returns Résultat de validation avec erreurs éventuelles
 */
export function validateOnboardingConfig(config: OnboardingSettings): ValidationResult {
  const errors: string[] = [];
  
  // Vérifier le nombre d'écrans
  if (!config.screens || !Array.isArray(config.screens)) {
    errors.push('La configuration doit contenir un tableau d\'écrans');
    return { isValid: false, errors };
  }
  
  if (config.screens.length < ONBOARDING_CONSTANTS.MIN_SCREENS) {
    errors.push(`Au moins ${ONBOARDING_CONSTANTS.MIN_SCREENS} écran(s) requis`);
  }
  
  if (config.screens.length > ONBOARDING_CONSTANTS.MAX_SCREENS) {
    errors.push(`Maximum ${ONBOARDING_CONSTANTS.MAX_SCREENS} écrans autorisés`);
  }
  
  // Vérifier chaque écran individuellement
  config.screens.forEach((screen, index) => {
    const screenValidation = validateScreenConfig(screen);
    if (!screenValidation.isValid) {
      errors.push(`Écran #${index + 1} (${screen.id || 'inconnu'}): ${screenValidation.errors.join(', ')}`);
    }
  });
  
  // Vérifier les IDs uniques
  const ids = config.screens.map(screen => screen.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    errors.push('Tous les écrans doivent avoir un ID unique');
  }
  
  // Vérifier les paramètres globaux
  const validThemes = ['light', 'dark', 'auto'];
  if (!validThemes.includes(config.theme)) {
    errors.push(`Thème '${config.theme}' non valide`);
  }
  
  const validSpeeds = ['slow', 'normal', 'fast'];
  if (!validSpeeds.includes(config.animationSpeed)) {
    errors.push(`Vitesse d'animation '${config.animationSpeed}' non valide`);
  }
  
  const validStyles = ['dots', 'bar', 'steps'];
  if (!validStyles.includes(config.progressIndicatorStyle)) {
    errors.push(`Style d'indicateur de progression '${config.progressIndicatorStyle}' non valide`);
  }
  
  if (typeof config.skipEnabled !== 'boolean') {
    errors.push('Le paramètre skipEnabled doit être un booléen');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Fonction utilitaire pour valider rapidement une configuration
 * @param config Configuration à valider
 * @throws OnboardingError si la configuration est invalide
 */
export function validateAndThrow(config: OnboardingSettings): void {
  const result = validateOnboardingConfig(config);
  if (!result.isValid) {
    throw new Error(`Configuration invalide: ${result.errors.join(', ')}`);
  }
}