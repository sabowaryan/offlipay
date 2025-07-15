import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    OnboardingService,
    OnboardingError,
    OnboardingErrorCode,
    OnboardingState,
    OnboardingPreferences,
    OnboardingScreenConfig
} from '@/services/OnboardingService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    getAllKeys: jest.fn(),
}));

// Mock secureStorage
jest.mock('@/utils/secureStorage', () => ({
    secureStorage: {
        setItemAsync: jest.fn(),
        getItemAsync: jest.fn(),
        deleteItemAsync: jest.fn(),
    },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Onboarding Persistence Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test persistence between sessions
    it('should persist onboarding state between sessions', async () => {
        // First session - save progress
        mockAsyncStorage.getItem.mockResolvedValueOnce(null); // Initial state check
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined); // Save progress

        await OnboardingService.saveProgress(2);

        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'onboarding_state',
            expect.stringContaining('"currentScreen":2')
        );

        // Second session - retrieve progress
        const savedState = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedState));

        const retrievedState = await OnboardingService.getOnboardingState();

        expect(retrievedState.currentScreen).toBe(2);
        expect(retrievedState.hasSeenOnboarding).toBe(false);
    });

    it('should persist preferences between sessions', async () => {
        // First session - save preferences
        mockAsyncStorage.getItem.mockResolvedValueOnce(null); // Initial preferences check
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined); // Save preferences

        const customPreferences: Partial<OnboardingPreferences> = {
            theme: 'dark',
            animationSpeed: 'fast',
            skipEnabled: false,
        };

        await OnboardingService.savePreferences(customPreferences);

        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'onboarding_preferences',
            expect.stringContaining('"theme":"dark"')
        );

        // Second session - retrieve preferences
        const savedPreferences = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedPreferences));

        const retrievedPreferences = await OnboardingService.getPreferences();

        expect(retrievedPreferences.theme).toBe('dark');
        expect(retrievedPreferences.animationSpeed).toBe('fast');
        expect(retrievedPreferences.skipEnabled).toBe(false);
    });

    it('should persist completed status between sessions', async () => {
        // First session - mark as completed
        mockAsyncStorage.getItem.mockResolvedValueOnce(null); // Initial state check
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined); // Save completion

        await OnboardingService.markOnboardingCompleted();

        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'onboarding_state',
            expect.stringContaining('"hasSeenOnboarding":true')
        );
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'onboarding_state',
            expect.stringContaining('"completedAt"')
        );

        // Second session - check if onboarding was seen
        const savedState = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedState));

        const hasSeenOnboarding = await OnboardingService.hasSeenOnboarding();

        expect(hasSeenOnboarding).toBe(true);
    });

    it('should persist skipped status between sessions', async () => {
        // First session - mark as skipped
        mockAsyncStorage.getItem.mockResolvedValueOnce(null); // Initial state check
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined); // Save skip status

        await OnboardingService.markOnboardingSkipped();

        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'onboarding_state',
            expect.stringContaining('"hasSeenOnboarding":true')
        );
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            'onboarding_state',
            expect.stringContaining('"skippedAt"')
        );

        // Second session - check if onboarding was seen
        const savedState = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedState));

        const hasSeenOnboarding = await OnboardingService.hasSeenOnboarding();

        expect(hasSeenOnboarding).toBe(true);
    });

    // Test secure storage persistence
    it('should persist secure data between sessions', async () => {
        const secureStorage = require('@/utils/secureStorage').secureStorage;
        
        // First session - save secure data
        secureStorage.setItemAsync.mockResolvedValueOnce(undefined);
        
        await OnboardingService.saveSecureOnboardingData('test_key', 'test_value');
        
        expect(secureStorage.setItemAsync).toHaveBeenCalledWith(
            'onboarding_test_key',
            'test_value'
        );
        
        // Second session - retrieve secure data
        secureStorage.getItemAsync.mockResolvedValueOnce('test_value');
        
        const retrievedValue = await OnboardingService.getSecureOnboardingData('test_key');
        
        expect(retrievedValue).toBe('test_value');
    });

    // Test version upgrade handling
    it('should reset onboarding state when version changes', async () => {
        // First session with old version
        const oldVersionState: OnboardingState = {
            hasSeenOnboarding: true,
            currentScreen: 2,
            totalScreens: 4,
            version: '0.9.0', // Old version
        };
        
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(oldVersionState));
        
        const hasSeenOnboarding = await OnboardingService.hasSeenOnboarding();
        
        // Should return false because version is different
        expect(hasSeenOnboarding).toBe(false);
    });

    // Test complete settings retrieval
    it('should retrieve complete onboarding settings with preferences', async () => {
        // Mock preferences
        const mockPreferences: OnboardingPreferences = {
            theme: 'dark',
            animationSpeed: 'fast',
            skipEnabled: false,
            progressIndicatorStyle: 'bar',
        };
        
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockPreferences));
        
        const settings = await OnboardingService.getOnboardingSettings();
        
        expect(settings.theme).toBe('dark');
        expect(settings.animationSpeed).toBe('fast');
        expect(settings.skipEnabled).toBe(false);
        expect(settings.progressIndicatorStyle).toBe('bar');
        expect(settings.screens).toHaveLength(4); // Default screens
    });

    // Test reset functionality
    it('should completely reset onboarding data', async () => {
        mockAsyncStorage.removeItem.mockResolvedValue(undefined);
        
        await OnboardingService.resetOnboarding();
        
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('onboarding_state');
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('onboarding_preferences');
        
        // After reset, should return default values
        mockAsyncStorage.getItem.mockResolvedValue(null);
        
        const state = await OnboardingService.getOnboardingState();
        const preferences = await OnboardingService.getPreferences();
        
        expect(state.hasSeenOnboarding).toBe(false);
        expect(state.currentScreen).toBe(0);
        expect(preferences.theme).toBe('auto');
    });
});