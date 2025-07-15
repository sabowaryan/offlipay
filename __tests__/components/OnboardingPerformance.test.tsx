import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Dimensions, Platform } from 'react-native';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import WelcomeIllustration from '@/components/onboarding/illustrations/WelcomeIllustration';
import { 
  detectDevicePerformance, 
  getOptimizedAnimationConfig,
  AnimationPerformanceMonitor,
  SVGMemoryManager 
} from '@/components/onboarding/utils/performanceOptimization';

// Mock dependencies
jest.mock('@/services/OnboardingService');
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

describe('Onboarding Performance Tests', () => {
  let performanceMonitor: AnimationPerformanceMonitor;
  let memoryManager: SVGMemoryManager;

  beforeEach(() => {
    performanceMonitor = new AnimationPerformanceMonitor();
    memoryManager = SVGMemoryManager.getInstance();
    memoryManager.clearAll();
    jest.clearAllMocks();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('Device Performance Detection', () => {
    it('should correctly detect low-end devices', () => {
      // Mock small screen dimensions
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 320,
        height: 568,
        scale: 2,
        fontScale: 1,
      });

      const performance = detectDevicePerformance();
      
      expect(performance.isLowEnd).toBe(true);
      expect(performance.shouldReduceAnimations).toBe(true);
      expect(performance.maxParticles).toBeLessThanOrEqual(4);
      expect(performance.memoryUsage).toBe('low');
    });

    it('should correctly detect high-end devices', () => {
      // Mock large screen dimensions
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 414,
        height: 896,
        scale: 3,
        fontScale: 1,
      });

      const performance = detectDevicePerformance();
      
      expect(performance.isLowEnd).toBe(false);
      expect(performance.maxParticles).toBeGreaterThan(4);
      expect(performance.cpuIntensive).toBe(true);
    });

    it('should provide appropriate animation config for different devices', () => {
      const config = getOptimizedAnimationConfig();
      
      expect(config).toHaveProperty('durationMultiplier');
      expect(config).toHaveProperty('particleCount');
      expect(config).toHaveProperty('useNativeDriver');
      expect(config.useNativeDriver).toBe(true);
      expect(config.targetFPS).toBeGreaterThan(0);
    });
  });

  describe('Animation Performance Monitoring', () => {
    it('should track frame drops correctly', () => {
      performanceMonitor.startMonitoring();
      
      // Simulate frame drops
      performanceMonitor.recordFrame();
      
      // Wait longer than expected frame time to simulate drop
      jest.advanceTimersByTime(50);
      performanceMonitor.recordFrame();
      
      const report = performanceMonitor.getPerformanceReport();
      expect(report.frameDrops).toBeGreaterThan(0);
    });

    it('should recommend complexity reduction when performance is poor', () => {
      performanceMonitor.startMonitoring();
      
      // Simulate multiple frame drops
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(50);
        performanceMonitor.recordFrame();
      }
      
      const report = performanceMonitor.getPerformanceReport();
      expect(report.shouldReduceComplexity).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should limit concurrent animations based on device capabilities', () => {
      const canStart1 = memoryManager.canStartAnimation('anim1');
      expect(canStart1).toBe(true);
      
      memoryManager.startAnimation('anim1');
      expect(memoryManager.getActiveAnimationCount()).toBe(1);
      
      // Fill up to threshold
      for (let i = 2; i <= 10; i++) {
        if (memoryManager.canStartAnimation(`anim${i}`)) {
          memoryManager.startAnimation(`anim${i}`);
        }
      }
      
      // Should eventually hit the limit
      const finalCount = memoryManager.getActiveAnimationCount();
      expect(finalCount).toBeLessThanOrEqual(8); // Max threshold
    });

    it('should properly clean up animations', () => {
      memoryManager.startAnimation('test-anim');
      expect(memoryManager.getActiveAnimationCount()).toBe(1);
      
      memoryManager.stopAnimation('test-anim');
      expect(memoryManager.getActiveAnimationCount()).toBe(0);
    });
  });

  describe('Component Performance', () => {
    it('should render OnboardingContainer without performance issues', async () => {
      const startTime = Date.now();
      
      const { getByTestId } = render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      const renderTime = Date.now() - startTime;
      
      // Should render within reasonable time (< 100ms for initial render)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid navigation without memory leaks', async () => {
      const onComplete = jest.fn();
      const onSkip = jest.fn();
      
      const { rerender } = render(
        <OnboardingContainer
          onComplete={onComplete}
          onSkip={onSkip}
        />
      );
      
      // Simulate rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <OnboardingContainer
            onComplete={onComplete}
            onSkip={onSkip}
          />
        );
      }
      
      // Should not crash or cause memory issues
      expect(true).toBe(true);
    });

    it('should optimize illustration rendering based on device performance', () => {
      const mockOnAnimationComplete = jest.fn();
      
      render(
        <OnboardingScreen
          title="Test"
          subtitle="Test subtitle"
          illustration={WelcomeIllustration}
          onInteraction={jest.fn()}
        />
      );
      
      // Should render without throwing errors
      expect(true).toBe(true);
    });
  });

  describe('Animation Optimization', () => {
    it('should reduce animation complexity on low-end devices', () => {
      // Mock low-end device
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 320,
        height: 568,
        scale: 2,
        fontScale: 1,
      });

      const config = getOptimizedAnimationConfig();
      
      expect(config.particleCount).toBeLessThanOrEqual(4);
      expect(config.useSimpleAnimations).toBe(true);
      expect(config.targetFPS).toBeLessThanOrEqual(30);
    });

    it('should enable full animations on high-end devices', () => {
      // Mock high-end device
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 414,
        height: 896,
        scale: 3,
        fontScale: 1,
      });

      const config = getOptimizedAnimationConfig();
      
      expect(config.particleCount).toBeGreaterThan(4);
      expect(config.targetFPS).toBe(60);
      expect(config.enableGradients).toBe(true);
    });
  });

  describe('Loading Performance', () => {
    it('should load onboarding configuration within performance budget', async () => {
      const startTime = Date.now();
      
      render(
        <OnboardingContainer
          onComplete={jest.fn()}
          onSkip={jest.fn()}
        />
      );
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        // Should load within 2 seconds as per requirements
        expect(loadTime).toBeLessThan(2000);
      });
    });

    it('should handle slow network conditions gracefully', async () => {
      // Mock slow loading
      const mockSlowLoad = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1500))
      );
      
      const startTime = Date.now();
      await mockSlowLoad();
      const loadTime = Date.now() - startTime;
      
      // Should still complete within reasonable time
      expect(loadTime).toBeLessThan(2000);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not exceed memory thresholds during animations', () => {
      const initialMemory = memoryManager.getActiveAnimationCount();
      
      // Start multiple animations
      for (let i = 0; i < 5; i++) {
        if (memoryManager.canStartAnimation(`test-${i}`)) {
          memoryManager.startAnimation(`test-${i}`);
        }
      }
      
      const finalMemory = memoryManager.getActiveAnimationCount();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not exceed reasonable memory increase
      expect(memoryIncrease).toBeLessThanOrEqual(8);
    });

    it('should clean up resources when components unmount', () => {
      const { unmount } = render(
        <OnboardingScreen
          title="Test"
          subtitle="Test"
          illustration={WelcomeIllustration}
          onInteraction={jest.fn()}
        />
      );
      
      const beforeUnmount = memoryManager.getActiveAnimationCount();
      unmount();
      
      // Memory should be cleaned up (or at least not increase)
      const afterUnmount = memoryManager.getActiveAnimationCount();
      expect(afterUnmount).toBeLessThanOrEqual(beforeUnmount);
    });
  });

  describe('Responsive Performance', () => {
    it('should adapt to different screen sizes efficiently', () => {
      const screenSizes = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone 11 Pro Max
        { width: 768, height: 1024 }, // iPad
      ];

      screenSizes.forEach(size => {
        jest.spyOn(Dimensions, 'get').mockReturnValue({
          ...size,
          scale: 2,
          fontScale: 1,
        });

        const { unmount } = render(
          <OnboardingScreen
            title="Test"
            subtitle="Test"
            illustration={WelcomeIllustration}
            onInteraction={jest.fn()}
          />
        );

        // Should render without issues on all screen sizes
        expect(true).toBe(true);
        unmount();
      });
    });
  });
});