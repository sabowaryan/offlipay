import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    OnboardingService,
    OnboardingError,
    OnboardingErrorCode,
    OnboardingState,
    OnboardingPreferences,
    OnboardingScreenConfig
} from '../../services/OnboardingService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock secureStorage
jest.mock('../../utils/secureStorage', () => ({
    secureStorage: {
        setItemAsync: jest.fn(),
        getItemAsync: jest.fn(),
        deleteItemAsync: jest.fn(),
    },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('OnboardingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hasSeenOnboarding', () => {
        it('should return false when no onboarding state exists', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const result = await OnboardingService.hasSeenOnboarding();

            expect(result).toBe(false);
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('onboarding_state');
        });

        it('should return true when onboarding has been completed', async () => {
            const mockState: OnboardingState = {
                hasSeenOnboarding: true,
                currentScreen: 4,
                totalScreens: 4,
                completedAt: new Date(),
                version: '1.0.0',
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));

            const result = await OnboardingService.hasSeenOnboarding();

            expect(result).toBe(true);
        });

        it('should return false when storage throws an error', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const result = await OnboardingService.hasSeenOnboarding();

            expect(result).toBe(false);
        });

        it('should return false when stored data has different version', async () => {
            const mockState: OnboardingState = {
                hasSeenOnboarding: true,
                currentScreen: 4,
                totalScreens: 4,
                version: '0.9.0', // Different version
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));

            const result = await OnboardingService.hasSeenOnboarding();

            expect(result).toBe(false);
        });
    });

    describe('markOnboardingCompleted', () => {
        it('should save completed onboarding state', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockResolvedValue();

            await OnboardingService.markOnboardingCompleted();

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                'onboarding_state',
                expect.stringContaining('"hasSeenOnboarding":true')
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                'onboarding_state',
                expect.stringContaining('"completedAt"')
            );
        });

        it('should throw OnboardingError when storage fails', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

            await expect(OnboardingService.markOnboardingCompleted()).rejects.toThrow(OnboardingError);
            await expect(OnboardingService.markOnboardingCompleted()).rejects.toThrow(
                'Impossible de marquer l\'onboarding comme terminé'
            );
        });
    });

    describe('markOnboardingSkipped', () => {
        it('should save skipped onboarding state', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockResolvedValue();

            await OnboardingService.markOnboardingSkipped();

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                'onboarding_state',
                expect.stringContaining('"hasSeenOnboarding":true')
            );
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                'onboarding_state',
                expect.stringContaining('"skippedAt"')
            );
        });

        it('should throw OnboardingError when storage fails', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

            await expect(OnboardingService.markOnboardingSkipped()).rejects.toThrow(OnboardingError);
        });
    });

    describe('saveProgress', () => {
        it('should save current screen progress', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockResolvedValue();

            await OnboardingService.saveProgress(2);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                'onboarding_state',
                expect.stringContaining('"currentScreen":2')
            );
        });

        it('should preserve existing state when saving progress', async () => {
            const existingState: OnboardingState = {
                hasSeenOnboarding: false,
                currentScreen: 1,
                totalScreens: 4,
                version: '1.0.0',
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingState));
            mockAsyncStorage.setItem.mockResolvedValue();

            await OnboardingService.saveProgress(3);

            const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
            expect(savedData.currentScreen).toBe(3);
            expect(savedData.hasSeenOnboarding).toBe(false);
            expect(savedData.totalScreens).toBe(4);
        });
    });

    describe('getOnboardingState', () => {
        it('should return default state when no data exists', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const state = await OnboardingService.getOnboardingState();

            expect(state).toEqual({
                hasSeenOnboarding: false,
                currentScreen: 0,
                totalScreens: 4,
                version: '1.0.0',
            });
        });

        it('should return stored state when data exists', async () => {
            const mockState: OnboardingState = {
                hasSeenOnboarding: true,
                currentScreen: 2,
                totalScreens: 4,
                completedAt: new Date('2025-01-01'),
                version: '1.0.0',
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));

            const state = await OnboardingService.getOnboardingState();

            expect(state.hasSeenOnboarding).toBe(true);
            expect(state.currentScreen).toBe(2);
            expect(state.totalScreens).toBe(4);
        });

        it('should return default state when storage throws error', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const state = await OnboardingService.getOnboardingState();

            expect(state.hasSeenOnboarding).toBe(false);
            expect(state.currentScreen).toBe(0);
        });
    });

    describe('savePreferences', () => {
        it('should save partial preferences and merge with defaults', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockResolvedValue();

            await OnboardingService.savePreferences({ theme: 'dark' });

            const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
            expect(savedData.theme).toBe('dark');
            expect(savedData.animationSpeed).toBe('normal'); // Default value
            expect(savedData.skipEnabled).toBe(true); // Default value
        });

        it('should merge with existing preferences', async () => {
            const existingPreferences: OnboardingPreferences = {
                theme: 'light',
                animationSpeed: 'fast',
                skipEnabled: false,
                progressIndicatorStyle: 'bar',
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPreferences));
            mockAsyncStorage.setItem.mockResolvedValue();

            await OnboardingService.savePreferences({ theme: 'dark' });

            const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
            expect(savedData.theme).toBe('dark');
            expect(savedData.animationSpeed).toBe('fast'); // Preserved
            expect(savedData.skipEnabled).toBe(false); // Preserved
        });

        it('should throw OnboardingError when storage fails', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

            await expect(OnboardingService.savePreferences({ theme: 'dark' })).rejects.toThrow(OnboardingError);
        });
    });

    describe('getPreferences', () => {
        it('should return default preferences when no data exists', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const preferences = await OnboardingService.getPreferences();

            expect(preferences).toEqual({
                theme: 'auto',
                animationSpeed: 'normal',
                skipEnabled: true,
                progressIndicatorStyle: 'dots',
            });
        });

        it('should return stored preferences when data exists', async () => {
            const mockPreferences: OnboardingPreferences = {
                theme: 'dark',
                animationSpeed: 'fast',
                skipEnabled: false,
                progressIndicatorStyle: 'bar',
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

            const preferences = await OnboardingService.getPreferences();

            expect(preferences).toEqual(mockPreferences);
        });

        it('should return default preferences when storage throws error', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const preferences = await OnboardingService.getPreferences();

            expect(preferences.theme).toBe('auto');
            expect(preferences.animationSpeed).toBe('normal');
        });
    });

    describe('getScreensConfig', () => {
        it('should return default screens configuration', async () => {
            const screens = await OnboardingService.getScreensConfig();

            expect(screens).toHaveLength(4);
            expect(screens[0].id).toBe('welcome');
            expect(screens[1].id).toBe('qr_payments');
            expect(screens[2].id).toBe('wallet');
            expect(screens[3].id).toBe('offline');
        });

        it('should return valid screen configurations', async () => {
            const screens = await OnboardingService.getScreensConfig();

            screens.forEach(screen => {
                expect(screen.id).toBeTruthy();
                expect(screen.title).toBeTruthy();
                expect(screen.subtitle).toBeTruthy();
                expect(screen.illustration).toBeTruthy();
                expect(screen.animationType).toBeTruthy();
                expect(screen.duration).toBeGreaterThan(0);
            });
        });
    });

    describe('getOnboardingSettings', () => {
        it('should return complete onboarding settings', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const settings = await OnboardingService.getOnboardingSettings();

            expect(settings.screens).toHaveLength(4);
            expect(settings.theme).toBe('auto');
            expect(settings.animationSpeed).toBe('normal');
            expect(settings.skipEnabled).toBe(true);
            expect(settings.progressIndicatorStyle).toBe('dots');
        });

        it('should combine screens and preferences correctly', async () => {
            const mockPreferences: OnboardingPreferences = {
                theme: 'dark',
                animationSpeed: 'fast',
                skipEnabled: false,
                progressIndicatorStyle: 'bar',
            };

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

            const settings = await OnboardingService.getOnboardingSettings();

            expect(settings.theme).toBe('dark');
            expect(settings.animationSpeed).toBe('fast');
            expect(settings.skipEnabled).toBe(false);
            expect(settings.progressIndicatorStyle).toBe('bar');
            expect(settings.screens).toHaveLength(4);
        });
    });

    describe('resetOnboarding', () => {
        it('should remove all onboarding data', async () => {
            mockAsyncStorage.removeItem.mockResolvedValue();

            await OnboardingService.resetOnboarding();

            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('onboarding_state');
            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('onboarding_preferences');
        });

        it('should throw OnboardingError when storage fails', async () => {
            mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

            await expect(OnboardingService.resetOnboarding()).rejects.toThrow(OnboardingError);
        });
    });

    describe('validateScreenConfig', () => {
        it('should return true for valid screen config', () => {
            const validConfig: OnboardingScreenConfig = {
                id: 'test',
                title: 'Test Title',
                subtitle: 'Test Subtitle',
                illustration: 'test_illustration',
                animationType: 'fadeIn',
                duration: 1000,
            };

            const result = OnboardingService.validateScreenConfig(validConfig);

            expect(result).toBe(true);
        });

        it('should return false for invalid screen config', () => {
            const invalidConfig = {
                id: '',
                title: 'Test Title',
                subtitle: '',
                illustration: 'test_illustration',
                animationType: 'fadeIn',
                duration: 0,
            } as OnboardingScreenConfig;

            const result = OnboardingService.validateScreenConfig(invalidConfig);

            expect(result).toBe(false);
        });
    });

    describe('validatePreferences', () => {
        it('should return true for valid preferences', () => {
            const validPreferences: OnboardingPreferences = {
                theme: 'dark',
                animationSpeed: 'fast',
                skipEnabled: true,
                progressIndicatorStyle: 'bar',
            };

            const result = OnboardingService.validatePreferences(validPreferences);

            expect(result).toBe(true);
        });

        it('should return false for invalid theme', () => {
            // Use type assertion to unknown first to bypass TypeScript's type checking
            // This is intentional for testing invalid values
            const invalidPreferences = {
                theme: 'invalid',
                animationSpeed: 'normal',
                skipEnabled: true,
                progressIndicatorStyle: 'dots',
            } as unknown as OnboardingPreferences;

            const result = OnboardingService.validatePreferences(invalidPreferences);

            expect(result).toBe(false);
        });

        it('should return false for invalid animation speed', () => {
            // Use type assertion to unknown first to bypass TypeScript's type checking
            // This is intentional for testing invalid values
            const invalidPreferences = {
                theme: 'light',
                animationSpeed: 'invalid',
                skipEnabled: true,
                progressIndicatorStyle: 'dots',
            } as unknown as OnboardingPreferences;

            const result = OnboardingService.validatePreferences(invalidPreferences);

            expect(result).toBe(false);
        });
    });

    describe('Error handling', () => {
        it('should create OnboardingError with correct properties', () => {
            const originalError = new Error('Original error');
            const onboardingError = new OnboardingError(
                OnboardingErrorCode.STORAGE_SAVE_FAILED,
                'Test error message',
                originalError
            );

            expect(onboardingError.name).toBe('OnboardingError');
            expect(onboardingError.code).toBe(OnboardingErrorCode.STORAGE_SAVE_FAILED);
            expect(onboardingError.message).toBe('Test error message');
            expect(onboardingError.originalError).toBe(originalError);
        });

        it('should handle storage errors gracefully in read operations', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            // These should not throw, but return fallback values
            const hasSeenOnboarding = await OnboardingService.hasSeenOnboarding();
            const state = await OnboardingService.getOnboardingState();
            const preferences = await OnboardingService.getPreferences();

            expect(hasSeenOnboarding).toBe(false);
            expect(state.hasSeenOnboarding).toBe(false);
            expect(preferences.theme).toBe('auto');
        });
    });
});