import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '@/utils/secureStorage/';
import { OnboardingScreenConfig, OnboardingSlideConfig } from '@/components/onboarding/types';

export interface OnboardingSettings {
    screens: OnboardingScreenConfig[];
    theme: 'light' | 'dark' | 'auto';
    animationSpeed: 'slow' | 'normal' | 'fast';
    skipEnabled: boolean;
    progressIndicatorStyle: 'dots' | 'bar' | 'steps';
}

export interface OnboardingState {
    hasSeenOnboarding: boolean;
    currentScreen: number;
    totalScreens: number;
    completedAt?: Date;
    skippedAt?: Date;
    version: string;
    currentSlide?: number; // Added for premium onboarding
}

export interface OnboardingPreferences {
    theme: 'light' | 'dark' | 'auto';
    animationSpeed: 'slow' | 'normal' | 'fast';
    skipEnabled: boolean;
    progressIndicatorStyle: 'dots' | 'bar' | 'steps';
}

// Codes d'erreur pour l'onboarding
export enum OnboardingErrorCode {
    STORAGE_SAVE_FAILED = 'STOR_001',
    STORAGE_LOAD_FAILED = 'STOR_002',
    INVALID_DATA = 'DATA_001',
    SECURE_STORAGE_FAILED = 'SEC_001',
}

export class OnboardingError extends Error {
    constructor(
        public code: OnboardingErrorCode,
        message: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'OnboardingError';
    }
}

export class OnboardingService {
    static hasCompletedOnboarding() {
      throw new Error('Method not implemented.');
    }
    private static readonly ONBOARDING_STATE_KEY = 'onboarding_state';
    private static readonly ONBOARDING_PREFERENCES_KEY = 'onboarding_preferences';
    private static readonly ONBOARDING_VERSION = '1.0.0';

