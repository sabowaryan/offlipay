import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
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
    withTiming: (toValue: any, options?: any, callback?: any) => {
      if (callback) {
        callback(true);
      }
      return toValue;
    },
    withDelay: (delay: any, animation: any) => animation,
    withSpring: (toValue: any, options?: any, callback?: any) => {
      if (callback) {
        callback(true);
      }
      return toValue;
    },
    runOnJS: (fn: any) => fn,
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
  return function MockWelcomeIllustration(props: any) {
    return <View testID="welcome-illustration" />;
  };
});

jest.mock('@/components/onboarding/illustrations/QRPaymentIllustration', () => {
  const { View } = require('react-native');
  return function MockQRPaymentIllustration(props: any) {
    return <View testID="qr-payment-illustration" />;
  };
});

jest.mock('@/components/onboarding/illustrations/WalletIllustration', () => {
  const { View } = require('react-native');
  return function MockWalletIllustration(props: any) {
    return <View testID="wallet-illustration" />;
  };
});

jest.mock('@/components/onboarding/illustrations/OfflineIllustration', () => {
  const { View } = require('react-native');
  return function MockOfflineIllustration(props: any) {
    return <View testID="offline-illustration" />;
  };
});

// Mock dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
}));

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

describe('Onboarding Integration Tests', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'onboarding_state') {
        return Promise.resolve(null);
      }
      if (key === 'onboarding_preferences') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  // Test complete onboarding flow
  it('should navigate through all onboarding screens and complete onboarding', async () => {
    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText, queryByText, getByTestId } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Wait for onboarding to load
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });

    // First screen - Welcome
    expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    expect(getByText('Votre portefeuille numérique pour des paiements simples et sécurisés, même hors ligne')).toBeTruthy();

    // Navigate to next screen
    fireEvent.press(getByText('Suivant'));

    // Second screen - QR Payments
    await waitFor(() => {
      expect(getByText('Payez en un scan')).toBeTruthy();
    });
    expect(getByText('Scannez ou générez des QR codes pour des transactions instantanées')).toBeTruthy();

    // Navigate to next screen
    fireEvent.press(getByText('Suivant'));

    // Third screen - Wallet
    await waitFor(() => {
      expect(getByText('Gérez votre argent')).toBeTruthy();
    });
    expect(getByText('Rechargez facilement via agents, vouchers ou virement bancaire')).toBeTruthy();

    // Navigate to next screen
    fireEvent.press(getByText('Suivant'));

    // Fourth screen - Offline
    await waitFor(() => {
      expect(getByText('Toujours connecté')).toBeTruthy();
    });
    expect(getByText('Effectuez des paiements même sans connexion internet')).toBeTruthy();

    // Complete onboarding
    fireEvent.press(getByText('Commencer'));

    // Verify onboarding was completed
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('"hasSeenOnboarding":true')
      );
    });
  });

  // Test skipping onboarding
  it('should allow skipping the onboarding flow', async () => {
    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText, queryByText, findByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Wait for onboarding to load
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });

    // Find and press skip button
    const skipButton = getByText('Ignorer');
    fireEvent.press(skipButton);

    // Confirm skip in alert
    await waitFor(() => {
      // Find the "Ignorer" button in the alert dialog
      const alertIgnoreButton = getByText('Ignorer');
      fireEvent.press(alertIgnoreButton);
    });

    // Verify onboarding was skipped
    await waitFor(() => {
      expect(onSkipMock).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('"hasSeenOnboarding":true')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('"skippedAt"')
      );
    });
  });

  // Test persistence of preferences between sessions
  it('should restore onboarding progress from previous session', async () => {
    // Mock existing state with progress at screen 2
    const mockState = {
      hasSeenOnboarding: false,
      currentScreen: 2, // Third screen (0-indexed)
      totalScreens: 4,
      version: '1.0.0',
    };

    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'onboarding_state') {
        return Promise.resolve(JSON.stringify(mockState));
      }
      return Promise.resolve(null);
    });

    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText, queryByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Should start at the third screen (Wallet)
    await waitFor(() => {
      expect(getByText('Gérez votre argent')).toBeTruthy();
    });

    // Should not show the first screen
    expect(queryByText('Bienvenue sur OffliPay')).toBeNull();
  });

  // Test theme integration
  it('should render with dark theme when dark theme is set in preferences', async () => {
    // Mock dark theme preference
    const mockPreferences = {
      theme: 'dark',
      animationSpeed: 'normal',
      skipEnabled: true,
      progressIndicatorStyle: 'dots',
    };

    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'onboarding_preferences') {
        return Promise.resolve(JSON.stringify(mockPreferences));
      }
      return Promise.resolve(null);
    });

    // Mock the theme hook to return dark theme
    jest.mock('@/hooks/useThemeColors', () => ({
      useThemeColors: () => ({
        colors: {
          BACKGROUND: '#000000',
          TEXT: '#FFFFFF',
          PRIMARY: '#66AAFF',
          GRAY_MEDIUM: '#AAAAAA',
        },
        theme: 'dark',
      }),
    }));

    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    // Re-render with mocked dark theme
    const { getByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Verify content renders with dark theme
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });
  });

  // Test error recovery
  it('should handle storage errors gracefully', async () => {
    // Mock storage error
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Should still render with default values despite storage error
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });
  });

  // Test navigation with previous button
  it('should allow navigation back to previous screens', async () => {
    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText, queryByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Wait for onboarding to load
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });

    // Navigate to second screen
    fireEvent.press(getByText('Suivant'));

    await waitFor(() => {
      expect(getByText('Payez en un scan')).toBeTruthy();
    });

    // Navigate back to first screen
    fireEvent.press(getByText('Précédent'));

    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });
  });
});