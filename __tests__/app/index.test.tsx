import { render, waitFor, act } from '@testing-library/react-native';
import IndexScreen from '@/app/index';
import { OnboardingService } from '@/services/OnboardingService';
import { WalletService } from '@/services/WalletService';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock the OnboardingService
jest.mock('@/services/OnboardingService', () => ({
  OnboardingService: {
    hasSeenOnboarding: jest.fn(),
    markOnboardingCompleted: jest.fn(),
    markOnboardingSkipped: jest.fn(),
  },
}));

// Mock the WalletService
jest.mock('@/services/WalletService', () => ({
  WalletService: {
    loadCurrentUser: jest.fn(),
  },
}));

// Mock the OnboardingContainer component
jest.mock('@/components/onboarding/OnboardingContainer', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) => (
      <View testID="onboarding-container">
        <View testID="complete-button" onTouchEnd={onComplete} />
        <View testID="skip-button" onTouchEnd={onSkip} />
      </View>
    ),
  };
});

describe('IndexScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show onboarding when user has not seen it', async () => {
    // Mock the OnboardingService to return false for hasSeenOnboarding
    (OnboardingService.hasSeenOnboarding as jest.Mock).mockResolvedValue(false);

    // Define the component with proper typing from react-testing-library
    let component: ReturnType<typeof render>;
    await act(async () => {
      component = render(<IndexScreen />);
    });

    await waitFor(() => {
      expect(component.getByTestId('onboarding-container')).toBeTruthy();
    });
  });

  it('should redirect to auth screen when onboarding is completed', async () => {
    // Mock the OnboardingService to return true for hasSeenOnboarding
    (OnboardingService.hasSeenOnboarding as jest.Mock).mockResolvedValue(true);
    // Mock the WalletService to return null for loadCurrentUser
    (WalletService.loadCurrentUser as jest.Mock).mockResolvedValue(null);

    const { queryByTestId } = render(<IndexScreen />);

    await waitFor(() => {
      expect(queryByTestId('onboarding-container')).toBeNull();
    });
  });

  it('should redirect to tabs when user is authenticated', async () => {
    // Mock the OnboardingService to return true for hasSeenOnboarding
    (OnboardingService.hasSeenOnboarding as jest.Mock).mockResolvedValue(true);
    // Mock the WalletService to return a user for loadCurrentUser
    (WalletService.loadCurrentUser as jest.Mock).mockResolvedValue({ id: '123' });

    const { queryByTestId } = render(<IndexScreen />);

    await waitFor(() => {
      expect(queryByTestId('onboarding-container')).toBeNull();
    });
  });

  it('should handle onboarding completion', async () => {
    // Mock the OnboardingService to return false for hasSeenOnboarding
    (OnboardingService.hasSeenOnboarding as jest.Mock).mockResolvedValue(false);

    // Define the component with proper typing from react-testing-library
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<IndexScreen />);
    });

    // Now TypeScript knows component is defined
    const completeButton = component!.getByTestId('complete-button');

    await act(async () => {
      completeButton.props.onTouchEnd();
    });

    await waitFor(() => {
      expect(OnboardingService.markOnboardingCompleted).toHaveBeenCalled();
    });
  });

  it('should handle onboarding skip', async () => {
    // Mock the OnboardingService to return false for hasSeenOnboarding
    (OnboardingService.hasSeenOnboarding as jest.Mock).mockResolvedValue(false);

    // Define the component with proper typing from react-testing-library
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<IndexScreen />);
    });

    // Now TypeScript knows component is defined
    const skipButton = component!.getByTestId('skip-button');

    await act(async () => {
      skipButton.props.onTouchEnd();
    });

    await waitFor(() => {
      expect(OnboardingService.markOnboardingSkipped).toHaveBeenCalled();
    });
  });

  it('should handle errors during initial flow check', async () => {
    // Mock the OnboardingService to throw an error
    (OnboardingService.hasSeenOnboarding as jest.Mock).mockRejectedValue(new Error('Test error'));

    const { queryByTestId } = render(<IndexScreen />);

    await waitFor(() => {
      expect(queryByTestId('onboarding-container')).toBeNull();
    });
  });
});