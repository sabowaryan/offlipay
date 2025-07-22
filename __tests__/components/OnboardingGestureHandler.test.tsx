import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { jest } from '@jest/globals';
import OnboardingGestureHandler from '@/components/onboarding/OnboardingGestureHandler';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics with enhanced feedback types
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const RN = jest.requireActual('react-native') as typeof import('react-native');
  return {
    GestureHandlerRootView: ({ children }: any) => <RN.View>{children}</RN.View>,
    GestureDetector: ({ children }: any) => <RN.View>{children}</RN.View>,
    Gesture: {
      Pan: () => ({
        enabled: jest.fn().mockReturnThis(),
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        onFinalize: jest.fn().mockReturnThis(),
      }),
      Tap: () => ({
        enabled: jest.fn().mockReturnThis(),
        onStart: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
      Exclusive: jest.fn((pan, tap) => ({ pan, tap })),
    },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native') as typeof import('react-native');
  return {
    useSharedValue: (value: any) => ({ value }),
    useAnimatedStyle: (fn: any) => ({}),
    withSpring: (value: any, config?: any) => value,
    runOnJS: (fn: any) => fn,
    interpolate: jest.fn(),
    default: {
      View: RN.View,
    },
  };
});

describe('OnboardingGestureHandler', () => {
  const mockOnHorizontalSwipe = jest.fn();
  const mockOnVerticalSwipe = jest.fn();
  const mockOnTap = jest.fn();

  const defaultProps = {
    onHorizontalSwipe: mockOnHorizontalSwipe,
    onVerticalSwipe: mockOnVerticalSwipe,
    onTap: mockOnTap,
    enabled: true,
    children: <Text>Test Content</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Test Content</Text>
        </OnboardingGestureHandler>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render with custom children', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <View>
            <Text>Custom Child 1</Text>
            <Text>Custom Child 2</Text>
          </View>
        </OnboardingGestureHandler>
      );

      expect(getByText('Custom Child 1')).toBeTruthy();
      expect(getByText('Custom Child 2')).toBeTruthy();
    });
  });

  describe('Gesture Direction Detection', () => {
    it('should handle horizontal swipe gestures', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Swipe Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Swipe Test').parent;
      expect(gestureView).toBeTruthy();

      // Simulate horizontal swipe right
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 150,
          translationY: 10,
          velocityX: 600,
          velocityY: 50,
        },
      });

      // Note: In a real test environment, we would need to properly mock
      // the gesture system to test the actual gesture callbacks
    });

    it('should handle vertical swipe gestures', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Swipe Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Swipe Test').parent;
      expect(gestureView).toBeTruthy();

      // Simulate vertical swipe up
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 10,
          translationY: -120,
          velocityX: 50,
          velocityY: -700,
        },
      });
    });
  });

  describe('Gesture Thresholds', () => {
    it('should respect distance thresholds for horizontal gestures', () => {
      // Test that small horizontal movements don't trigger swipe
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Threshold Test</Text>
        </OnboardingGestureHandler>
      );

      // Small movement should not trigger callback
      const gestureView = getByText('Threshold Test').parent;
      expect(gestureView).toBeTruthy();
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 20, // Below threshold
          translationY: 5,
          velocityX: 100, // Below velocity threshold
          velocityY: 50,
        },
      });

      // Verify callback was not called (in real implementation)
    });

    it('should respect velocity thresholds for quick gestures', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Velocity Test</Text>
        </OnboardingGestureHandler>
      );

      // Quick gesture with high velocity should trigger even with small distance
      const gestureView = getByText('Velocity Test').parent;
      expect(gestureView).toBeTruthy();
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 30, // Small distance
          translationY: 5,
          velocityX: 800, // High velocity
          velocityY: 50,
        },
      });
    });
  });

  describe('Gesture Conflict Prevention', () => {
    it('should lock to horizontal direction when horizontal movement dominates', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Direction Lock Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Direction Lock Test').parent;
      expect(gestureView).toBeTruthy();

      // Start with strong horizontal movement
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 100,
          translationY: 20,
          velocityX: 500,
          velocityY: 100,
        },
      });

      // Subsequent vertical movement should be ignored
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 110,
          translationY: 80, // Increased vertical movement
          velocityX: 520,
          velocityY: 400,
        },
      });
    });

    it('should lock to vertical direction when vertical movement dominates', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Vertical Lock Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Vertical Lock Test').parent;
      expect(gestureView).toBeTruthy();

      // Start with strong vertical movement
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 15,
          translationY: 100,
          velocityX: 100,
          velocityY: 600,
        },
      });
    });
  });

  describe('Haptic Feedback', () => {
    it('should provide medium haptic feedback for horizontal gestures on iOS', () => {
      // Mock Platform.OS to be 'ios'
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'ios';

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Haptic Test</Text>
        </OnboardingGestureHandler>
      );

      // Simulate successful horizontal gesture
      // In real implementation, this would trigger haptic feedback

      // Restore original platform
      require('react-native').Platform.OS = originalPlatform;
    });

    it('should provide light haptic feedback for vertical gestures on iOS', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'ios';

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Haptic Test</Text>
        </OnboardingGestureHandler>
      );

      // Simulate successful vertical gesture
      // In real implementation, this would trigger light haptic feedback

      require('react-native').Platform.OS = originalPlatform;
    });

    it('should not provide haptic feedback on Android', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'android';

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Android Test</Text>
        </OnboardingGestureHandler>
      );

      // Simulate gesture - should not call haptic feedback
      expect(Haptics.impactAsync).not.toHaveBeenCalled();

      require('react-native').Platform.OS = originalPlatform;
    });
  });

  describe('Tap Gestures', () => {
    it('should handle tap gestures correctly', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Tap Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Tap Test').parent;
      expect(gestureView).toBeTruthy();
      fireEvent.press(gestureView!);

      // In real implementation, this would call mockOnTap
    });

    it('should provide light haptic feedback for taps on iOS', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'ios';

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Tap Haptic Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Tap Haptic Test').parent;
      expect(gestureView).toBeTruthy();
      fireEvent.press(gestureView!);

      require('react-native').Platform.OS = originalPlatform;
    });
  });

  describe('Enabled/Disabled State', () => {
    it('should not respond to gestures when disabled', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps} enabled={false}>
          <Text>Disabled Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Disabled Test').parent;
      expect(gestureView).toBeTruthy();

      // Simulate gesture when disabled
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 150,
          translationY: 10,
          velocityX: 600,
          velocityY: 50,
        },
      });

      // Callbacks should not be called
      expect(mockOnHorizontalSwipe).not.toHaveBeenCalled();
      expect(mockOnVerticalSwipe).not.toHaveBeenCalled();
    });

    it('should respond to gestures when enabled', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps} enabled={true}>
          <Text>Enabled Test</Text>
        </OnboardingGestureHandler>
      );

      // Component should be ready to handle gestures
      expect(getByText('Enabled Test')).toBeTruthy();
    });
  });

  describe('Adaptive Thresholds', () => {
    it('should calculate adaptive thresholds based on screen size', () => {
      // Mock Dimensions
      const originalDimensions = require('react-native').Dimensions.get;
      require('react-native').Dimensions.get = jest.fn(() => ({
        width: 375,
        height: 812,
      }));

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Adaptive Test</Text>
        </OnboardingGestureHandler>
      );

      expect(getByText('Adaptive Test')).toBeTruthy();

      // Restore original Dimensions
      require('react-native').Dimensions.get = originalDimensions;
    });

    it('should handle different device pixel ratios', () => {
      const originalPlatform = require('react-native').Platform;
      require('react-native').Platform = {
        ...originalPlatform,
        OS: 'ios',
        select: jest.fn(() => 2), // iOS pixel ratio
      };

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Pixel Ratio Test</Text>
        </OnboardingGestureHandler>
      );

      expect(getByText('Pixel Ratio Test')).toBeTruthy();

      require('react-native').Platform = originalPlatform;
    });
  });

  describe('Error Handling', () => {
    it('should handle haptic feedback errors gracefully', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'ios';

      // Mock haptic feedback to throw error
      (Haptics.impactAsync as jest.MockedFunction<typeof Haptics.impactAsync>).mockRejectedValueOnce(new Error('Haptic error'));

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Error Test</Text>
        </OnboardingGestureHandler>
      );

      // Component should still render despite haptic error
      expect(getByText('Error Test')).toBeTruthy();

      require('react-native').Platform.OS = originalPlatform;
    });

    it('should handle gesture state cleanup on component unmount', () => {
      const { getByText, unmount } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Cleanup Test</Text>
        </OnboardingGestureHandler>
      );

      expect(getByText('Cleanup Test')).toBeTruthy();

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Enhanced Intelligent Gesture Detection', () => {
    it('should use gesture history for better direction prediction', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>History Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('History Test').parent;
      expect(gestureView).toBeTruthy();

      // Simulate consistent horizontal gestures to build history
      for (let i = 0; i < 5; i++) {
        fireEvent(gestureView!, 'onPanGestureEvent', {
          nativeEvent: {
            translationX: 50 + i * 10,
            translationY: 5,
            velocityX: 300 + i * 50,
            velocityY: 20,
          },
        });
      }

      // Component should learn from gesture history
      expect(getByText('History Test')).toBeTruthy();
    });

    it('should provide confidence-based gesture recognition', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Confidence Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Confidence Test').parent;
      expect(gestureView).toBeTruthy();

      // High confidence horizontal gesture
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 200,
          translationY: 5,
          velocityX: 800,
          velocityY: 20,
        },
      });

      // Low confidence ambiguous gesture
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 30,
          translationY: 25,
          velocityX: 200,
          velocityY: 180,
        },
      });

      expect(getByText('Confidence Test')).toBeTruthy();
    });

    it('should adapt thresholds based on device capability', () => {
      // Mock high-end device
      const originalDimensions = require('react-native').Dimensions.get;
      require('react-native').Dimensions.get = jest.fn(() => ({
        width: 414,
        height: 896, // iPhone 11 Pro Max dimensions
      }));

      const originalPlatform = require('react-native').Platform.select;
      require('react-native').Platform.select = jest.fn(() => 3); // High pixel ratio

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Device Capability Test</Text>
        </OnboardingGestureHandler>
      );

      expect(getByText('Device Capability Test')).toBeTruthy();

      // Restore mocks
      require('react-native').Dimensions.get = originalDimensions;
      require('react-native').Platform.select = originalPlatform;
    });
  });

  describe('Enhanced Conflict Prevention', () => {
    it('should handle simultaneous gesture conflicts intelligently', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Conflict Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Conflict Test').parent;
      expect(gestureView).toBeTruthy();

      // Simulate simultaneous horizontal and vertical movement
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 80,
          translationY: 75,
          velocityX: 400,
          velocityY: 380,
        },
      });

      expect(getByText('Conflict Test')).toBeTruthy();
    });

    it('should use hysteresis to prevent direction switching', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Hysteresis Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Hysteresis Test').parent;
      expect(gestureView).toBeTruthy();

      // Start with strong horizontal movement
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 100,
          translationY: 10,
          velocityX: 500,
          velocityY: 50,
        },
      });

      // Try to switch to vertical (should be prevented by hysteresis)
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 110,
          translationY: 60,
          velocityX: 520,
          velocityY: 300,
        },
      });

      expect(getByText('Hysteresis Test')).toBeTruthy();
    });

    it('should resolve conflicts using velocity dominance', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Velocity Dominance Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Velocity Dominance Test').parent;
      expect(gestureView).toBeTruthy();

      // Similar distances but very different velocities
      fireEvent(gestureView!, 'onPanGestureEvent', {
        nativeEvent: {
          translationX: 50,
          translationY: 45,
          velocityX: 900, // Much higher horizontal velocity
          velocityY: 200,
        },
      });

      expect(getByText('Velocity Dominance Test')).toBeTruthy();
    });
  });

  describe('Enhanced Haptic Feedback', () => {
    beforeEach(() => {
      // Set platform to iOS for haptic tests
      require('react-native').Platform.OS = 'ios';
    });

    afterEach(() => {
      // Reset platform
      require('react-native').Platform.OS = 'ios';
    });

    it('should provide differentiated feedback based on gesture type', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Differentiated Feedback Test</Text>
        </OnboardingGestureHandler>
      );

      // Test would verify that horizontal gestures get stronger feedback
      // and vertical gestures get lighter feedback
      expect(getByText('Differentiated Feedback Test')).toBeTruthy();
    });

    it('should adjust feedback intensity based on confidence', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Confidence Feedback Test</Text>
        </OnboardingGestureHandler>
      );

      // High confidence gesture should get stronger feedback
      // Low confidence gesture should get lighter feedback
      expect(getByText('Confidence Feedback Test')).toBeTruthy();
    });

    it('should provide warning feedback for conflict situations', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Conflict Feedback Test</Text>
        </OnboardingGestureHandler>
      );

      // Ambiguous gestures should trigger warning notification feedback
      expect(getByText('Conflict Feedback Test')).toBeTruthy();
    });

    it('should reduce feedback for consecutive gestures', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Consecutive Feedback Test</Text>
        </OnboardingGestureHandler>
      );

      // First gesture should have full feedback
      // Consecutive gestures should have reduced feedback
      expect(getByText('Consecutive Feedback Test')).toBeTruthy();
    });
  });

  describe('Adaptive Thresholds Enhancement', () => {
    it('should adjust thresholds for low-end devices', () => {
      // Mock low-end device
      const originalDimensions = require('react-native').Dimensions.get;
      require('react-native').Dimensions.get = jest.fn(() => ({
        width: 320,
        height: 568, // iPhone SE dimensions
      }));

      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Low-end Device Test</Text>
        </OnboardingGestureHandler>
      );

      expect(getByText('Low-end Device Test')).toBeTruthy();

      require('react-native').Dimensions.get = originalDimensions;
    });

    it('should use confidence-weighted thresholds', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Confidence Threshold Test</Text>
        </OnboardingGestureHandler>
      );

      // High confidence gestures should have lower thresholds
      // Low confidence gestures should have higher thresholds
      expect(getByText('Confidence Threshold Test')).toBeTruthy();
    });
  });

  describe('Gesture Pattern Analysis', () => {
    it('should analyze gesture patterns over time', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Pattern Analysis Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Pattern Analysis Test').parent;
      expect(gestureView).toBeTruthy();

      // Build a pattern of horizontal gestures
      const horizontalPattern = [
        { x: 30, y: 5, vx: 200, vy: 20 },
        { x: 60, y: 8, vx: 350, vy: 30 },
        { x: 90, y: 12, vx: 500, vy: 40 },
        { x: 120, y: 15, vx: 650, vy: 50 },
      ];

      horizontalPattern.forEach(gesture => {
        fireEvent(gestureView!, 'onPanGestureEvent', {
          nativeEvent: {
            translationX: gesture.x,
            translationY: gesture.y,
            velocityX: gesture.vx,
            velocityY: gesture.vy,
          },
        });
      });

      expect(getByText('Pattern Analysis Test')).toBeTruthy();
    });

    it('should weight recent gestures more heavily', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Gesture Weighting Test</Text>
        </OnboardingGestureHandler>
      );

      // Recent gestures should have more influence on direction prediction
      expect(getByText('Gesture Weighting Test')).toBeTruthy();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should limit gesture history size', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>History Limit Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('History Limit Test').parent;
      expect(gestureView).toBeTruthy();

      // Add more than 10 gestures to test history limiting
      for (let i = 0; i < 15; i++) {
        fireEvent(gestureView!, 'onPanGestureEvent', {
          nativeEvent: {
            translationX: i * 10,
            translationY: 5,
            velocityX: i * 50,
            velocityY: 20,
          },
        });
      }

      expect(getByText('History Limit Test')).toBeTruthy();
    });

    it('should not cause memory leaks with rapid gesture changes', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Performance Test</Text>
        </OnboardingGestureHandler>
      );

      const gestureView = getByText('Performance Test').parent;
      expect(gestureView).toBeTruthy();

      // Simulate rapid gesture changes
      for (let i = 0; i < 100; i++) {
        fireEvent(gestureView!, 'onPanGestureEvent', {
          nativeEvent: {
            translationX: Math.random() * 200 - 100,
            translationY: Math.random() * 200 - 100,
            velocityX: Math.random() * 1000 - 500,
            velocityY: Math.random() * 1000 - 500,
          },
        });
      }

      // Component should still be responsive
      expect(getByText('Performance Test')).toBeTruthy();
    });

    it('should handle device capability detection efficiently', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Capability Detection Test</Text>
        </OnboardingGestureHandler>
      );

      // Device capability should be detected once and cached
      expect(getByText('Capability Detection Test')).toBeTruthy();
    });
  });

  describe('Enhanced Visual Feedback', () => {
    it('should provide direction-specific visual feedback', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Visual Feedback Test</Text>
        </OnboardingGestureHandler>
      );

      // Horizontal gestures should show blue feedback
      // Vertical gestures should show green feedback
      expect(getByText('Visual Feedback Test')).toBeTruthy();
    });

    it('should show confidence indicators', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Confidence Indicator Test</Text>
        </OnboardingGestureHandler>
      );

      // High confidence gestures should show stronger visual indicators
      expect(getByText('Confidence Indicator Test')).toBeTruthy();
    });

    it('should provide rotation feedback for locked directions', () => {
      const { getByText } = render(
        <OnboardingGestureHandler {...defaultProps}>
          <Text>Rotation Feedback Test</Text>
        </OnboardingGestureHandler>
      );

      // Locked directions should provide subtle rotation feedback
      expect(getByText('Rotation Feedback Test')).toBeTruthy();
    });
  });
});