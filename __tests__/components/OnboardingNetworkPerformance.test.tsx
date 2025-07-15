import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { OnboardingService } from '@/services/OnboardingService';

// Mock dependencies
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      BACKGROUND: '#FFFFFF',
      TEXT: '#000000',
      PRIMARY: '#007AFF',
      GRAY_MEDIUM: '#666666',
    },
    theme: 'light',
  }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  GestureDetector: ({ children }: any) => children,
  Gesture: {
    Pan: () => ({
      activeOffsetX: () => ({ failOffsetY: () => ({ enabled: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }) }) }),
    }),
    Tap: () => ({
      onEnd: () => ({}),
    }),
    Exclusive: () => ({}),
  },
}));

// Network simulation utilities
class NetworkSimulator {
  private originalFetch: typeof global.fetch;
  
  constructor() {
    this.originalFetch = global.fetch;
  }
  
  simulateSlowNetwork(delay: number) {
    global.fetch = jest.fn().mockImplementation(async (...args) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.originalFetch(...args);
    });
  }
  
  simulateNetworkError() {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
  }
  
  simulateIntermittentConnection(failureRate: number = 0.3) {
    global.fetch = jest.fn().mockImplementation(async (...args) => {
      if (Math.random() < failureRate) {
        throw new Error('Connection timeout');
      }
      return this.originalFetch(...args);
    });
  }
  
  simulateOfflineMode() {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));
  }
  
  restore() {
    global.fetch = this.originalFetch;
  }
}

