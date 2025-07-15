/**
 * Tests unitaires pour le composant OnboardingProgress
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

describe('OnboardingProgress', () => {
  it('should render correctly with basic props', () => {
    const { getByTestId } = render(
      <OnboardingProgress currentStep={1} totalSteps={4} />
    );

    const progressIndicator = getByTestId('onboarding-progress');
    expect(progressIndicator).toBeTruthy();
  });

  it('should display correct progress value', () => {
    const { getByTestId } = render(
      <OnboardingProgress currentStep={2} totalSteps={4} />
    );

    const progressIndicator = getByTestId('onboarding-progress');
    expect(progressIndicator.props.accessibilityValue).toEqual({
      min: 0,
      max: 4,
      now: 2,
    });
  });

  it('should handle animated prop', () => {
    const { getByTestId } = render(
      <OnboardingProgress currentStep={1} totalSteps={4} animated={true} />
    );

    const progressIndicator = getByTestId('onboarding-progress');
    expect(progressIndicator).toBeTruthy();
  });

  it('should have correct accessibility properties', () => {
    const { getByTestId } = render(
      <OnboardingProgress currentStep={3} totalSteps={5} />
    );

    const progressIndicator = getByTestId('onboarding-progress');
    expect(progressIndicator.props.accessibilityRole).toBe('progressbar');
    expect(progressIndicator.props.accessible).toBe(true);
  });
});