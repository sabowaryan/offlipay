import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { OnboardingGestureHandlerProps, SwipeDirection } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simplified thresholds
const SWIPE_THRESHOLD_X = SCREEN_WIDTH * 0.25;
const SWIPE_THRESHOLD_Y = SCREEN_HEIGHT * 0.15;
const VELOCITY_THRESHOLD = 500;
const DIRECTION_LOCK_THRESHOLD = 30;

const OnboardingGestureHandler: React.FC<OnboardingGestureHandlerProps> = ({
  onHorizontalSwipe,
  onVerticalSwipe,
  onTap,
  enabled = true,
  children,
}) => {
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Simple state management without refs
  const [isGestureActive, setIsGestureActive] = useState(false);

  // Provide haptic feedback
  const provideHapticFeedback = useCallback((isHorizontal: boolean) => {
    if (Platform.OS === 'ios') {
      try {
        const feedbackType = isHorizontal 
          ? Haptics.ImpactFeedbackStyle.Medium 
          : Haptics.ImpactFeedbackStyle.Light;
        Haptics.impactAsync(feedbackType);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, []);

  // Determine gesture direction
  const determineGestureDirection = useCallback((
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number
  ): { direction: SwipeDirection | null; isHorizontal: boolean } => {
    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);
    const absVelX = Math.abs(velocityX);
    const absVelY = Math.abs(velocityY);

    // Check if movement meets minimum thresholds
    const meetsHorizontalThreshold = absX > DIRECTION_LOCK_THRESHOLD;
    const meetsVerticalThreshold = absY > DIRECTION_LOCK_THRESHOLD;

    if (!meetsHorizontalThreshold && !meetsVerticalThreshold) {
      return { direction: null, isHorizontal: false };
    }

    // Determine dominant direction
    const horizontalDominance = absX + absVelX * 0.1;
    const verticalDominance = absY + absVelY * 0.1;

    if (horizontalDominance > verticalDominance * 1.5) {
      // Horizontal gesture
      const direction = translationX > 0 ? 'right' : 'left';
      return { direction, isHorizontal: true };
    } else if (verticalDominance > horizontalDominance * 1.5) {
      // Vertical gesture
      const direction = translationY > 0 ? 'down' : 'up';
      return { direction, isHorizontal: false };
    }

    return { direction: null, isHorizontal: false };
  }, []);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      setIsGestureActive(true);
      scale.value = withSpring(0.98);
    })
    .onUpdate((event) => {
      const dampening = 0.3;
      translateX.value = event.translationX * dampening;
      translateY.value = event.translationY * dampening;
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      
      const { direction, isHorizontal } = determineGestureDirection(
        translationX,
        translationY,
        velocityX,
        velocityY
      );

      // Check if gesture meets execution thresholds
      const meetsDistanceThreshold = isHorizontal 
        ? Math.abs(translationX) > SWIPE_THRESHOLD_X
        : Math.abs(translationY) > SWIPE_THRESHOLD_Y;
        
      const meetsVelocityThreshold = isHorizontal
        ? Math.abs(velocityX) > VELOCITY_THRESHOLD
        : Math.abs(velocityY) > VELOCITY_THRESHOLD;

      // Execute gesture if thresholds are met
      if (direction && (meetsDistanceThreshold || meetsVelocityThreshold)) {
        runOnJS(provideHapticFeedback)(isHorizontal);
        
        if (isHorizontal) {
          runOnJS(onHorizontalSwipe)(direction);
        } else {
          runOnJS(onVerticalSwipe)(direction);
        }
      }

      // Reset animation values
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      runOnJS(setIsGestureActive)(false);
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      runOnJS(setIsGestureActive)(false);
    });

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .enabled(enabled)
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Tap haptic feedback failed:', error);
        }
      }
      
      runOnJS(onTap)();
    });

  // Combine gestures
  const combinedGesture = Gesture.Exclusive(panGesture, tapGesture);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Feedback overlay style
  const overlayStyle = useAnimatedStyle(() => {
    const movement = Math.abs(translateX.value) + Math.abs(translateY.value);
    const opacity = Math.min(movement / 100 * 0.1, 0.2);
    
    return {
      opacity,
      backgroundColor: '#007AFF',
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.gestureContainer, animatedStyle]}>
          {/* Visual feedback overlay */}
          <Animated.View style={[styles.feedbackOverlay, overlayStyle]} />
          
          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    zIndex: -1,
  },
});

export default OnboardingGestureHandler;