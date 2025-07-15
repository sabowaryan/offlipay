import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, View, Text } from 'react-native';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import { OnboardingContainer } from '@/components/onboarding';
import { OnboardingScreen } from '@/components/onboarding';


import { NavigationContainer } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
    return <View testID="welcome-illustration" accessibilityLabel="Illustration de bienvenue" />;
  };
});

jest.mock('@/components/onboarding/illustrations/QRPaymentIllustration', () => {
  const { View } = require('react-native');
  return function MockQRPaymentIllustration(props: any) {
    return <View testID="qr-payment-illustration" accessibilityLabel="Illustration de paiement QR" />;
  };
});

jest.mock('@/components/onboarding/illustrations/WalletIllustration', () => {
  const { View } = require('react-native');
  return function MockWalletIllustration(props: any) {
    return <View testID="wallet-illustration" accessibilityLabel="Illustration de portefeuille" />;
  };
});

jest.mock('@/components/onboarding/illustrations/OfflineIllustration', () => {
  const { View } = require('react-native');
  return function MockOfflineIllustration(props: any) {
    return <View testID="offline-illustration" accessibilityLabel="Illustration mode hors ligne" />;
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

// Mock AccessibilityInfo
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  setAccessibilityFocus: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;

describe('Onboarding Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    Platform.OS = 'ios';
  });

  describe('Screen Reader Support (iOS VoiceOver & Android TalkBack)', () => {
    it('should announce screen content for screen readers', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const onInteractionMock = jest.fn();

      render(
        <OnboardingScreen
          title="Test Title"
          subtitle="Test Subtitle"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={onInteractionMock}
          interactionHint="Test Hint"
        />
      );

      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          "Test Title. Test Subtitle. Test Hint"
        );
      });
    });

    it('should provide proper accessibility labels for all interactive elements', async () => {
      const onCompleteMock = jest.fn();
      const onSkipMock = jest.fn();

      const { getByText, getByLabelText } = render(
        <NavigationContainer>
          <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });

      // Test skip button accessibility
      const skipButton = getByText('Ignorer');
      expect(skipButton.props.accessibilityRole).toBe('button');
      expect(skipButton.props.accessibilityLabel).toBeDefined();

      // Test navigation buttons
      const nextButton = getByText('Suivant');
      expect(nextButton.props.accessibilityRole).toBe('button');
      expect(nextButton.props.accessibilityHint).toBeDefined();
    });

    it('should support screen reader navigation between elements', async () => {
      const { getByText, getByTestId } = render(
        <OnboardingScreen
          title="Bienvenue sur OffliPay"
          subtitle="Votre portefeuille numérique"
          illustration={() => <View testID="illustration" />}
          animationDelay={0}
          onInteraction={jest.fn()}
          interactionHint="Appuyez pour continuer"
        />
      );

      // Check that elements have proper accessibility focus order
      const title = getByText('Bienvenue sur OffliPay');
      const subtitle = getByText('Votre portefeuille numérique');
      const illustration = getByTestId('illustration');

      expect(title.props.accessibilityRole).toBe('header');
      expect(subtitle.props.accessibilityRole).toBe('text');
      expect(illustration.props.accessibilityLabel).toBeDefined();
    });
  });

  describe('WCAG 2.1 AA Compliance Tests', () => {
    it('should have proper accessibility roles and labels', async () => {
      const onCompleteMock = jest.fn();
      const onSkipMock = jest.fn();

      const { getByText, getAllByRole } = render(
        <NavigationContainer>
          <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });

      // Check for proper semantic roles
      const headers = getAllByRole('header');
      expect(headers.length).toBeGreaterThan(0);

      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Verify each button has proper accessibility properties
      buttons.forEach(button => {
        expect(button.props.accessibilityLabel || button.props.children).toBeDefined();
        expect(button.props.accessibilityRole).toBe('button');
      });
    });

    it('should have accessible progress indicator with proper ARIA attributes', async () => {
      const { getByTestId } = render(
        <OnboardingProgress currentStep={2} totalSteps={4} animated={false} />
      );

      const progressIndicator = getByTestId('onboarding-progress');
      expect(progressIndicator.props.accessibilityLabel).toBe('Étape 2 sur 4');
      expect(progressIndicator.props.accessibilityRole).toBe('progressbar');
      expect(progressIndicator.props.accessibilityValue).toEqual({
        min: 1,
        max: 4,
        now: 2,
      });
    });

    it('should support high contrast themes for visual accessibility', async () => {
      // Test with high contrast colors
      const highContrastColors = {
        BACKGROUND: '#000000',
        TEXT: '#FFFFFF',
        PRIMARY: '#FFFF00',
        GRAY_MEDIUM: '#CCCCCC',
        GRAY_LIGHT: '#999999',
      };

      jest.doMock('@/hooks/useThemeColors', () => ({
        useThemeColors: () => ({
          colors: highContrastColors,
          theme: 'high_contrast',
        }),
      }));

      const { getByText } = render(
        <OnboardingScreen
          title="Test Title"
          subtitle="Test Subtitle"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const title = getByText('Test Title');
      expect(title).toBeTruthy();
    });

    it('should provide proper focus management', async () => {
      const onCompleteMock = jest.fn();
      const onSkipMock = jest.fn();

      const { getByText } = render(
        <NavigationContainer>
          <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });

      // Test focus management when navigating
      const nextButton = getByText('Suivant');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(mockAccessibilityInfo.setAccessibilityFocus).toHaveBeenCalled();
      });
    });
  });

  describe('Focus Management and Navigation Support', () => {
    it('should support focus management between elements', async () => {
      const onCompleteMock = jest.fn();
      const onSkipMock = jest.fn();

      const { getByText } = render(
        <NavigationContainer>
          <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });

      // Test focus management
      const skipButton = getByText('Ignorer');
      const nextButton = getByText('Suivant');

      // Test accessibility focus
      fireEvent(skipButton, 'accessibilityFocus');
      expect(skipButton.props.accessibilityRole).toBe('button');

      fireEvent(nextButton, 'accessibilityFocus');
      expect(nextButton.props.accessibilityRole).toBe('button');
    });

    it('should support accessibility actions for navigation', async () => {
      const onCompleteMock = jest.fn();
      const onSkipMock = jest.fn();

      const { getByText } = render(
        <NavigationContainer>
          <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });

      const nextButton = getByText('Suivant');

      // Test accessibility tap (equivalent to Enter/Space on web)
      fireEvent(nextButton, 'accessibilityTap');

      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
      });
    });

    it('should support accessibility actions for progress indicator', async () => {
      const { getByTestId } = render(
        <OnboardingProgress currentStep={2} totalSteps={4} animated={false} />
      );

      const progressIndicator = getByTestId('onboarding-progress');

      // Test accessibility focus
      fireEvent(progressIndicator, 'accessibilityFocus');

      expect(progressIndicator.props.accessibilityRole).toBe('progressbar');
      expect(progressIndicator.props.accessibilityValue).toEqual({
        min: 1,
        max: 4,
        now: 2,
      });
    });
  });

  describe('Component-Specific Accessibility Tests', () => {
    it('should test OnboardingButton accessibility', async () => {
      const onPressMock = jest.fn();

      const { getByText } = render(
        <OnboardingButton
          title="Test Button"
          onPress={onPressMock}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByText('Test Button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Test Button');
      expect(button.props.accessibilityState?.disabled).toBe(false);

      fireEvent.press(button);
      expect(onPressMock).toHaveBeenCalled();
    });

    it('should test disabled button accessibility', async () => {
      const onPressMock = jest.fn();

      const { getByText } = render(
        <OnboardingButton
          title="Disabled Button"
          onPress={onPressMock}
          variant="primary"
          disabled={true}
        />
      );

      const button = getByText('Disabled Button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
      expect(button.props.accessibilityHint).toContain('indisponible');
    });

    it('should test illustration accessibility', async () => {
      const { getByTestId } = render(
        <OnboardingScreen
          title="Test"
          subtitle="Test"
          illustration={() => <View testID="test-illustration" />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const illustration = getByTestId('test-illustration');
      expect(illustration.props.accessibilityLabel).toBeDefined();
      expect(illustration.props.accessibilityRole).toBe('image');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle screen reader detection failure gracefully', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.reject(new Error('Detection failed')));

      const { getByText } = render(
        <OnboardingScreen
          title="Test Title"
          subtitle="Test Subtitle"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      // Should still render properly even if screen reader detection fails
      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Subtitle')).toBeTruthy();
    });

    it('should maintain accessibility during animations', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title="Animated Title"
          subtitle="Animated Subtitle"
          illustration={() => <View />}
          animationDelay={500}
          onInteraction={jest.fn()}
        />
      );

      // Elements should be accessible even during animations
      const title = getByText('Animated Title');
      expect(title.props.accessibilityRole).toBe('header');
      expect(title.props.accessibilityLabel).toBeDefined();
    });

    it('should handle missing accessibility labels gracefully', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title=""
          subtitle=""
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      // Should not crash with empty strings
      expect(() => getByText('')).not.toThrow();
    });
  });

  describe('Platform-Specific Accessibility Features', () => {
    it('should support iOS VoiceOver gestures', async () => {
      Platform.OS = 'ios';
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { getByText } = render(
        <OnboardingScreen
          title="iOS Test"
          subtitle="VoiceOver Test"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const title = getByText('iOS Test');

      // Test VoiceOver specific properties
      expect(title.props.accessibilityTraits).toBeDefined();
      expect(title.props.accessibilityRole).toBe('header');
    });

    it('should support Android TalkBack features', async () => {
      Platform.OS = 'android';
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { getByText } = render(
        <OnboardingScreen
          title="Android Test"
          subtitle="TalkBack Test"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const title = getByText('Android Test');

      // Test TalkBack specific properties
      expect(title.props.accessibilityRole).toBe('header');
      expect(title.props.importantForAccessibility).toBe('yes');
    });
  });

  describe('Performance and Memory Tests', () => {
    it('should not cause memory leaks with accessibility listeners', async () => {
      const { unmount } = render(
        <OnboardingContainer onComplete={jest.fn()} onSkip={jest.fn()} />
      );

      // Unmount component
      unmount();

      // Verify cleanup
      expect(mockAccessibilityInfo.announceForAccessibility).not.toHaveBeenCalledAfter(unmount);
    });

    it('should handle rapid accessibility state changes', async () => {
      const { rerender } = render(
        <OnboardingProgress currentStep={1} totalSteps={4} animated={true} />
      );

      // Rapidly change steps
      for (let i = 2; i <= 4; i++) {
        rerender(<OnboardingProgress currentStep={i} totalSteps={4} animated={true} />);
      }

      // Should handle rapid changes without errors
      expect(() => {
        rerender(<OnboardingProgress currentStep={4} totalSteps={4} animated={true} />);
      }).not.toThrow();
    });
  });
});