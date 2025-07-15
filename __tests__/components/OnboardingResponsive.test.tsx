import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { OnboardingService } from '@/services/OnboardingService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
        NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
    };
});

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('@/utils/secureStorage', () => ({
    secureStorage: {
        setItemAsync: jest.fn(),
        getItemAsync: jest.fn(),
        deleteItemAsync: jest.fn(),
    },
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
    const View = require('react-native').View;
    return {
        View,
        Animated: {
            View,
        },
        useSharedValue: () => ({
            value: 0,
        }),
        useAnimatedStyle: () => ({}),
        withTiming: (toValue, options, callback) => {
            if (callback) {
                callback(true);
            }
            return toValue;
        },
        withDelay: (delay, animation) => animation,
        withSpring: (toValue, options, callback) => {
            if (callback) {
                callback(true);
            }
            return toValue;
        },
        runOnJS: (fn) => fn,
        interpolate: () => 0,
    };
});

jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
        GestureHandlerRootView: View,
        GestureDetector: View,
        Gesture: {
            Pan: () => ({
                activeOffsetX: () => ({
                    failOffsetY: () => ({
                        enabled: () => ({
                            onUpdate: () => ({
                                onEnd: () => ({}),
                            }),
                        }),
                    }),
                }),
            }),
            Tap: () => ({
                onEnd: () => ({}),
            }),
            Exclusive: () => ({}),
        },
    };
});

// Mock the illustrations
jest.mock('@/components/onboarding/illustrations/WelcomeIllustration', () => {
    const { View } = require('react-native');
    return function MockWelcomeIllustration(props) {
        return <View testID="welcome-illustration" />;
    };
});

jest.mock('@/components/onboarding/illustrations/QRPaymentIllustration', () => {
    const { View } = require('react-native');
    return function MockQRPaymentIllustration(props) {
        return <View testID="qr-payment-illustration" />;
    };
});

jest.mock('@/components/onboarding/illustrations/WalletIllustration', () => {
    const { View } = require('react-native');
    return function MockWalletIllustration(props) {
        return <View testID="wallet-illustration" />;
    };
});

jest.mock('@/components/onboarding/illustrations/OfflineIllustration', () => {
    const { View } = require('react-native');
    return function MockOfflineIllustration(props) {
        return <View testID="offline-illustration" />;
    };
});

// Mock theme hook
jest.mock('@/hooks/useThemeColors', () => ({
    useThemeColors: () => ({
        colors: {
            BACKGROUND: '#FFFFFF',
            TEXT: '#000000',
            PRIMARY: '#0066CC',
            GRAY_MEDIUM: '#666666',
        },
        theme: 'light',
    }),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Onboarding Responsive Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAsyncStorage.getItem.mockResolvedValue(null);
        mockAsyncStorage.setItem.mockResolvedValue();
    });

    // Test with different screen sizes
    const testScreenSizes = [
        { name: 'small phone', width: 320, height: 568 },
        { name: 'medium phone', width: 375, height: 667 },
        { name: 'large phone', width: 414, height: 736 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'large tablet', width: 1024, height: 1366 },
    ];

    testScreenSizes.forEach(size => {
        it(`should render correctly on ${size.name} (${size.width}x${size.height})`, async () => {
            // Mock the dimensions for this test
            jest.spyOn(Dimensions, 'get').mockReturnValue({
                width: size.width,
                height: size.height,
                scale: 1,
                fontScale: 1,
            });

            const onCompleteMock = jest.fn();
            const onSkipMock = jest.fn();

            const { getByText, queryByTestId } = render(
                <NavigationContainer>
                    <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
                </NavigationContainer>
            );

            // Wait for onboarding to load
            await waitFor(() => {
                expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
            });

            // Verify that the illustration is rendered
            expect(queryByTestId('welcome-illustration')).toBeTruthy();
        });
    });

    // Test with different orientations
    const testOrientations = [
        { name: 'portrait', width: 375, height: 667 },
        { name: 'landscape', width: 667, height: 375 },
    ];

    testOrientations.forEach(orientation => {
        it(`should render correctly in ${orientation.name} orientation (${orientation.width}x${orientation.height})`, async () => {
            // Mock the dimensions for this test
            jest.spyOn(Dimensions, 'get').mockReturnValue({
                width: orientation.width,
                height: orientation.height,
                scale: 1,
                fontScale: 1,
            });

            const onCompleteMock = jest.fn();
            const onSkipMock = jest.fn();

            const { getByText, queryByTestId } = render(
                <NavigationContainer>
                    <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
                </NavigationContainer>
            );

            // Wait for onboarding to load
            await waitFor(() => {
                expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
            });

            // Verify that the illustration is rendered
            expect(queryByTestId('welcome-illustration')).toBeTruthy();
        });
    });

    // Test with different font scales (accessibility)
    const testFontScales = [
        { name: 'normal', scale: 1 },
        { name: 'large', scale: 1.3 },
        { name: 'extra large', scale: 1.6 },
    ];

    testFontScales.forEach(fontScale => {
        it(`should render correctly with ${fontScale.name} font scale (${fontScale.scale})`, async () => {
            // Mock the dimensions for this test
            jest.spyOn(Dimensions, 'get').mockReturnValue({
                width: 375,
                height: 667,
                scale: 1,
                fontScale: fontScale.scale,
            });

            const onCompleteMock = jest.fn();
            const onSkipMock = jest.fn();

            const { getByText } = render(
                <NavigationContainer>
                    <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
                </NavigationContainer>
            );

            // Wait for onboarding to load
            await waitFor(() => {
                expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
            });
        });
    });
});