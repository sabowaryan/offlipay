import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '@/utils/secureStorage/';
import { defaultPremiumConfig } from '@/components/onboarding/premiumConfig';
import { PremiumScreenConfig } from '@/components/onboarding/types/PremiumOnboardingConfig';

// Types pour l'onboarding - Updated to support slides
export interface OnboardingScreenConfig {
    id: string;
    title: string;
    subtitle: string;
    illustration: string;
    animationType: 'fadeIn' | 'slideUp' | 'scale' | 'custom';
    interactionType?: 'tap' | 'swipe' | 'none';
    duration: number;
    slides: Array<{
        id: string;
        illustration: string;
        title: string;
        subtitle: string;
        animationType: 'fadeIn' | 'slideUp' | 'scale' | 'morphing' | 'parallax';
        duration: number;
        interactionHint?: string;
    }>;
}

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

    // Configuration par défaut des écrans d'onboarding - Updated to use premium config
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
            id: 'qr_payments',
            title: 'Payez en un scan',
            subtitle: 'Scannez ou générez des QR codes pour des transactions instantanées',
            illustration: 'qr_payment',
            animationType: 'slideUp',
            interactionType: 'tap',
            duration: 2500,
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
            duration: 3000,
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
            duration: 2500,
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
            console.log('Loading screens config:', this.DEFAULT_SCREENS.map(s => ({ 
                id: s.id, 
                title: s.title, 
                slidesCount: s.slides?.length || 0 
            })));
            return this.DEFAULT_SCREENS;
        } catch (error) {
            console.warn('Erreur lors du chargement de la configuration des écrans:', error);
            return this.DEFAULT_SCREENS; // Fallback vers la configuration par défaut
        }
    }

    /**
     * Récupère la configuration premium des écrans d'onboarding
     */
    static async getPremiumScreensConfig(): Promise<PremiumScreenConfig[]> {
        try {
            return defaultPremiumConfig.screens;
        } catch (error) {
            console.warn('Erreur lors du chargement de la configuration premium:', error);
            // Fallback to default screens converted to premium format
            return this.DEFAULT_SCREENS.map(screen => ({
                id: screen.id,
                title: screen.title,
                slides: screen.slides,
                transitionType: 'fade' as const,
                duration: screen.duration
            }));
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
