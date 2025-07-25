import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
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
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { OnboardingGestureHandlerProps, SwipeDirection, GestureType, DeviceCapability } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced adaptive thresholds with device capability detection
const DEVICE_THRESHOLDS = {
  low: {
    horizontal: SCREEN_WIDTH * 0.35,
    vertical: SCREEN_HEIGHT * 0.20,
    velocity: 400,
    directionLock: 40,
  },
  medium: {
    horizontal: SCREEN_WIDTH * 0.25,
    vertical: SCREEN_HEIGHT * 0.15,
    velocity: 500,
    directionLock: 30,
  },
  high: {
    horizontal: SCREEN_WIDTH * 0.20,
    vertical: SCREEN_HEIGHT * 0.12,
    velocity: 600,
    directionLock: 25,
  },
};

// Enhanced gesture conflict prevention
const GESTURE_CONFLICT_PREVENTION = {
  DIRECTION_DOMINANCE_RATIO: 1.8, // How much one direction must dominate
  VELOCITY_DOMINANCE_RATIO: 2.0,  // Velocity dominance for quick gestures
  GESTURE_TIMEOUT: 200,            // Timeout for gesture decision
  SIMULTANEOUS_THRESHOLD: 15,      // Threshold for simultaneous gesture detection
  HYSTERESIS_FACTOR: 0.8,         // Hysteresis to prevent direction switching
};