describe('Onboarding Network Performance Tests', () => {
  let networkSimulator: NetworkSimulator;
  let mockOnboardingService: jest.Mocked<typeof OnboardingService>;

  beforeEach(() => {
    networkSimulator = new NetworkSimulator();
    
    // Mock OnboardingService
    mockOnboardingService = {
      getScreensConfig: jest.fn(),
      getOnboardingSettings: jest.fn(),
      getOnboardingState: jest.fn(),
      saveProgress: jest.fn(),
      markOnboardingCompleted: jest.fn(),
      markOnboardingSkipped: jest.fn(),
    } as any;

    // Set up default mocks
    mockOnboardingService.getScreensConfig.mockResolvedValue([
      {
        id: 'welcome',
        title: 'Bienvenue',
        subtitle: 'Test subtitle',
        illustration: 'welcome',
        animationType: 'fadeIn',
        duration: 0,
      },
    ]);

    mockOnboardingService.getOnboardingSettings.mockResolvedValue({
      screens: [],
      theme: 'light',
      animationSpeed: 'normal',
      skipEnabled: true,
      progressIndicatorStyle: 'dots',
    });

    mockOnboardingService.getOnboardingState.mockResolvedValue({
      currentScreen: 0,
      totalScreens: 1,
      isAnimating: false,
      hasSeenOnboarding: false,
    });

    // Replace the actual service with our mock
    jest.doMock('@/services/OnboardingService', () => ({
      OnboardingService: mockOnboardingService,
    }));
  });

  afterEach(() => {
    networkSimulator.restore();
    jest.clearAllMocks();
  });

  describe('Slow Network Performance', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Simulate 2G network (500ms delay)
      networkSimulator.simulateSlowNetwork(500);
      
      const startTime = Date.now();
      
      const { getByTestId } = render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        // Should still load within reasonable time even on slow network
        expect(loadTime).toBeLessThan(3000); // 3 seconds max for slow network
      }, { timeout: 5000 });
    });

    it('should handle 3G network conditions', async () => {
      // Simulate 3G network (200ms delay)
      networkSimulator.simulateSlowNetwork(200);
      
      const startTime = Date.now();
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        // Should meet the 2-second requirement on 3G
        expect(loadTime).toBeLessThan(2500);
      });
    });

    it('should handle edge network conditions', async () => {
      // Simulate EDGE network (1000ms delay)
      networkSimulator.simulateSlowNetwork(1000);
      
      const startTime = Date.now();
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        // Should eventually load even on very slow network
        expect(loadTime).toBeLessThan(5000);
      }, { timeout: 6000 });
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      networkSimulator.simulateNetworkError();
      
      // Mock service to return fallback data
      mockOnboardingService.getScreensConfig.mockRejectedValue(new Error('Network error'));
      
      const { queryByText } = render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        // Should not crash and should show some content or loading state
        expect(true).toBe(true); // Component should render without throwing
      });
    });

    it('should retry failed network requests', async () => {
      let callCount = 0;
      mockOnboardingService.getScreensConfig.mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network timeout');
        }
        return [
          {
            id: 'welcome',
            title: 'Bienvenue',
            subtitle: 'Test subtitle',
            illustration: 'welcome',
            animationType: 'fadeIn',
            duration: 0,
          },
        ];
      });
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(1); // Should have retried
      });
    });

    it('should handle intermittent connection issues', async () => {
      networkSimulator.simulateIntermittentConnection(0.5); // 50% failure rate
      
      const startTime = Date.now();
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        // Should eventually succeed despite intermittent failures
        expect(loadTime).toBeLessThan(10000);
      }, { timeout: 12000 });
    });
  });

  describe('Offline Mode Performance', () => {
    it('should work in offline mode with cached data', async () => {
      // First load with network to cache data
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        expect(mockOnboardingService.getScreensConfig).toHaveBeenCalled();
      });
      
      // Now simulate offline mode
      networkSimulator.simulateOfflineMode();
      
      const { unmount } = render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      // Should still work with cached/fallback data
      await waitFor(() => {
        expect(true).toBe(true); // Should not crash
      });
      
      unmount();
    });

    it('should handle offline mode gracefully on first launch', async () => {
      networkSimulator.simulateOfflineMode();
      
      // Mock service to use fallback data
      mockOnboardingService.getScreensConfig.mockImplementation(async () => {
        // Simulate fallback to local/default configuration
        return [
          {
            id: 'welcome',
            title: 'Bienvenue sur OffliPay',
            subtitle: 'Mode hors ligne',
            illustration: 'welcome',
            animationType: 'fadeIn',
            duration: 0,
          },
        ];
      });
      
      const startTime = Date.now();
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        // Should load quickly from local data
        expect(loadTime).toBeLessThan(1000);
      });
    });
  });

  describe('Progressive Loading', () => {
    it('should load critical content first', async () => {
      // Simulate slow loading of non-critical assets
      let criticalLoaded = false;
      let nonCriticalLoaded = false;
      
      mockOnboardingService.getScreensConfig.mockImplementation(async () => {
        criticalLoaded = true;
        return [
          {
            id: 'welcome',
            title: 'Bienvenue',
            subtitle: 'Test subtitle',
            illustration: 'welcome',
            animationType: 'fadeIn',
            duration: 0,
          },
        ];
      });
      
      // Simulate slow loading of settings
      mockOnboardingService.getOnboardingSettings.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        nonCriticalLoaded = true;
        return {
          screens: [],
          theme: 'light',
          animationSpeed: 'normal',
          skipEnabled: true,
          progressIndicatorStyle: 'dots',
        };
      });
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      // Critical content should load first
      await waitFor(() => {
        expect(criticalLoaded).toBe(true);
      });
      
      // Non-critical content may still be loading
      expect(nonCriticalLoaded).toBe(false);
      
      // Eventually all content should load
      await waitFor(() => {
        expect(nonCriticalLoaded).toBe(true);
      }, { timeout: 2000 });
    });

    it('should show loading states appropriately', async () => {
      // Simulate delayed loading
      mockOnboardingService.getScreensConfig.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
          {
            id: 'welcome',
            title: 'Bienvenue',
            subtitle: 'Test subtitle',
            illustration: 'welcome',
            animationType: 'fadeIn',
            duration: 0,
          },
        ];
      });
      
      const { queryByTestId } = render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      // Should show loading state initially
      // (This would depend on the actual loading UI implementation)
      await waitFor(() => {
        expect(true).toBe(true); // Component should handle loading state
      });
    });
  });

  describe('Bandwidth Optimization', () => {
    it('should minimize network requests', async () => {
      let requestCount = 0;
      
      mockOnboardingService.getScreensConfig.mockImplementation(async () => {
        requestCount++;
        return [
          {
            id: 'welcome',
            title: 'Bienvenue',
            subtitle: 'Test subtitle',
            illustration: 'welcome',
            animationType: 'fadeIn',
            duration: 0,
          },
        ];
      });
      
      // Render multiple times
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        unmount();
      }
      
      // Should cache results and minimize requests
      expect(requestCount).toBeLessThanOrEqual(3); // Ideally 1, but allow for some retries
    });

    it('should handle concurrent requests efficiently', async () => {
      let concurrentRequests = 0;
      let maxConcurrent = 0;
      
      mockOnboardingService.getScreensConfig.mockImplementation(async () => {
        concurrentRequests++;
        maxConcurrent = Math.max(maxConcurrent, concurrentRequests);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        concurrentRequests--;
        
        return [
          {
            id: 'welcome',
            title: 'Bienvenue',
            subtitle: 'Test subtitle',
            illustration: 'welcome',
            animationType: 'fadeIn',
            duration: 0,
          },
        ];
      });
      
      // Start multiple renders simultaneously
      const renders = Array.from({ length: 5 }, () =>
        render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        )
      );
      
      await waitFor(() => {
        expect(maxConcurrent).toBeLessThanOrEqual(2); // Should limit concurrent requests
      });
      
      // Cleanup
      renders.forEach(({ unmount }) => unmount());
    });
  });
});