    // Configuration par défaut des écrans d'onboarding
    private static readonly DEFAULT_SCREENS: OnboardingScreenConfig[] = [
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
                    id: 'welcome_1',
                    title: 'Bienvenue sur OffliPay',
                    subtitle: 'Votre portefeuille numérique pour des paiements simples et sécurisés',
                    animationType: 'fadeIn',
                    illustration: 'WelcomeIntro',
                    duration: 2000
                },
                {
                    id: 'welcome_2',
                    title: 'Paiements hors ligne',
                    subtitle: 'Effectuez des transactions même sans connexion internet',
                    animationType: 'slideUp',
                    illustration: 'WelcomeFeatures',
                    duration: 2000
                }
            ]
        },
        {
            id: 'qr_payments',
            title: 'Payez en un scan',
            subtitle: 'Scannez ou générez des QR codes pour des transactions instantanées',
            illustration: 'qr_payment',
            animationType: 'slideUp',
            interactionType: 'tap',
            duration: 2500,
            slides: [
                {
                    id: 'qr_1',
                    title: 'Payez en un scan',
                    subtitle: 'Scannez des QR codes pour payer instantanément',
                    animationType: 'slideUp',
                    illustration: 'QRScanDemo',
                    duration: 2500
                },
                {
                    id: 'qr_2',
                    title: 'Générez vos QR codes',
                    subtitle: 'Créez des QR codes pour recevoir des paiements',
                    animationType: 'scale',
                    illustration: 'QRGenerateDemo',
                    duration: 2500
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
            duration: 3000,
            slides: [
                {
                    id: 'wallet_1',
                    title: 'Gérez votre argent',
                    subtitle: 'Suivez votre solde et vos transactions en temps réel',
                    animationType: 'scale',
                    illustration: 'WalletOverview',
                    duration: 3000
                },
                {
                    id: 'wallet_2',
                    title: 'Rechargez facilement',
                    subtitle: 'Via agents, vouchers ou virement bancaire',
                    animationType: 'fadeIn',
                    illustration: 'CashInMethods',
                    duration: 3000
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
            duration: 2500,
            slides: [
                {
                    id: 'offline_1',
                    title: 'Toujours connecté',
                    subtitle: 'Vos paiements fonctionnent même hors ligne',
                    animationType: 'custom',
                    illustration: 'OfflineCapability',
                    duration: 2500
                },
                {
                    id: 'offline_2',
                    title: 'Synchronisation automatique',
                    subtitle: 'Vos données se synchronisent dès que vous êtes en ligne',
                    animationType: 'slideUp',
                    illustration: 'SyncProcess',
                    duration: 2500
                }
            ]
        },
    ];

    // Préférences par défaut
    private static readonly DEFAULT_PREFERENCES: OnboardingPreferences = {
        theme: 'auto',
        animationSpeed: 'normal',
        skipEnabled: true,
        progressIndicatorStyle: 'dots',
    };

    /**
     * Vérifie si l'utilisateur a déjà vu l'onboarding
     */
    static async hasSeenOnboarding(): Promise<boolean> {
        try {
            const state = await this.getOnboardingState();
            return state.hasSeenOnboarding;
        } catch (error) {
            console.warn('Erreur lors de la vérification de l\'onboarding:', error);
            return false; // Fallback: considérer que l'onboarding n'a pas été vu
        }
    }

    /**
     * Marque l'onboarding comme terminé
     */
    static async markOnboardingCompleted(): Promise<void> {
        try {
            const currentState = await this.getOnboardingState();
            const newState: OnboardingState = {
                ...currentState,
                hasSeenOnboarding: true,
                completedAt: new Date(),
                version: this.ONBOARDING_VERSION,
            };

            await this.saveOnboardingState(newState);
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Impossible de marquer l\'onboarding comme terminé',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Marque l'onboarding comme ignoré
     */
    static async markOnboardingSkipped(): Promise<void> {
        try {
            const currentState = await this.getOnboardingState();
            const newState: OnboardingState = {
                ...currentState,
                hasSeenOnboarding: true,
                skippedAt: new Date(),
                version: this.ONBOARDING_VERSION,
            };

            await this.saveOnboardingState(newState);
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Impossible de marquer l\'onboarding comme ignoré',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Sauvegarde la progression actuelle de l'onboarding
     */
    static async saveProgress(currentScreen: number, currentSlide: number = 0): Promise<void> {
        try {
            const currentState = await this.getOnboardingState();
            const newState: OnboardingState = {
                ...currentState,
                currentScreen,
                currentSlide,
                version: this.ONBOARDING_VERSION,
            };

            await this.saveOnboardingState(newState);
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Impossible de sauvegarder la progression',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Récupère l'état actuel de l'onboarding
     */
    static async getOnboardingState(): Promise<OnboardingState> {
        try {
            const stateJson = await AsyncStorage.getItem(this.ONBOARDING_STATE_KEY);

            if (!stateJson) {
                return this.getDefaultState();
            }

            const state = JSON.parse(stateJson) as OnboardingState;

            // Vérifier la version et réinitialiser si nécessaire
            if (state.version !== this.ONBOARDING_VERSION) {
                return this.getDefaultState();
            }

            return state;
        } catch (error) {
            console.warn('Erreur lors du chargement de l\'état d\'onboarding:', error);
            return this.getDefaultState(); // Fallback vers l'état par défaut
        }
    }

    /**
     * Sauvegarde les préférences utilisateur pour l'onboarding
     */
    static async savePreferences(preferences: Partial<OnboardingPreferences>): Promise<void> {
        try {
            const currentPreferences = await this.getPreferences();
            const newPreferences = { ...currentPreferences, ...preferences };

            await AsyncStorage.setItem(
                this.ONBOARDING_PREFERENCES_KEY,
                JSON.stringify(newPreferences)
            );
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Impossible de sauvegarder les préférences',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Récupère les préférences utilisateur pour l'onboarding
     */
    static async getPreferences(): Promise<OnboardingPreferences> {
        try {
            const preferencesJson = await AsyncStorage.getItem(this.ONBOARDING_PREFERENCES_KEY);

            if (!preferencesJson) {
                return this.DEFAULT_PREFERENCES;
            }

            const preferences = JSON.parse(preferencesJson) as OnboardingPreferences;
            return { ...this.DEFAULT_PREFERENCES, ...preferences };
        } catch (error) {
            console.warn('Erreur lors du chargement des préférences:', error);
            return this.DEFAULT_PREFERENCES; // Fallback vers les préférences par défaut
        }
    }

    /**
     * Récupère la configuration des écrans d'onboarding
     */
    static async getScreensConfig(): Promise<OnboardingScreenConfig[]> {
        try {
            // Pour l'instant, on retourne la configuration par défaut
            // Dans le futur, on pourrait charger depuis un serveur ou un fichier de config
            return this.DEFAULT_SCREENS;
        } catch (error) {
            console.warn('Erreur lors du chargement de la configuration des écrans:', error);
            return this.DEFAULT_SCREENS; // Fallback vers la configuration par défaut
        }
    }

    /**
     * Récupère les paramètres complets d'onboarding
     */
    static async getOnboardingSettings(): Promise<OnboardingSettings> {
        try {
            const [screens, preferences] = await Promise.all([
                this.getScreensConfig(),
                this.getPreferences(),
            ]);

            return {
                screens,
                theme: preferences.theme,
                animationSpeed: preferences.animationSpeed,
                skipEnabled: preferences.skipEnabled,
                progressIndicatorStyle: preferences.progressIndicatorStyle,
            };
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_LOAD_FAILED,
                'Impossible de charger les paramètres d\'onboarding',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Réinitialise complètement l'onboarding
     */
    static async resetOnboarding(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(this.ONBOARDING_STATE_KEY),
                AsyncStorage.removeItem(this.ONBOARDING_PREFERENCES_KEY),
            ]);
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Impossible de réinitialiser l\'onboarding',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Méthode temporaire pour réinitialiser l'état de l'onboarding pour les tests.
     * À supprimer après le développement.
     */
    static async resetOnboardingStateForTesting(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.ONBOARDING_STATE_KEY);
            console.log('Onboarding state reset for testing.');
        } catch (error) {
            console.error('Failed to reset onboarding state for testing:', error);
        }
    }

    /**
     * Sauvegarde des données sensibles d'onboarding (si nécessaire)
     */
    static async saveSecureOnboardingData(key: string, value: string): Promise<void> {
        try {
            await secureStorage.setItemAsync(`onboarding_${key}`, value);
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.SECURE_STORAGE_FAILED,
                'Impossible de sauvegarder les données sécurisées',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Récupère des données sensibles d'onboarding
     */
    static async getSecureOnboardingData(key: string): Promise<string | null> {
        try {
            return await secureStorage.getItemAsync(`onboarding_${key}`);
        } catch (error) {
            console.warn('Erreur lors du chargement des données sécurisées:', error);
            return null; // Fallback
        }
    }

    /**
     * Supprime des données sensibles d'onboarding
     */
    static async removeSecureOnboardingData(key: string): Promise<void> {
        try {
            await secureStorage.deleteItemAsync(`onboarding_${key}`);
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.SECURE_STORAGE_FAILED,
                'Impossible de supprimer les données sécurisées',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Méthodes privées
     */
    private static getDefaultState(): OnboardingState {
        return {
            hasSeenOnboarding: false,
            currentScreen: 0,
            totalScreens: this.DEFAULT_SCREENS.length,
            version: this.ONBOARDING_VERSION,
        };
    }

    private static async saveOnboardingState(state: OnboardingState): Promise<void> {
        try {
            await AsyncStorage.setItem(this.ONBOARDING_STATE_KEY, JSON.stringify(state));
        } catch (error) {
            throw new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Impossible de sauvegarder l\'état d\'onboarding',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Méthodes utilitaires pour la validation
     */
    static validateScreenConfig(config: OnboardingScreenConfig): boolean {
        return !!(
            config.id &&
            config.title &&
            config.subtitle &&
            config.illustration &&
            config.animationType &&
            config.duration > 0
        );
    }

    static validatePreferences(preferences: OnboardingPreferences): boolean {
        const validThemes = ['light', 'dark', 'auto'];
        const validSpeeds = ['slow', 'normal', 'fast'];
        const validStyles = ['dots', 'bar', 'steps'];

        return !!(
            validThemes.includes(preferences.theme) &&
            validSpeeds.includes(preferences.animationSpeed) &&
            validStyles.includes(preferences.progressIndicatorStyle) &&
            typeof preferences.skipEnabled === 'boolean'
        );
    }
}
