import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
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
  cancelAnimation,
} from 'react-native-reanimated';
import { OnboardingSlideCarouselProps, SlideConfig, AnimationType, IllustrationProps } from '@/types';
import * as Illustrations from './illustrations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

export const OnboardingSlideCarousel: React.FC<OnboardingSlideCarouselProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  autoProgress = true,
  autoProgressDelay = 3000,
  theme
}) => {
  const translateY = useSharedValue(0);
  const autoProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);

  // Auto-progression logic
  const startAutoProgress = useCallback(() => {
    if (!autoProgress || slides.length <= 1) return;

    autoProgressTimer.current = setTimeout(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      onSlideChange(nextSlide);
    }, autoProgressDelay);
  }, [autoProgress, autoProgressDelay, currentSlide, slides.length, onSlideChange]);

  const stopAutoProgress = useCallback(() => {
    if (autoProgressTimer.current) {
      clearTimeout(autoProgressTimer.current);
      autoProgressTimer.current = null;
    }
  }, []);

  // Reset auto-progress when slide changes
  useEffect(() => {
    stopAutoProgress();
    if (!isGestureActive) {
      startAutoProgress();
    }
    return stopAutoProgress;
  }, [currentSlide, isGestureActive, startAutoProgress, stopAutoProgress]);

  // Animate to current slide
  useEffect(() => {
    const targetY = -currentSlide * SLIDE_HEIGHT;
    translateY.value = withSpring(targetY, {
      damping: 20,
      stiffness: 90,
    });
  }, [currentSlide, translateY]);

  // Gesture handler for vertical swipes using new Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsGestureActive)(true);
      runOnJS(stopAutoProgress)();
      cancelAnimation(translateY);
    })
    .onUpdate((event) => {
      const currentOffset = -currentSlide * SLIDE_HEIGHT;
      translateY.value = currentOffset + event.translationY;
    })
    .onEnd((event) => {
      const { translationY, velocityY } = event;

      let newSlideIndex = currentSlide;

      // Determine if we should change slides based on distance or velocity
      if (Math.abs(translationY) > SWIPE_THRESHOLD || Math.abs(velocityY) > VELOCITY_THRESHOLD) {
        if (translationY > 0 && velocityY > -VELOCITY_THRESHOLD) {
          // Swipe down - go to previous slide
          newSlideIndex = Math.max(0, currentSlide - 1);
        } else if (translationY < 0 && velocityY < VELOCITY_THRESHOLD) {
          // Swipe up - go to next slide
          newSlideIndex = Math.min(slides.length - 1, currentSlide + 1);
        }
      }

      // Animate to the target position
      const targetY = -newSlideIndex * SLIDE_HEIGHT;
      translateY.value = withSpring(targetY, {
        damping: 20,
        stiffness: 90,
      });

      // Update slide index if changed
      if (newSlideIndex !== currentSlide) {
        runOnJS(onSlideChange)(newSlideIndex);
      }

      runOnJS(setIsGestureActive)(false);
    });

  // Animation styles for different transition types
  const getSlideAnimationStyle = useCallback((slideIndex: number, animationType: AnimationType) => {
    const inputRange = [
      (slideIndex - 1) * SLIDE_HEIGHT,
      slideIndex * SLIDE_HEIGHT,
      (slideIndex + 1) * SLIDE_HEIGHT,
    ];

    switch (animationType) {
      case 'fadeIn':
        return useAnimatedStyle(() => {
          const translateYValue = -translateY.value;
          const fadeOpacity = interpolate(
            translateYValue,
            inputRange,
            [0.3, 1, 0.3],
            'clamp'
          );
          return {
            opacity: fadeOpacity,
            transform: [{ translateY: translateY.value + slideIndex * SLIDE_HEIGHT }],
          };
        });

      case 'scale':
        return useAnimatedStyle(() => {
          const translateYValue = -translateY.value;
          const scaleValue = interpolate(
            translateYValue,
            inputRange,
            [0.8, 1, 0.8],
            'clamp'
          );
          const scaleOpacity = interpolate(
            translateYValue,
            inputRange,
            [0.5, 1, 0.5],
            'clamp'
          );
          return {
            opacity: scaleOpacity,
            transform: [
              { translateY: translateY.value + slideIndex * SLIDE_HEIGHT },
              { scale: scaleValue },
            ],
          };
        });

      case 'morphing':
        return useAnimatedStyle(() => {
          const translateYValue = -translateY.value;
          const morphScale = interpolate(
            translateYValue,
            inputRange,
            [0.9, 1, 0.9],
            'clamp'
          );
          const morphOpacity = interpolate(
            translateYValue,
            inputRange,
            [0.4, 1, 0.4],
            'clamp'
          );
          const morphRotation = interpolate(
            translateYValue,
            inputRange,
            [5, 0, -5],
            'clamp'
          );
          return {
            opacity: morphOpacity,
            transform: [
              { translateY: translateY.value + slideIndex * SLIDE_HEIGHT },
              { scale: morphScale },
              { rotateX: `${morphRotation}deg` },
            ],
          };
        });

      case 'parallax':
        return useAnimatedStyle(() => {
          const translateYValue = -translateY.value;
          const parallaxOffset = interpolate(
            translateYValue,
            inputRange,
            [-30, 0, 30],
            'clamp'
          );
          const parallaxOpacity = interpolate(
            translateYValue,
            inputRange,
            [0.6, 1, 0.6],
            'clamp'
          );
          return {
            opacity: parallaxOpacity,
            transform: [
              { translateY: translateY.value + slideIndex * SLIDE_HEIGHT + parallaxOffset },
            ],
          };
        });

      default: // 'slideUp'
        return useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value + slideIndex * SLIDE_HEIGHT }],
        }));
    }
  }, [translateY]);

  // Get illustration component dynamically
  const getIllustrationComponent = (illustrationName: string) => {
    // Map illustration names to actual components
    const illustrationMap: Record<string, React.ComponentType<IllustrationProps>> = {
      // Welcome illustrations
      'WelcomeIntro': Illustrations.WelcomeIntro,
      'WelcomeFeatures': Illustrations.WelcomeFeatures,
      'WelcomePromise': Illustrations.WelcomePromise,
      // Payment illustrations
      'QRScanDemo': Illustrations.QRScanDemo,
      'QRGenerateDemo': Illustrations.QRGenerateDemo,
      'PaymentSuccess': Illustrations.PaymentSuccess,
      // Wallet illustrations
      'WalletOverview': Illustrations.WalletOverview,
      'CashInMethods': Illustrations.CashInMethods,
      'TransactionHistory': Illustrations.TransactionHistory,
      // Offline illustrations
      'OfflineCapability': Illustrations.OfflineCapability,
      'SyncProcess': Illustrations.SyncProcess,
      'SecurityFeatures': Illustrations.SecurityFeatures,
    };

    return illustrationMap[illustrationName];
  };

  // Render individual slide
  const renderSlide = (slide: SlideConfig, index: number) => {
    const animatedStyle = getSlideAnimationStyle(index, slide.animationType);
    const IllustrationComponent = getIllustrationComponent(slide.illustration);
    const isCurrentSlide = index === currentSlide;

    return (
      <Animated.View
        key={slide.id}
        style={[
          styles.slide,
          animatedStyle,
          { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' }
        ]}
      >
        <View style={styles.slideContent}>
          {/* Dynamic illustration component */}
          <View style={styles.illustrationContainer}>
            {IllustrationComponent ? (
              <IllustrationComponent
                theme={theme}
                animated={isCurrentSlide}
                size={280}
                onAnimationComplete={() => {
                  // Optional: Handle animation completion
                }}
              />
            ) : (
              // Fallback placeholder
              <View style={[
                styles.placeholder,
                { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }
              ]} />
            )}
          </View>

          {/* Slide content text */}
          <View style={styles.textContent}>
            <Animated.Text style={[
              styles.slideTitle,
              { color: theme === 'dark' ? '#ffffff' : '#000000' }
            ]}>
              {slide.title}
            </Animated.Text>
            <Animated.Text style={[
              styles.slideSubtitle,
              { color: theme === 'dark' ? '#cccccc' : '#666666' }
            ]}>
              {slide.subtitle}
            </Animated.Text>
            {slide.interactionHint && (
              <Animated.Text style={[
                styles.interactionHint,
                { color: theme === 'dark' ? '#888888' : '#999999' }
              ]}>
                {slide.interactionHint}
              </Animated.Text>
            )}
          </View>

          {/* Slide indicators */}
          <View style={styles.slideIndicators}>
            {slides.map((_, indicatorIndex) => (
              <View
                key={indicatorIndex}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: indicatorIndex === currentSlide
                      ? (theme === 'dark' ? '#ffffff' : '#000000')
                      : (theme === 'dark' ? '#666666' : '#cccccc'),
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.carouselContainer}>
          {slides.map((slide, index) => renderSlide(slide, index))}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    position: 'absolute',
    width: '100%',
    height: SLIDE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  slideContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  illustrationContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  placeholder: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
    opacity: 0.3,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  interactionHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});