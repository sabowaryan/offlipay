/**
 * Tests for OnboardingProgress component
 * Verifies multi-level progression system functionality
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

// Mock the theme colors hook
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      PRIMARY: '#007AFF',
      GRAY_LIGHT: '#E5E5E7',
      GRAY_MEDIUM: '#8E8E93',
      GRAY_DARK: '#48484A',
    },
  }),
}));

describe('OnboardingProgress Multi-Level System', () => {
  const defaultProps = {
    currentScreen: 1,
    totalScreens: 4,
    currentSlide: 1,
    totalSlides: 3,
    style: 'dots' as const,
    animated: true,
  };

  describe('Basic Rendering', () => {
    it('should render with multi-level progress indicators', () => {
      const { getByTestId } = render(<OnboardingProgress {...defaultProps} />);
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <OnboardingProgress {...defaultProps} testID="custom-progress" />
      );
      expect(getByTestId('custom-progress')).toBeTruthy();
    });

    it('should have correct accessibility properties for multi-level navigation', () => {
      const { getByTestId } = render(<OnboardingProgress {...defaultProps} />);
      const progressElement = getByTestId('onboarding-progress');

      expect(progressElement.props.accessibilityLabel).toBe('Écran 1 sur 4, Slide 1 sur 3');
      expect(progressElement.props.accessibilityRole).toBe('progressbar');
      expect(progressElement.props.accessibilityValue).toEqual({
        min: 1,
        max: 4,
        now: 1,
      });
    });
  });

  describe('Visual Styles', () => {
    const styles = ['dots', 'bars', 'circular', 'minimal'] as const;

    styles.forEach((style) => {
      it(`should render ${style} style with multi-level indicators`, () => {
        const { getByTestId } = render(
          <OnboardingProgress {...defaultProps} style={style} />
        );
        expect(getByTestId('onboarding-progress')).toBeTruthy();
      });
    });

    it('should handle different screen and slide combinations', () => {
      const { getByTestId } = render(
        <OnboardingProgress
          {...defaultProps}
          style="dots"
          totalScreens={5}
          totalSlides={4}
          currentScreen={3}
          currentSlide={2}
        />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });
  });

  describe('Multi-Level Progression Logic', () => {
    it('should correctly display screen and slide progression simultaneously', () => {
      const { getByTestId } = render(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={3}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityLabel).toBe('Écran 2 sur 4, Slide 3 sur 3');
    });

    it('should handle edge cases with single screen/slide', () => {
      const { getByTestId } = render(
        <OnboardingProgress
          {...defaultProps}
          totalScreens={1}
          totalSlides={1}
          currentScreen={1}
          currentSlide={1}
        />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });

    it('should handle zero values gracefully', () => {
      const { getByTestId } = render(
        <OnboardingProgress
          currentScreen={0}
          totalScreens={0}
          currentSlide={0}
          totalSlides={0}
          style="dots"
          animated={true}
        />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });

    it('should handle large numbers of screens and slides', () => {
      const { getByTestId } = render(
        <OnboardingProgress
          currentScreen={5}
          totalScreens={10}
          currentSlide={3}
          totalSlides={8}
          style="dots"
          animated={true}
        />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });
  });

  describe('Animation States', () => {
    it('should render with animations enabled', () => {
      const { getByTestId } = render(
        <OnboardingProgress {...defaultProps} animated={true} />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });

    it('should render with animations disabled', () => {
      const { getByTestId } = render(
        <OnboardingProgress {...defaultProps} animated={false} />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });

    it('should handle circular style with continuous animations', () => {
      const { getByTestId } = render(
        <OnboardingProgress {...defaultProps} style="circular" animated={true} />
      );
      expect(getByTestId('onboarding-progress')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('should update accessibility label when progress changes', () => {
      const { getByTestId, rerender } = render(
        <OnboardingProgress {...defaultProps} />
      );

      rerender(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={3}
          currentSlide={2}
        />
      );

      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityLabel).toBe('Écran 3 sur 4, Slide 2 sur 3');
    });

    it('should maintain proper accessibility role', () => {
      const { getByTestId } = render(<OnboardingProgress {...defaultProps} />);
      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityRole).toBe('progressbar');
    });

    it('should provide correct accessibility values for different screen counts', () => {
      const { getByTestId } = render(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={2}
          totalScreens={5}
        />
      );

      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityValue).toEqual({
        min: 1,
        max: 5,
        now: 2,
      });
    });
  });

  describe('Multi-Directional Navigation Synchronization', () => {
    it('should synchronize with horizontal navigation (screen changes)', () => {
      const { getByTestId, rerender } = render(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={1}
          currentSlide={1}
        />
      );

      // Simulate horizontal navigation (screen change)
      rerender(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={2}
          currentSlide={1}
        />
      );

      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityLabel).toBe('Écran 2 sur 4, Slide 1 sur 3');
    });

    it('should synchronize with vertical navigation (slide changes)', () => {
      const { getByTestId, rerender } = render(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={2}
          currentSlide={1}
        />
      );

      // Simulate vertical navigation (slide change)
      rerender(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={2}
          currentSlide={3}
        />
      );

      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityLabel).toBe('Écran 2 sur 4, Slide 3 sur 3');
    });

    it('should handle complex navigation patterns', () => {
      const { getByTestId, rerender } = render(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={1}
          currentSlide={1}
        />
      );

      // Navigate through slides on first screen
      rerender(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={1}
          currentSlide={2}
        />
      );

      // Move to next screen and reset slide
      rerender(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={2}
          currentSlide={1}
        />
      );

      // Navigate through slides on second screen
      rerender(
        <OnboardingProgress
          {...defaultProps}
          currentScreen={2}
          currentSlide={3}
        />
      );

      const progressElement = getByTestId('onboarding-progress');
      expect(progressElement.props.accessibilityLabel).toBe('Écran 2 sur 4, Slide 3 sur 3');
    });
  });
});