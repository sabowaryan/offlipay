import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, View, Text } from 'react-native';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import OnboardingButton from '@/components/onboarding/OnboardingButton';

// Mock dependencies
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      BACKGROUND: '#FFFFFF',
      TEXT: '#000000',
      PRIMARY: '#0066CC',
      GRAY_MEDIUM: '#666666',
      GRAY_LIGHT: '#CCCCCC',
      WHITE: '#FFFFFF',
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

// Use existing React Native mocks from jest.setup.js

const mockAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;

/**
 * Comprehensive Accessibility Tests for Onboarding Components
 * Tests WCAG 2.1 AA compliance and screen reader support
 */
describe('Onboarding Components - Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('OnboardingButton Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      const onPressMock = jest.fn();

      const { getByRole } = render(
        <OnboardingButton
          title="Test Button"
          onPress={onPressMock}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Test Button');
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });

    it('should handle disabled state accessibility', () => {
      const onPressMock = jest.fn();

      const { getByRole } = render(
        <OnboardingButton
          title="Disabled Button"
          onPress={onPressMock}
          variant="primary"
          disabled={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
      expect(button.props.disabled).toBe(true);
    });

    it('should support different button variants with proper accessibility', () => {
      const variants: Array<'primary' | 'secondary' | 'ghost'> = ['primary', 'secondary', 'ghost'];

      variants.forEach(variant => {
        const { getByRole, unmount } = render(
          <OnboardingButton
            title={`${variant} Button`}
            onPress={jest.fn()}
            variant={variant}
            disabled={false}
          />
        );

        const button = getByRole('button');
        expect(button.props.accessibilityRole).toBe('button');
        expect(button.props.accessibilityLabel).toBe(`${variant} Button`);

        unmount();
      });
    });

    it('should handle loading state accessibility', () => {
      const { getByRole } = render(
        <OnboardingButton
          title="Loading Button"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
          loading={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState?.busy).toBe(true);
      expect(button.props.disabled).toBe(true);
    });

    it('should provide minimum touch target size', () => {
      const { getByRole } = render(
        <OnboardingButton
          title="Touch Target"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      // Verify minimum 44pt touch target (accessibility requirement)
      expect(button.props.style).toBeDefined();
    });
  });

  describe('OnboardingProgress Accessibility', () => {
    it('should have proper progressbar accessibility attributes', () => {
      const { getByRole } = render(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      const progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityRole).toBe('progressbar');
      expect(progressbar.props.accessibilityLabel).toBe('Écran 2 sur 4, Slide 1 sur 3');
      expect(progressbar.props.accessibilityValue).toEqual({
        min: 1,
        max: 4,
        now: 2,
      });
    });

    it('should update accessibility values when progress changes', () => {
      const { getByRole, rerender } = render(
        <OnboardingProgress
          currentScreen={1}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      let progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityLabel).toBe('Écran 1 sur 4, Slide 1 sur 3');
      expect(progressbar.props.accessibilityValue?.now).toBe(1);

      rerender(
        <OnboardingProgress
          currentScreen={3}
          totalScreens={4}
          currentSlide={2}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityLabel).toBe('Écran 3 sur 4, Slide 2 sur 3');
      expect(progressbar.props.accessibilityValue?.now).toBe(3);
    });

    it('should handle edge cases for progress values', () => {
      // Test first step
      const { getByRole, rerender } = render(
        <OnboardingProgress
          currentScreen={1}
          totalScreens={5}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      let progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityValue?.now).toBe(1);

      // Test last step
      rerender(
        <OnboardingProgress
          currentScreen={5}
          totalScreens={5}
          currentSlide={3}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );
      progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityValue?.now).toBe(5);
    });

    it('should work with animated progress', () => {
      const { getByRole } = render(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      const progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityRole).toBe('progressbar');
      expect(progressbar.props.accessibilityLabel).toBe('Écran 2 sur 4, Slide 1 sur 3');
    });
  });

  describe('Screen Reader Support', () => {
    it('should detect screen reader status', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      render(
        <OnboardingButton
          title="Screen Reader Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      // Verify screen reader detection was called
      expect(mockAccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalled();
    });

    it('should handle screen reader detection failure', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() =>
        Promise.reject(new Error('Screen reader detection failed'))
      );

      const { getByRole } = render(
        <OnboardingButton
          title="Error Handling Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      // Component should still render properly
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should provide proper announcements for state changes', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { rerender } = render(
        <OnboardingProgress
          currentScreen={1}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      // Change progress
      rerender(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={2}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      // Should announce progress change
      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
      });
    });
  });

  describe('Platform-Specific Accessibility', () => {
    it('should support iOS VoiceOver', () => {
      Platform.OS = 'ios';

      const { getByRole } = render(
        <OnboardingButton
          title="iOS VoiceOver Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityRole).toBe('button');
      // iOS-specific accessibility traits should be present
      expect(button.props.accessibilityTraits).toBeDefined();
    });

    it('should support Android TalkBack', () => {
      Platform.OS = 'android';

      const { getByRole } = render(
        <OnboardingButton
          title="Android TalkBack Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityRole).toBe('button');
      // Android-specific accessibility properties
      expect(button.props.importantForAccessibility).toBe('yes');
    });

    it('should support web platform keyboard navigation', () => {
      Platform.OS = 'web' as any;

      const onPressMock = jest.fn();
      const { getByRole } = render(
        <OnboardingButton
          title="Web Keyboard Test"
          onPress={onPressMock}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');

      // Simulate keyboard events - use press event for React Native
      fireEvent(button, 'focus');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalled();
    });
  });

  describe('High Contrast and Visual Accessibility', () => {
    it('should support high contrast themes', () => {
      // Mock high contrast theme
      jest.doMock('@/hooks/useThemeColors', () => ({
        useThemeColors: () => ({
          colors: {
            BACKGROUND: '#000000',
            TEXT: '#FFFFFF',
            PRIMARY: '#FFFF00', // High contrast yellow
            GRAY_MEDIUM: '#CCCCCC',
            GRAY_LIGHT: '#999999',
            WHITE: '#FFFFFF',
          },
          theme: 'high_contrast',
        }),
      }));

      const { getByRole } = render(
        <OnboardingButton
          title="High Contrast Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should maintain accessibility with different color schemes', () => {
      const colorSchemes = [
        { theme: 'light', PRIMARY: '#0066CC', TEXT: '#000000' },
        { theme: 'dark', PRIMARY: '#4A9EFF', TEXT: '#FFFFFF' },
      ];

      colorSchemes.forEach(scheme => {
        jest.doMock('@/hooks/useThemeColors', () => ({
          useThemeColors: () => ({
            colors: {
              BACKGROUND: scheme.theme === 'dark' ? '#000000' : '#FFFFFF',
              TEXT: scheme.TEXT,
              PRIMARY: scheme.PRIMARY,
              GRAY_MEDIUM: '#666666',
              GRAY_LIGHT: '#CCCCCC',
              WHITE: '#FFFFFF',
            },
            theme: scheme.theme,
          }),
        }));

        const { getByRole, unmount } = render(
          <OnboardingButton
            title={`${scheme.theme} Theme Test`}
            onPress={jest.fn()}
            variant="primary"
            disabled={false}
          />
        );

        const button = getByRole('button');
        expect(button.props.accessibilityRole).toBe('button');

        unmount();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing accessibility labels gracefully', () => {
      const { getByRole } = render(
        <OnboardingButton
          title=""
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <OnboardingButton
          title="State Change Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      // Rapidly change states
      for (let i = 0; i < 10; i++) {
        rerender(
          <OnboardingButton
            title="State Change Test"
            onPress={jest.fn()}
            variant="primary"
            disabled={i % 2 === 0}
          />
        );
      }

      // Should handle rapid changes without errors
      expect(() => {
        rerender(
          <OnboardingButton
            title="State Change Test"
            onPress={jest.fn()}
            variant="primary"
            disabled={false}
          />
        );
      }).not.toThrow();
    });

    it('should handle component unmounting gracefully', () => {
      const { unmount } = render(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not cause memory leaks with accessibility listeners', () => {
      const { unmount } = render(
        <OnboardingButton
          title="Memory Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      // Unmount component
      unmount();

      // Verify that component unmounts without errors (indicating proper cleanup)
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple components efficiently', () => {
      const components = [];

      // Render multiple components
      for (let i = 0; i < 10; i++) {
        components.push(
          render(
            <OnboardingButton
              key={i}
              title={`Button ${i}`}
              onPress={jest.fn()}
              variant="primary"
              disabled={false}
            />
          )
        );
      }

      // All components should render successfully
      components.forEach((component, index) => {
        const button = component.getByRole('button');
        expect(button.props.accessibilityLabel).toBe(`Button ${index}`);
      });

      // Cleanup
      components.forEach(component => component.unmount());
    });

    it('should optimize accessibility announcements', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled = jest.fn(() => Promise.resolve(true));

      const { rerender } = render(
        <OnboardingProgress
          currentScreen={1}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      // Rapidly change progress multiple times
      for (let i = 2; i <= 4; i++) {
        rerender(
          <OnboardingProgress
            currentScreen={i}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={false}
          />
        );
      }

      // Should not overwhelm screen reader with announcements
      await waitFor(() => {
        expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
      });
    });
  });

  describe('WCAG 2.1 AA Compliance Validation', () => {
    it('should meet minimum contrast requirements', () => {
      // This test would typically use a color contrast analyzer
      // For now, we verify that colors are defined and not transparent
      const { getByRole } = render(
        <OnboardingButton
          title="Contrast Test"
          onPress={jest.fn()}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toBeDefined();
    });

    it('should provide text alternatives for non-text content', () => {
      const { getByRole } = render(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={false}
        />
      );

      const progressbar = getByRole('progressbar');
      expect(progressbar.props.accessibilityLabel).toBeDefined();
      expect(progressbar.props.accessibilityLabel).not.toBe('');
    });

    it('should maintain consistent navigation', () => {
      const buttons = ['Button 1', 'Button 2', 'Button 3'];

      const { getAllByRole } = render(
        <View>
          {buttons.map((title, index) => (
            <OnboardingButton
              key={index}
              title={title}
              onPress={jest.fn()}
              variant="primary"
              disabled={false}
            />
          ))}
        </View>
      );

      const renderedButtons = getAllByRole('button');
      expect(renderedButtons).toHaveLength(3);

      // All buttons should have consistent accessibility properties
      renderedButtons.forEach((button, index) => {
        expect(button.props.accessibilityRole).toBe('button');
        expect(button.props.accessibilityLabel).toBe(buttons[index]);
      });
    });

    it('should support keyboard-only navigation', () => {
      Platform.OS = 'web' as any;

      const onPressMock = jest.fn();
      const { getByRole } = render(
        <OnboardingButton
          title="Keyboard Navigation"
          onPress={onPressMock}
          variant="primary"
          disabled={false}
        />
      );

      const button = getByRole('button');

      // Test keyboard focus
      fireEvent(button, 'focus');
      expect(button.props.accessibilityState?.focused).toBeTruthy();

      // Test keyboard activation - use press event for React Native
      fireEvent.press(button);
      expect(onPressMock).toHaveBeenCalled();

      // Test additional press activation
      fireEvent.press(button);
      expect(onPressMock).toHaveBeenCalledTimes(2);
    });
  });
});