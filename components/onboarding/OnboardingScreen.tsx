import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { OnboardingScreenProps } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  title,
  subtitle,
  illustration: Illustration,
  animationDelay = 0,
  onInteraction,
  interactionHint,
}) => {
  const { colors, theme } = useThemeColors();

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.9);
  const illustrationScale = useSharedValue(0.8);
  const illustrationOpacity = useSharedValue(0);

  // Create gesture handlers using the new API
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onInteraction) {
        // Add haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onInteraction();
      }
    });

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // Detect swipe direction and threshold
      if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
        if (onInteraction) {
          onInteraction();
        }
      }
    });

  // Combine gestures
  const combinedGestures = Gesture.Exclusive(tapGesture, swipeGesture);

  // Entry animations
  useEffect(() => {
    const startAnimations = () => {
      // Main content animation
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, { duration: 600 })
      );

      translateY.value = withDelay(
        animationDelay,
        withSpring(0, {
          damping: 15,
          stiffness: 150,
        })
      );

      scale.value = withDelay(
        animationDelay,
        withSpring(1, {
          damping: 12,
          stiffness: 100,
        })
      );

      // Illustration animation with slight delay
      illustrationOpacity.value = withDelay(
        animationDelay + 200,
        withTiming(1, { duration: 800 })
      );

      illustrationScale.value = withDelay(
        animationDelay + 200,
        withSpring(1, {
          damping: 10,
          stiffness: 80,
        })
      );
    };

    startAnimations();
  }, [animationDelay]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.value,
    transform: [{ scale: illustrationScale.value }],
  }));

  // Accessibility announcements
  useEffect(() => {
    const announceScreen = () => {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        AccessibilityInfo.announceForAccessibility(
          `${title}. ${subtitle}. ${interactionHint || 'Appuyez pour continuer'}`
        );
      }
    };

    const timer = setTimeout(announceScreen, animationDelay + 1000);
    return () => clearTimeout(timer);
  }, [title, subtitle, interactionHint, animationDelay]);

  const styles = createStyles(colors);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={combinedGestures}>
        <Animated.View style={[styles.content, containerAnimatedStyle]}>
          {/* Illustration Container */}
          <Animated.View style={[styles.illustrationContainer, illustrationAnimatedStyle]}>
            <Illustration
              animated={true}
              theme={theme}
              onAnimationComplete={() => {
                // Optional callback when illustration animation completes
              }}
            />
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: colors.TEXT }]}
              accessibilityRole="header"
              aria-level={1}
            >
              {title}
            </Text>

            <Text
              style={[styles.subtitle, { color: colors.GRAY_MEDIUM }]}
              accessibilityRole="text"
            >
              {subtitle}
            </Text>

            {/* Interaction Hint */}
            {interactionHint && (
              <Text
                style={[styles.hint, { color: colors.PRIMARY }]}
                accessibilityRole="text"
                accessibilityHint="Instruction d'interaction"
              >
                {interactionHint}
              </Text>
            )}
          </View>

          {/* Invisible interaction area for better accessibility */}
          <TouchableOpacity
            style={styles.accessibilityButton}
            onPress={onInteraction}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${subtitle}`}
            accessibilityHint={interactionHint || 'Appuyez pour continuer vers l\'écran suivant'}
            accessible={true}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  title: {
    ...TYPO.h1,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  hint: {
    ...TYPO.caption,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  accessibilityButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default OnboardingScreen;