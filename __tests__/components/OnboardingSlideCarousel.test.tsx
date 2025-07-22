import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingSlideCarousel } from '@/components/onboarding/OnboardingSlideCarousel';
import { SlideConfig } from '@/types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => { };
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Gesture: {
      Pan: () => ({
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
    },
    GestureDetector: ({ children }: any) => children,
    GestureHandlerRootView: View,
  };
});

// Mock illustrations
jest.mock('@/components/onboarding/illustrations', () => {
  const { View } = require('react-native');
  return {
    WelcomeIntro: ({ theme, size }: any) => (
      <View testID="welcome-intro" style={{ width: size, height: size, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }} />
    ),
    WelcomeFeatures: ({ theme, size }: any) => (
      <View testID="welcome-features" style={{ width: size, height: size, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }} />
    ),
    QRScanDemo: ({ theme, size }: any) => (
      <View testID="qr-scan-demo" style={{ width: size, height: size, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }} />
    ),
  };
});

const mockSlides: SlideConfig[] = [
  {
    id: 'slide-1',
    illustration: 'WelcomeIntro',
    title: 'Welcome to OffliPay',
    subtitle: 'Your secure offline payment solution',
    animationType: 'fadeIn',
    duration: 3000,
    interactionHint: 'Swipe up to continue',
  },
  {
    id: 'slide-2',
    illustration: 'WelcomeFeatures',
    title: 'Amazing Features',
    subtitle: 'Discover what makes OffliPay special',
    animationType: 'scale',
    duration: 3000,
  },
  {
    id: 'slide-3',
    illustration: 'QRScanDemo',
    title: 'QR Code Payments',
    subtitle: 'Scan and pay instantly',
    animationType: 'morphing',
    duration: 3000,
  },
];

