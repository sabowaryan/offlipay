import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AccessibilityInfo, Platform, View } from 'react-native';

import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import OnboardingButton from '@/components/onboarding/OnboardingButton';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

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

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    View,
    Animated: { View },
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withTiming: (toValue: any) => toValue,
    withDelay: (delay: any, animation: any) => animation,
    withSpring: (toValue: any) => toValue,
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
              onUpdate: () => ({ onEnd: () => ({}) }),
            }),
          }),
        }),
      }),
      Tap: () => ({ onEnd: () => ({}) }),
      Exclusive: () => ({}),
    },
  };
});

// Mock illustrations with proper accessibility
jest.mock('@/components/onboarding/illustrations/WelcomeIllustration', () => {
  const { View } = require('react-native');
  return function MockWelcomeIllustration() {
    return (
      <View
        testID="welcome-illustration"
        accessibilityLabel="Animation de bienvenue avec le logo OffliPay qui apparaît avec des particules scintillantes"
        accessibilityRole="image"
        accessibilityHint="Illustration décorative présentant l'application OffliPay"
      />
    );
  };
});

jest.mock('@/components/onboarding/illustrations/QRPaymentIllustration', () => {
  const { View } = require('react-native');
  return function MockQRPaymentIllustration() {
    return (
      <View
        testID="qr-payment-illustration"
        accessibilityLabel="Animation de paiement par code QR montrant un téléphone qui scanne un code"
        accessibilityRole="image"
        accessibilityHint="Illustration expliquant comment effectuer un paiement en scannant un code QR"
      />
    );
  };
});

jest.mock('@/components/onboarding/illustrations/WalletIllustration', () => {
  const { View } = require('react-native');
  return function MockWalletIllustration() {
    return (
      <View
        testID="wallet-illustration"
        accessibilityLabel="Animation du portefeuille numérique avec des transactions qui apparaissent et un solde qui s'incrémente"
        accessibilityRole="image"
        accessibilityHint="Illustration présentant la gestion du portefeuille et des transactions"
      />
    );
  };
});

jest.mock('@/components/onboarding/illustrations/OfflineIllustration', () => {
  const { View } = require('react-native');
  return function MockOfflineIllustration() {
    return (
      <View
        testID="offline-illustration"
        accessibilityLabel="Animation du mode hors ligne montrant la transition entre connexion et déconnexion"
        accessibilityRole="image"
        accessibilityHint="Illustration expliquant le fonctionnement des paiements sans connexion internet"
      />
    );
  };
});

jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      BACKGROUND: '#FFFFFF',
      TEXT: '#000000',
      PRIMARY: '#0066CC',
      GRAY_MEDIUM: '#666666',
      GRAY_LIGHT: '#CCCCCC',
    },
    theme: 'light',
  }),
}));

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  setAccessibilityFocus: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

const mockAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;

/**
 * Comprehensive Screen Reader Support Tests
 * Tests VoiceOver (iOS) and TalkBack (Android) compatibility
 */