interface EnhancedGestureState {
  isActive: boolean;
  lockedDirection: GestureType | null;
  startTime: number;
  initialDirection: SwipeDirection | null;
  deviceCapability: DeviceCapability;
  gestureHistory: Array<{
    timestamp: number;
    translationX: number;
    translationY: number;
    velocityX: number;
    velocityY: number;
  }>;
  conflictResolutionActive: boolean;
  lastGestureType: GestureType | null;
  consecutiveGestureCount: number;
}

 const OnboardingGestureHandler: React.FC<OnboardingGestureHandlerProps> = ({
  onHorizontalSwipe,
  onVerticalSwipe,
  onTap,
  enabled = true,
  children,
}) => {
  // Animation values for enhanced visual feedback
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotationZ = useSharedValue(0);
  const feedbackIntensity = useSharedValue(0);
  
  // Worklet-safe shared values for gesture state
  const lockedDirection = useSharedValue<GestureType | null>(null);
  const conflictResolutionActive = useSharedValue(false);

  // Device capability detection (moved before gestureState to avoid worklet issues)
  const deviceCapability = useRef<DeviceCapability>('medium');
  
  const detectDeviceCapability = useCallback((): DeviceCapability => {
    const screenSize = SCREEN_WIDTH * SCREEN_HEIGHT;
    const pixelRatio = Platform.select({
      ios: 2,
      android: 1.5,
      default: 1,
    });

    // Enhanced device capability detection based on multiple factors
    if (screenSize > 800000 && pixelRatio >= 2) {
      return 'high';
    } else if (screenSize > 400000 && pixelRatio >= 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }, []);

  // Initialize device capability early
  useEffect(() => {
    deviceCapability.current = detectDeviceCapability();
  }, [detectDeviceCapability]);

  // Enhanced gesture state management (separate from worklet-accessed objects)
  const gestureState = useRef<EnhancedGestureState>({
    isActive: false,
    lockedDirection: null,
    startTime: 0,
    initialDirection: null,
    deviceCapability: deviceCapability.current,
    gestureHistory: [],
    conflictResolutionActive: false,
    lastGestureType: null,
    consecutiveGestureCount: 0,
  });

  const [isGestureActive, setIsGestureActive] = useState(false);
  const [currentLockedDirection, setCurrentLockedDirection] = useState<GestureType | null>(null);
  const [isConflictActive, setIsConflictActive] = useState(false);

  // Enhanced adaptive thresholds based on device capabilities
  const getAdaptiveThresholds = useCallback(() => {
    const capability = gestureState.current.deviceCapability;
    const thresholds = DEVICE_THRESHOLDS[capability];
    
    return {
      horizontal: thresholds.horizontal,
      vertical: thresholds.vertical,
      velocity: thresholds.velocity,
      directionLock: thresholds.directionLock,
    };
  }, []);

  // Add gesture data to history for intelligent analysis
  const addGestureToHistory = useCallback((
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number
  ) => {
    const timestamp = Date.now();
    const history = gestureState.current.gestureHistory;
    
    // Keep only recent history (last 10 entries)
    if (history.length >= 10) {
      history.shift();
    }
    
    history.push({
      timestamp,
      translationX,
      translationY,
      velocityX,
      velocityY,
    });
  }, []);

  // Analyze gesture history for better direction prediction
  const analyzeGesturePattern = useCallback((): {
    dominantDirection: GestureType | null;
    confidence: number;
  } => {
    const history = gestureState.current.gestureHistory;
    if (history.length < 3) {
      return { dominantDirection: null, confidence: 0 };
    }

    let horizontalScore = 0;
    let verticalScore = 0;
    let totalWeight = 0;

    // Analyze recent gesture history with time-based weighting
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const weight = (i + 1) / history.length; // More recent entries have higher weight
      
      const absX = Math.abs(entry.translationX);
      const absY = Math.abs(entry.translationY);
      const absVelX = Math.abs(entry.velocityX);
      const absVelY = Math.abs(entry.velocityY);
      
      horizontalScore += (absX + absVelX * 0.1) * weight;
      verticalScore += (absY + absVelY * 0.1) * weight;
      totalWeight += weight;
    }

    horizontalScore /= totalWeight;
    verticalScore /= totalWeight;

    const total = horizontalScore + verticalScore;
    if (total === 0) {
      return { dominantDirection: null, confidence: 0 };
    }

    const horizontalRatio = horizontalScore / total;
    const verticalRatio = verticalScore / total;
    
    const dominanceThreshold = 0.6; // 60% dominance required
    
    if (horizontalRatio > dominanceThreshold) {
      return { dominantDirection: 'horizontal', confidence: horizontalRatio };
    } else if (verticalRatio > dominanceThreshold) {
      return { dominantDirection: 'vertical', confidence: verticalRatio };
    }
    
    return { dominantDirection: null, confidence: Math.max(horizontalRatio, verticalRatio) };
  }, []);

  // Enhanced intelligent gesture direction detection with conflict resolution
  const determineGestureDirection = useCallback((
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number
  ): { direction: SwipeDirection | null; type: GestureType | null; confidence: number } => {
    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);
    const absVelX = Math.abs(velocityX);
    const absVelY = Math.abs(velocityY);
    const thresholds = getAdaptiveThresholds();

    // Add current gesture data to history for pattern analysis
    addGestureToHistory(translationX, translationY, velocityX, velocityY);

    // If we already have a locked direction, respect it with hysteresis
    if (gestureState.current.lockedDirection) {
      const hysteresisThreshold = thresholds.directionLock * GESTURE_CONFLICT_PREVENTION.HYSTERESIS_FACTOR;
      
      if (gestureState.current.lockedDirection === 'horizontal') {
        // Only unlock if vertical movement becomes significantly dominant
        if (absY > absX * GESTURE_CONFLICT_PREVENTION.DIRECTION_DOMINANCE_RATIO && absY > hysteresisThreshold) {
          gestureState.current.lockedDirection = null;
        } else {
          const direction = translationX > 0 ? 'right' : 'left';
          return { direction, type: 'horizontal', confidence: 0.9 };
        }
      } else if (gestureState.current.lockedDirection === 'vertical') {
        // Only unlock if horizontal movement becomes significantly dominant
        if (absX > absY * GESTURE_CONFLICT_PREVENTION.DIRECTION_DOMINANCE_RATIO && absX > hysteresisThreshold) {
          gestureState.current.lockedDirection = null;
        } else {
          const direction = translationY > 0 ? 'down' : 'up';
          return { direction, type: 'vertical', confidence: 0.9 };
        }
      }
    }

    // Enhanced direction determination using multiple factors
    // Calculate ratios for potential future use in advanced gesture analysis

    // Use gesture pattern analysis for better prediction
    const patternAnalysis = analyzeGesturePattern();
    let patternWeight = 0;
    
    if (patternAnalysis.dominantDirection && patternAnalysis.confidence > 0.7) {
      patternWeight = patternAnalysis.confidence * 0.3; // 30% weight for pattern analysis
    }

    // Calculate confidence scores for each direction
    let horizontalConfidence = 0;
    let verticalConfidence = 0;

    // Distance-based confidence
    if (absX > thresholds.directionLock) {
      horizontalConfidence += Math.min(absX / thresholds.horizontal, 1) * 0.4;
    }
    if (absY > thresholds.directionLock) {
      verticalConfidence += Math.min(absY / thresholds.vertical, 1) * 0.4;
    }

    // Velocity-based confidence
    if (absVelX > thresholds.velocity * 0.5) {
      horizontalConfidence += Math.min(absVelX / thresholds.velocity, 1) * 0.3;
    }
    if (absVelY > thresholds.velocity * 0.5) {
      verticalConfidence += Math.min(absVelY / thresholds.velocity, 1) * 0.3;
    }

    // Pattern-based confidence boost
    if (patternAnalysis.dominantDirection === 'horizontal') {
      horizontalConfidence += patternWeight;
    } else if (patternAnalysis.dominantDirection === 'vertical') {
      verticalConfidence += patternWeight;
    }

    // Dominance ratio check
    const dominanceThreshold = GESTURE_CONFLICT_PREVENTION.DIRECTION_DOMINANCE_RATIO;
    
    // Determine direction with confidence
    if (horizontalConfidence > verticalConfidence) {
      const ratio = horizontalConfidence / (verticalConfidence + 0.1);
      if (ratio >= dominanceThreshold && absX > thresholds.directionLock) {
        gestureState.current.lockedDirection = 'horizontal';
        lockedDirection.value = 'horizontal';
        runOnJS(setCurrentLockedDirection)('horizontal');
        const direction = translationX > 0 ? 'right' : 'left';
        return { direction, type: 'horizontal', confidence: horizontalConfidence };
      }
    } else if (verticalConfidence > horizontalConfidence) {
      const ratio = verticalConfidence / (horizontalConfidence + 0.1);
      if (ratio >= dominanceThreshold && absY > thresholds.directionLock) {
        gestureState.current.lockedDirection = 'vertical';
        lockedDirection.value = 'vertical';
        runOnJS(setCurrentLockedDirection)('vertical');
        const direction = translationY > 0 ? 'down' : 'up';
        return { direction, type: 'vertical', confidence: verticalConfidence };
      }
    }

    // Check for simultaneous gestures (conflict situation)
    const simultaneousThreshold = GESTURE_CONFLICT_PREVENTION.SIMULTANEOUS_THRESHOLD;
    if (absX > simultaneousThreshold && absY > simultaneousThreshold) {
      gestureState.current.conflictResolutionActive = true;
      conflictResolutionActive.value = true;
      runOnJS(setIsConflictActive)(true);
      
      // Use velocity to break ties in simultaneous gestures
      if (absVelX > absVelY * GESTURE_CONFLICT_PREVENTION.VELOCITY_DOMINANCE_RATIO) {
        gestureState.current.lockedDirection = 'horizontal';
        lockedDirection.value = 'horizontal';
        runOnJS(setCurrentLockedDirection)('horizontal');
        const direction = translationX > 0 ? 'right' : 'left';
        return { direction, type: 'horizontal', confidence: 0.6 };
      } else if (absVelY > absVelX * GESTURE_CONFLICT_PREVENTION.VELOCITY_DOMINANCE_RATIO) {
        gestureState.current.lockedDirection = 'vertical';
        lockedDirection.value = 'vertical';
        runOnJS(setCurrentLockedDirection)('vertical');
        const direction = translationY > 0 ? 'down' : 'up';
        return { direction, type: 'vertical', confidence: 0.6 };
      }
    }

    return { direction: null, type: null, confidence: 0 };
  }, [getAdaptiveThresholds, addGestureToHistory, analyzeGesturePattern]);

  // Enhanced differentiated haptic feedback with gesture context
  const provideHapticFeedback = useCallback((
    gestureType: GestureType, 
    direction: SwipeDirection, 
    confidence: number = 1.0
  ) => {
    if (Platform.OS !== 'ios') return;

    try {
      // Track consecutive gestures for adaptive feedback
      if (gestureState.current.lastGestureType === gestureType) {
        gestureState.current.consecutiveGestureCount++;
      } else {
        gestureState.current.consecutiveGestureCount = 1;
        gestureState.current.lastGestureType = gestureType;
      }

      const isConsecutive = gestureState.current.consecutiveGestureCount > 1;
      
      if (gestureType === 'horizontal') {
        // Screen navigation feedback - stronger and more distinct
        if (confidence > 0.8 && !isConsecutive) {
          // High confidence, first gesture - strong feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (confidence > 0.6) {
          // Medium confidence or consecutive - medium feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          // Low confidence - light feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // Slide navigation feedback - lighter and more subtle
        if (confidence > 0.8 && !isConsecutive) {
          // High confidence, first gesture - medium feedback for slides
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          // All other cases - light feedback for slides
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      // Additional feedback for conflict resolution
      if (gestureState.current.conflictResolutionActive && confidence < 0.7) {
        // Subtle notification feedback for uncertain gestures
        setTimeout(() => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch (error) {
            console.warn('Conflict resolution haptic feedback failed:', error);
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, []);

  // Enhanced gesture state reset with history preservation
  const resetGestureState = useCallback(() => {
    const previousHistory = gestureState.current.gestureHistory;
    const previousCapability = gestureState.current.deviceCapability;
    const previousLastGestureType = gestureState.current.lastGestureType;
    const previousConsecutiveCount = gestureState.current.consecutiveGestureCount;

    gestureState.current = {
      isActive: false,
      lockedDirection: null,
      startTime: 0,
      initialDirection: null,
      deviceCapability: previousCapability,
      gestureHistory: previousHistory, // Preserve history for pattern analysis
      conflictResolutionActive: false,
      lastGestureType: previousLastGestureType,
      consecutiveGestureCount: previousConsecutiveCount,
    };
    
    // Reset worklet-safe shared values
    lockedDirection.value = null;
    conflictResolutionActive.value = false;
    
    // Reset UI state
    setIsGestureActive(false);
    setCurrentLockedDirection(null);
    setIsConflictActive(false);
  }, []);

  // Enhanced pan gesture with intelligent direction detection and adaptive feedback
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart((event) => {
      gestureState.current.isActive = true;
      gestureState.current.startTime = Date.now();
      gestureState.current.lockedDirection = null;
      gestureState.current.initialDirection = null;
      gestureState.current.conflictResolutionActive = false;
      
      runOnJS(setIsGestureActive)(true);
      
      // Enhanced visual feedback with device-adaptive animation
      const capability = gestureState.current.deviceCapability;
      const animationConfig = capability === 'high' 
        ? { damping: 25, stiffness: 400 }
        : capability === 'medium'
        ? { damping: 20, stiffness: 300 }
        : { damping: 15, stiffness: 200 };
      
      scale.value = withSpring(0.98, animationConfig);
      feedbackIntensity.value = withTiming(0.2, { duration: 100 });
    })
    .onUpdate((event) => {
      if (!gestureState.current.isActive) return;

      const { translationX, translationY, velocityX, velocityY } = event;
      
      // Enhanced visual feedback with direction-aware dampening
      const dampening = gestureState.current.lockedDirection ? 0.4 : 0.3;
      translateX.value = translationX * dampening;
      translateY.value = translationY * dampening;

      // Determine gesture direction with confidence
      const { direction, type, confidence } = determineGestureDirection(
        translationX,
        translationY,
        velocityX,
        velocityY
      );

      // Store initial direction for consistency
      if (direction && !gestureState.current.initialDirection) {
        gestureState.current.initialDirection = direction;
      }

      // Update feedback intensity based on gesture confidence
      feedbackIntensity.value = withTiming(confidence * 0.5, { duration: 50 });

      // Provide subtle rotation feedback for direction locking
      if (gestureState.current.lockedDirection === 'horizontal') {
        rotationZ.value = withTiming(translationX * 0.001, { duration: 100 });
      } else if (gestureState.current.lockedDirection === 'vertical') {
        rotationZ.value = withTiming(translationY * 0.001, { duration: 100 });
      }
    })
    .onEnd((event) => {
      if (!gestureState.current.isActive) return;

      const { translationX, translationY, velocityX, velocityY } = event;
      const thresholds = getAdaptiveThresholds();
      
      // Determine final gesture direction with confidence
      const { direction, type, confidence } = determineGestureDirection(
        translationX,
        translationY,
        velocityX,
        velocityY
      );

      // Enhanced threshold checking with confidence weighting
      const confidenceMultiplier = Math.max(0.5, confidence); // Minimum 50% threshold reduction
      const adjustedHorizontalThreshold = thresholds.horizontal * (2 - confidenceMultiplier);
      const adjustedVerticalThreshold = thresholds.vertical * (2 - confidenceMultiplier);
      
      const meetsDistanceThreshold = type === 'horizontal' 
        ? Math.abs(translationX) > adjustedHorizontalThreshold
        : Math.abs(translationY) > adjustedVerticalThreshold;
        
      const meetsVelocityThreshold = type === 'horizontal'
        ? Math.abs(velocityX) > thresholds.velocity * (2 - confidenceMultiplier)
        : Math.abs(velocityY) > thresholds.velocity * (2 - confidenceMultiplier);

      // Execute gesture if thresholds are met
      if (direction && type && (meetsDistanceThreshold || meetsVelocityThreshold)) {
        runOnJS(provideHapticFeedback)(type, direction, confidence);
        
        if (type === 'horizontal') {
          runOnJS(onHorizontalSwipe)(direction);
        } else if (type === 'vertical') {
          runOnJS(onVerticalSwipe)(direction);
        }
      }

      // Enhanced visual feedback reset with device-adaptive timing
      const capability = gestureState.current.deviceCapability;
      const resetDuration = capability === 'high' ? 200 : capability === 'medium' ? 250 : 300;
      
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      rotationZ.value = withSpring(0, { damping: 15, stiffness: 200 });
      feedbackIntensity.value = withTiming(0, { duration: resetDuration });

      runOnJS(resetGestureState)();
    })
    .onFinalize(() => {
      // Ensure cleanup on gesture cancellation
      runOnJS(resetGestureState)();
      
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      rotationZ.value = withSpring(0);
      feedbackIntensity.value = withTiming(0, { duration: 200 });
    });

  // Tap gesture for interaction
  const tapGesture = Gesture.Tap()
    .enabled(enabled)
    .onStart(() => {
      // Quick scale animation for tap feedback
      scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 20, stiffness: 400 });
      
      // Light haptic feedback for tap
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Tap haptic feedback failed:', error);
        }
      }
      
      runOnJS(onTap)();
    });

  // Combine gestures with proper conflict resolution
  const combinedGesture = Gesture.Exclusive(
    panGesture,
    tapGesture
  );

  // Enhanced animated styles for visual feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateZ: `${rotationZ.value}rad` },
      ],
      opacity: opacity.value,
    };
  });

  // Enhanced gesture feedback overlay style with intensity
  const overlayStyle = useAnimatedStyle(() => {
    const movement = Math.abs(translateX.value) + Math.abs(translateY.value);
    const baseOpacity = interpolate(
      movement,
      [0, 50, 100],
      [0, 0.1, 0.2],
      'clamp'
    );
    
    // Combine base opacity with feedback intensity
    const finalOpacity = baseOpacity + (feedbackIntensity.value * 0.3);

    return {
      opacity: Math.min(finalOpacity, 0.4), // Cap maximum opacity
      backgroundColor: lockedDirection.value === 'horizontal' 
        ? '#007AFF' 
        : lockedDirection.value === 'vertical'
        ? '#34C759'
        : '#007AFF',
    };
  });

  // Gesture confidence indicator style
  const confidenceIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: feedbackIntensity.value * 2, // Make confidence more visible
      transform: [
        { scale: 1 + feedbackIntensity.value * 0.2 }
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.gestureContainer, animatedStyle]}>
          {/* Enhanced visual feedback overlay with direction-specific colors */}
          <Animated.View style={[styles.feedbackOverlay, overlayStyle]} />
          
          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>

          {/* Enhanced gesture indicators with confidence feedback */}
          {isGestureActive && (
            <View style={styles.gestureIndicators}>
              <Animated.View style={[
                styles.horizontalIndicator,
                confidenceIndicatorStyle,
                {
                  opacity: currentLockedDirection === 'horizontal' ? 1 : 0.3,
                  backgroundColor: currentLockedDirection === 'horizontal' ? '#007AFF' : '#8E8E93',
                }
              ]} />
              <Animated.View style={[
                styles.verticalIndicator,
                confidenceIndicatorStyle,
                {
                  opacity: currentLockedDirection === 'vertical' ? 1 : 0.3,
                  backgroundColor: currentLockedDirection === 'vertical' ? '#34C759' : '#8E8E93',
                }
              ]} />
            </View>
          )}

          {/* Conflict resolution indicator */}
          {isConflictActive && (
            <View style={styles.conflictIndicator}>
              <Animated.View style={[
                styles.conflictDot,
                {
                  opacity: feedbackIntensity.value < 0.5 ? 1 : 0.3,
                }
              ]} />
            </View>
          )}

          {/* Device capability indicator (for debugging/development) */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                {gestureState.current.deviceCapability.toUpperCase()}
              </Text>
            </View>
          )}
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
    backgroundColor: '#007AFF',
    borderRadius: 10,
    zIndex: -1,
  },
  gestureIndicators: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  horizontalIndicator: {
    width: 20,
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  verticalIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  conflictIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  conflictDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FF9500',
    borderRadius: 4,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default OnboardingGestureHandler;