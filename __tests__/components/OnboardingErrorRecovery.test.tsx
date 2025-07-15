import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { OnboardingService, OnboardingError, OnboardingErrorCode } from '@/services/OnboardingService';

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

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Simulate the last button press (usually "OK" or confirmation)
  if (buttons && buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    if (lastButton.onPress) {
      lastButton.onPress();
    }
  }
});

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Onboarding Error Recovery Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  // Test storage error recovery
  it('should recover from storage errors when loading preferences', async () => {
    // Mock storage error for preferences
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'onboarding_preferences') {
        return Promise.reject(new Error('Storage error'));
      }
      return Promise.resolve(null);
    });

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

  // Test storage error recovery when saving progress
  it('should recover from storage errors when saving progress', async () => {
    // Mock storage error for setItem
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

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

    // Navigate to next screen - this should trigger saveProgress
    fireEvent.press(getByText('Suivant'));
    
    // Should still navigate despite storage error
    await waitFor(() => {
      expect(getByText('Payez en un scan')).toBeTruthy();
    });
  });

  // Test completion with storage error
  it('should complete onboarding even if storage fails', async () => {
    // Mock storage error for completion
    mockAsyncStorage.setItem.mockImplementation((key, value) => {
      if (value.includes('"completedAt"')) {
        return Promise.reject(new Error('Storage error'));
      }
      return Promise.resolve();
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

    // Navigate through all screens
    fireEvent.press(getByText('Suivant'));
    await waitFor(() => expect(getByText('Payez en un scan')).toBeTruthy());
    
    fireEvent.press(getByText('Suivant'));
    await waitFor(() => expect(getByText('Gérez votre argent')).toBeTruthy());
    
    fireEvent.press(getByText('Suivant'));
    await waitFor(() => expect(getByText('Toujours connecté')).toBeTruthy());
    
    // Complete onboarding - this should fail storage but still call onComplete
    fireEvent.press(getByText('Commencer'));
    
    // Should still complete despite storage error
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  // Test invalid data recovery
  it('should recover from invalid stored data', async () => {
    // Mock invalid JSON in storage
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'onboarding_state') {
        return Promise.resolve('{"invalid JSON');
      }
      return Promise.resolve(null);
    });

    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Should still render with default values despite invalid data
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });
  });

  // Test version mismatch recovery
  it('should reset onboarding state when version mismatch is detected', async () => {
    // Mock old version in storage
    const oldVersionState = {
      hasSeenOnboarding: true,
      currentScreen: 2,
      totalScreens: 4,
      version: '0.9.0', // Old version
    };
    
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'onboarding_state') {
        return Promise.resolve(JSON.stringify(oldVersionState));
      }
      return Promise.resolve(null);
    });

    const onCompleteMock = jest.fn();
    const onSkipMock = jest.fn();

    const { getByText } = render(
      <NavigationContainer>
        <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
      </NavigationContainer>
    );

    // Should start from the beginning due to version mismatch
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });
  });

  // Test skip functionality with error
  it('should handle errors during skip process', async () => {
    // Mock error during skip
    mockAsyncStorage.setItem.mockImplementation((key, value) => {
      if (value.includes('"skippedAt"')) {
        return Promise.reject(new Error('Storage error'));
      }
      return Promise.resolve();
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

    // Find and press skip button
    const skipButton = getByText('Ignorer');
    fireEvent.press(skipButton);
    
    // Should still skip despite storage error
    await waitFor(() => {
      expect(onSkipMock).toHaveBeenCalledTimes(1);
    });
  });
});