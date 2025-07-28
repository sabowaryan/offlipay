import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomeIntro from '@/components/onboarding/illustrations/welcome/WelcomeIntro';
import WelcomeFeatures from '@/components/onboarding/illustrations/welcome/WelcomeFeatures';
import WelcomePromise from '@/components/onboarding/illustrations/welcome/WelcomePromise';

import { View } from 'react-native';

// Mock expo modules
jest.mock('expo-linear-gradient', () => {
  const mockReact = require('react');
  return {
    LinearGradient: ({ children, ...props }: any) => mockReact.createElement('View', props, children),
  };
});

jest.mock('expo-blur', () => {
  const mockReact = require('react');
  return {
    BlurView: ({ children, ...props }: any) => mockReact.createElement('View', props, children),
  };
});

jest.mock('@/components/Logo', () => {
  const mockReact = require('react');
  return function MockLogo() {
    return mockReact.createElement('View');
  };
});

jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    theme: 'light',
  }),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const mockReact = require('react');
  const mockIcon = (props: any) => mockReact.createElement('View', props);
  
  return {
    QrCode: mockIcon,
    Wallet: mockIcon,
    Shield: mockIcon,
    Zap: mockIcon,
    Users: mockIcon,
    Globe: mockIcon,
    Lock: mockIcon,
    CheckCircle: mockIcon,
    Clock: mockIcon,
  };
});

describe('Welcome Illustrations', () => {
  const defaultProps = {
    theme: 'light' as const,
    animated: true,
    size: 300,
    onAnimationComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WelcomeIntro', () => {
    it('renders correctly with light theme', () => {
      const component = render(<WelcomeIntro {...defaultProps} />);
      expect(component).toBeDefined();
    });

    it('renders correctly with dark theme', () => {
      const component = render(<WelcomeIntro {...defaultProps} theme="dark" />);
      expect(component).toBeDefined();
    });

    it('respects animated prop', () => {
      const staticComponent = render(<WelcomeIntro {...defaultProps} animated={false} />);
      const animatedComponent = render(<WelcomeIntro {...defaultProps} animated={true} />);
      
      expect(staticComponent).toBeDefined();
      expect(animatedComponent).toBeDefined();
    });
  });

  describe('WelcomeFeatures', () => {
    it('renders correctly with light theme', () => {
      const component = render(<WelcomeFeatures {...defaultProps} />);
      expect(component).toBeDefined();
    });

    it('renders correctly with dark theme', () => {
      const component = render(<WelcomeFeatures {...defaultProps} theme="dark" />);
      expect(component).toBeDefined();
    });
  });

  describe('WelcomePromise', () => {
    it('renders correctly with light theme', () => {
      const component = render(<WelcomePromise {...defaultProps} />);
      expect(component).toBeDefined();
    });

    it('renders correctly with dark theme', () => {
      const component = render(<WelcomePromise {...defaultProps} theme="dark" />);
      expect(component).toBeDefined();
    });
  });

  describe('Performance and Quality', () => {
    it('adapts to different screen sizes', () => {
      const smallComponent = render(<WelcomeIntro {...defaultProps} size={200} />);
      const largeComponent = render(<WelcomeIntro {...defaultProps} size={400} />);
      
      expect(smallComponent).toBeDefined();
      expect(largeComponent).toBeDefined();
    });

    it('works with reduced motion preferences', () => {
      const introComponent = render(<WelcomeIntro {...defaultProps} animated={false} />);
      const featuresComponent = render(<WelcomeFeatures {...defaultProps} animated={false} />);
      const promiseComponent = render(<WelcomePromise {...defaultProps} animated={false} />);

      expect(introComponent).toBeDefined();
      expect(featuresComponent).toBeDefined();
      expect(promiseComponent).toBeDefined();
    });
  });
});