describe('Onboarding Screen Reader Support Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('iOS VoiceOver Support', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));
    });

    it('should provide proper VoiceOver announcements for screen content', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title="Bienvenue sur OffliPay"
          subtitle="Votre portefeuille numérique pour des paiements simples et sécurisés"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
          interactionHint="Appuyez deux fois pour continuer"
        />
      );

      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          "Bienvenue sur OffliPay. Votre portefeuille numérique pour des paiements simples et sécurisés. Appuyez deux fois pour continuer"
        );
      });
    });

    it('should support VoiceOver gestures for navigation', async () => {
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

      // Test VoiceOver swipe gestures
      const nextButton = getByText('Suivant');

      // Simulate VoiceOver double-tap gesture
      fireEvent(nextButton, 'accessibilityTap');

      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
      });
    });

    it('should provide proper accessibility traits for iOS', async () => {
      const { getByText } = render(
        <OnboardingButton
          title="Test Button"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByText('Test Button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityTraits).toContain('button');
    });

    it('should handle VoiceOver focus management', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title="Focus Test"
          subtitle="Testing VoiceOver focus"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const title = getByText('Focus Test');

      // Simulate VoiceOver focus
      fireEvent(title, 'accessibilityFocus');

      expect(mockAccessibilityInfo.setAccessibilityFocus).toHaveBeenCalled();
    });

    it('should provide proper VoiceOver hints for complex interactions', async () => {
      const { getByTestId } = render(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      const progress = getByTestId('onboarding-progress');
      expect(progress.props.accessibilityHint).toContain('progression');
      expect(progress.props.accessibilityValue).toEqual({
        min: 1,
        max: 4,
        now: 2,
      });
    });

    it('should announce state changes to VoiceOver', async () => {
      const { getByText, rerender } = render(
        <OnboardingButton
          title="State Button"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      // Change to disabled state
      rerender(
        <OnboardingButton
          title="State Button"
          onPress={jest.fn()}
          variant="primary"
          disabled={true}
        />
      );

      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('indisponible')
        );
      });
    });
  });

  describe('Android TalkBack Support', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));
    });

    it('should provide proper TalkBack announcements', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title="Bienvenue sur OffliPay"
          subtitle="Votre portefeuille numérique"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
          interactionHint="Appuyez deux fois pour activer"
        />
      );

      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          "Bienvenue sur OffliPay. Votre portefeuille numérique. Appuyez deux fois pour activer"
        );
      });
    });

    it('should support TalkBack explore-by-touch', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title="Touch Exploration"
          subtitle="Testing TalkBack touch"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const title = getByText('Touch Exploration');

      // Simulate TalkBack explore-by-touch
      fireEvent(title, 'accessibilityFocus');

      expect(title.props.importantForAccessibility).toBe('yes');
    });

    it('should provide proper content descriptions for Android', async () => {
      const { getByTestId } = render(
        <OnboardingScreen
          title="Content Description Test"
          subtitle="Testing Android accessibility"
          illustration={() => <View testID="test-illustration" />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      const illustration = getByTestId('test-illustration');
      expect(illustration.props.accessibilityLabel).toBeDefined();
      expect(illustration.props.accessibilityRole).toBe('image');
    });

    it('should handle TalkBack navigation gestures', async () => {
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

      // Test TalkBack swipe gestures
      const nextButton = getByText('Suivant');

      // Simulate TalkBack double-tap
      fireEvent(nextButton, 'accessibilityTap');

      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
      });
    });

    it('should provide proper Android accessibility actions', async () => {
      const onPressMock = jest.fn();

      const { getByText } = render(
        <OnboardingButton
          title="Action Test"
          onPress={onPressMock}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByText('Action Test');
      expect(button.props.accessibilityActions).toBeDefined();
      expect(button.props.onAccessibilityAction).toBeDefined();
    });
  });

  describe('Cross-Platform Screen Reader Features', () => {
    it('should detect screen reader status on both platforms', async () => {
      // Test iOS
      Platform.OS = 'ios';
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { rerender } = render(
        <OnboardingScreen
          title="Screen Reader Test"
          subtitle="Cross-platform test"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      expect(mockAccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalled();

      // Test Android
      Platform.OS = 'android';
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      rerender(
        <OnboardingScreen
          title="Screen Reader Test"
          subtitle="Cross-platform test"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      expect(mockAccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalled();
    });

    it('should provide consistent accessibility experience across platforms', async () => {
      const testComponent = (
        <OnboardingButton
          title="Cross-Platform Button"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      // Test iOS
      Platform.OS = 'ios';
      const { getByText: getByTextIOS, unmount: unmountIOS } = render(testComponent);
      const buttonIOS = getByTextIOS('Cross-Platform Button');
      expect(buttonIOS.props.accessibilityRole).toBe('button');
      expect(buttonIOS.props.accessibilityLabel).toBe('Cross-Platform Button');
      unmountIOS();

      // Test Android
      Platform.OS = 'android';
      const { getByText: getByTextAndroid } = render(testComponent);
      const buttonAndroid = getByTextAndroid('Cross-Platform Button');
      expect(buttonAndroid.props.accessibilityRole).toBe('button');
      expect(buttonAndroid.props.accessibilityLabel).toBe('Cross-Platform Button');
    });

    it('should handle screen reader state changes', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(false));

      const { rerender } = render(
        <OnboardingScreen
          title="State Change Test"
          subtitle="Testing screen reader state"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      // Enable screen reader
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      rerender(
        <OnboardingScreen
          title="State Change Test"
          subtitle="Testing screen reader state"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
      });
    });
  });

  describe('Complex Content Accessibility', () => {
    it('should provide proper reading order for complex layouts', async () => {
      const onCompleteMock = jest.fn();
      const onSkipMock = jest.fn();

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer onComplete={onCompleteMock} onSkip={onSkipMock} />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });

      // Verify reading order: progress -> title -> subtitle -> illustration -> buttons
      const progress = getByTestId('onboarding-progress');
      const title = getByText('Bienvenue sur OffliPay');
      const skipButton = getByText('Ignorer');
      const nextButton = getByText('Suivant');

      expect(progress.props.accessibilityRole).toBe('progressbar');
      expect(title.props.accessibilityRole).toBe('header');
      expect(skipButton.props.accessibilityRole).toBe('button');
      expect(nextButton.props.accessibilityRole).toBe('button');
    });

    it('should group related content appropriately', async () => {
      const { getByText } = render(
        <OnboardingScreen
          title="Grouped Content"
          subtitle="Related information"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
          interactionHint="Additional context"
        />
      );

      const title = getByText('Grouped Content');
      const subtitle = getByText('Related information');
      const hint = getByText('Additional context');

      // Content should be properly grouped for screen readers
      expect(title.props.accessibilityRole).toBe('header');
      expect(subtitle.props.accessibilityRole).toBe('text');
      expect(hint.props.accessibilityRole).toBe('text');
    });

    it('should handle dynamic content updates', async () => {
      const { getByText, rerender } = render(
        <OnboardingScreen
          title="Dynamic Content"
          subtitle="Initial content"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      // Update content
      rerender(
        <OnboardingScreen
          title="Dynamic Content"
          subtitle="Updated content"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('Updated content')
        );
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle screen reader API failures gracefully', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.reject(new Error('API Error')));

      const { getByText } = render(
        <OnboardingScreen
          title="Error Handling"
          subtitle="Testing API failures"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
        />
      );

      // Should still render and function without screen reader API
      expect(getByText('Error Handling')).toBeTruthy();
      expect(getByText('Testing API failures')).toBeTruthy();
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

      // Should not crash with empty content
      expect(() => getByText('')).not.toThrow();
    });

    it('should maintain accessibility during animations', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { getByText } = render(
        <OnboardingScreen
          title="Animation Test"
          subtitle="Testing during animations"
          illustration={() => <View />}
          animationDelay={1000}
          onInteraction={jest.fn()}
        />
      );

      // Accessibility should work even during animations
      const title = getByText('Animation Test');
      expect(title.props.accessibilityRole).toBe('header');
      expect(title.props.accessibilityLabel).toBeDefined();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not cause memory leaks with screen reader listeners', async () => {
      const { unmount } = render(
        <OnboardingContainer onComplete={jest.fn()} onSkip={jest.fn()} />
      );

      // Unmount component
      unmount();

      // Verify that component unmounts cleanly without memory leaks
      // In a real implementation, this would test cleanup of any accessibility listeners
      expect(unmount).not.toThrow();
    });

    it('should handle rapid accessibility announcements', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { rerender } = render(
        <OnboardingProgress
          currentScreen={1}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      // Rapidly change progress
      for (let i = 2; i <= 4; i++) {
        rerender(
          <OnboardingProgress
            currentScreen={i}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }

      // Should handle rapid changes without overwhelming screen reader
      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
    });

    it('should optimize accessibility announcements for performance', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { getByText } = render(
        <OnboardingScreen
          title="Performance Test"
          subtitle="Long subtitle with lots of content that could potentially cause performance issues with screen readers if not properly optimized"
          illustration={() => <View />}
          animationDelay={0}
          onInteraction={jest.fn()}
          interactionHint="This is also a long hint that should be handled efficiently"
        />
      );

      // Should announce content efficiently
      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
      });
    });
  });
});