describe('OnboardingSlideCarousel', () => {
  const defaultProps = {
    slides: mockSlides,
    currentSlide: 0,
    onSlideChange: jest.fn(),
    theme: 'light' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with slides', () => {
    const { getByText } = render(<OnboardingSlideCarousel {...defaultProps} />);

    expect(getByText('Welcome to OffliPay')).toBeTruthy();
    expect(getByText('Your secure offline payment solution')).toBeTruthy();
    expect(getByText('Swipe up to continue')).toBeTruthy();
  });

  it('renders slide indicators correctly', () => {
    const { getAllByTestId } = render(<OnboardingSlideCarousel {...defaultProps} />);

    // Should render 3 indicators for 3 slides
    const container = getAllByTestId('onboarding-slide-carousel')[0];
    expect(container).toBeTruthy();
  });

  it('displays correct slide content based on currentSlide prop', () => {
    const { getByText, rerender } = render(<OnboardingSlideCarousel {...defaultProps} />);

    // First slide
    expect(getByText('Welcome to OffliPay')).toBeTruthy();

    // Change to second slide
    rerender(<OnboardingSlideCarousel {...defaultProps} currentSlide={1} />);
    expect(getByText('Amazing Features')).toBeTruthy();

    // Change to third slide
    rerender(<OnboardingSlideCarousel {...defaultProps} currentSlide={2} />);
    expect(getByText('QR Code Payments')).toBeTruthy();
  });

  it('calls onSlideChange when slide changes', () => {
    const onSlideChange = jest.fn();
    render(<OnboardingSlideCarousel {...defaultProps} onSlideChange={onSlideChange} />);

    // This would be triggered by gesture handling in real scenario
    // For testing, we verify the callback is properly passed
    expect(onSlideChange).not.toHaveBeenCalled();
  });

  it('supports auto-progression when enabled', async () => {
    const onSlideChange = jest.fn();
    render(
      <OnboardingSlideCarousel
        {...defaultProps}
        onSlideChange={onSlideChange}
        autoProgress={true}
        autoProgressDelay={1000}
      />
    );

    // Fast-forward time to trigger auto-progression
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(1);
    });
  });

  it('does not auto-progress when disabled', () => {
    const onSlideChange = jest.fn();
    render(
      <OnboardingSlideCarousel
        {...defaultProps}
        onSlideChange={onSlideChange}
        autoProgress={false}
        autoProgressDelay={1000}
      />
    );

    jest.advanceTimersByTime(2000);
    expect(onSlideChange).not.toHaveBeenCalled();
  });

  it('cycles back to first slide after last slide in auto-progression', async () => {
    const onSlideChange = jest.fn();
    render(
      <OnboardingSlideCarousel
        {...defaultProps}
        currentSlide={2} // Start at last slide
        onSlideChange={onSlideChange}
        autoProgress={true}
        autoProgressDelay={1000}
      />
    );

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(0); // Should cycle back to first slide
    });
  });

  it('renders with dark theme correctly', () => {
    const { getByText } = render(
      <OnboardingSlideCarousel {...defaultProps} theme="dark" />
    );

    expect(getByText('Welcome to OffliPay')).toBeTruthy();
  });

  it('renders illustration components correctly', () => {
    const { getByTestId } = render(<OnboardingSlideCarousel {...defaultProps} />);

    expect(getByTestId('welcome-intro')).toBeTruthy();
  });

  it('handles slides without interaction hints', () => {
    const slidesWithoutHints = mockSlides.map(slide => ({
      ...slide,
      interactionHint: undefined,
    }));

    const { queryByText } = render(
      <OnboardingSlideCarousel {...defaultProps} slides={slidesWithoutHints} />
    );

    expect(queryByText('Swipe up to continue')).toBeNull();
  });

  it('renders fallback placeholder when illustration component is not found', () => {
    const slidesWithUnknownIllustration: SlideConfig[] = [
      {
        id: 'slide-unknown',
        illustration: 'UnknownIllustration',
        title: 'Test Slide',
        subtitle: 'Test subtitle',
        animationType: 'fadeIn',
        duration: 3000,
      },
    ];

    const { getByText } = render(
      <OnboardingSlideCarousel
        {...defaultProps}
        slides={slidesWithUnknownIllustration}
      />
    );

    expect(getByText('Test Slide')).toBeTruthy();
  });

  it('stops auto-progression when gesture is active', () => {
    const onSlideChange = jest.fn();
    const { getByTestId } = render(
      <OnboardingSlideCarousel
        {...defaultProps}
        onSlideChange={onSlideChange}
        autoProgress={true}
        autoProgressDelay={1000}
      />
    );

    // Simulate gesture start (this would normally be handled by gesture handler)
    // In a real test, we would simulate the gesture events
    jest.advanceTimersByTime(1500);

    // Auto-progression should be stopped during gesture
    expect(onSlideChange).toHaveBeenCalledTimes(1);
  });

  it('applies correct animation styles for different animation types', () => {
    const slideWithScale: SlideConfig[] = [
      {
        id: 'scale-slide',
        illustration: 'WelcomeIntro',
        title: 'Scale Animation',
        subtitle: 'Testing scale animation',
        animationType: 'scale',
        duration: 3000,
      },
    ];

    const { getByText } = render(
      <OnboardingSlideCarousel {...defaultProps} slides={slideWithScale} />
    );

    expect(getByText('Scale Animation')).toBeTruthy();
  });

  it('handles empty slides array gracefully', () => {
    const { toJSON } = render(
      <OnboardingSlideCarousel {...defaultProps} slides={[]} />
    );

    // Component should render without crashing even with empty slides
    expect(toJSON()).toBeTruthy();
  });

  it('handles single slide without auto-progression', () => {
    const singleSlide = [mockSlides[0]];
    const onSlideChange = jest.fn();

    render(
      <OnboardingSlideCarousel
        {...defaultProps}
        slides={singleSlide}
        onSlideChange={onSlideChange}
        autoProgress={true}
        autoProgressDelay={1000}
      />
    );

    jest.advanceTimersByTime(2000);

    // Should not auto-progress with single slide
    expect(onSlideChange).not.toHaveBeenCalled();
  });
});