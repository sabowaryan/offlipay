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
  cancelAnimation,
} from 'react-native-reanimated';
import { IllustrationProps } from './types';
import { SlideConfig } from '@/types';

// Props interface for the carousel
interface OnboardingSlideCarouselProps {
  slides: SlideConfig[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onLastSlideReached?: () => void; // New callback for when last slide is reached
  autoProgress?: boolean;
  autoProgressDelay?: number;
  theme: 'light' | 'dark';
}
import * as Illustrations from './illustrations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

export const OnboardingSlideCarousel: React.FC<OnboardingSlideCarouselProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  onLastSlideReached,
  autoProgress = true,
  autoProgressDelay = 3000,
  theme
}) => {
  const translateY = useSharedValue(0);
  const autoProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);

  // Auto-progression logic - disabled to give user control
  const stopAutoProgress = useCallback(() => {
    if (autoProgressTimer.current) {
      clearTimeout(autoProgressTimer.current);
      autoProgressTimer.current = null;
    }
  }, []);

  // Auto-progress is now disabled - user must manually navigate
  useEffect(() => {
    stopAutoProgress();
    // Auto-progression is disabled - slides will loop infinitely until user takes action
    return stopAutoProgress;
  }, [stopAutoProgress]);

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

  // Simple animated style for all slides - using basic slide animation only
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Get illustration component dynamically with error handling
  const getIllustrationComponent = (illustrationName: string) => {
    try {
      // Map illustration names to actual components
      const illustrationMap: Record<string, React.ComponentType<IllustrationProps>> = {
        // Welcome illustrations
        'WelcomeIntro': Illustrations.WelcomeIntro || null,
        'WelcomeFeatures': Illustrations.WelcomeFeatures || null,
        'WelcomePromise': Illustrations.WelcomePromise || null,
        // Payment illustrations
        'QRScanDemo': Illustrations.QRScanDemo || null,
        'QRGenerateDemo': Illustrations.QRGenerateDemo || null,
        'PaymentSuccess': Illustrations.PaymentSuccess || null,
        // Wallet illustrations
        'WalletOverview': Illustrations.WalletOverview || null,
        'CashInMethods': Illustrations.CashInMethods || null,
        'TransactionHistory': Illustrations.TransactionHistory || null,
        // Offline illustrations
        'OfflineCapability': Illustrations.OfflineCapability || null,
        'SyncProcess': Illustrations.SyncProcess || null,
        'SecurityFeatures': Illustrations.SecurityFeatures || null,
      };

      return illustrationMap[illustrationName] || null;
    } catch (error) {
      console.warn(`Failed to load illustration: ${illustrationName}`, error);
      return null;
    }
  };

  // Render individual slide - simplified without complex animations
  const renderSlide = (slide: SlideConfig, index: number) => {
    const IllustrationComponent = getIllustrationComponent(slide.illustration);
    const isCurrentSlide = index === currentSlide;

    return (
      <View
        key={slide.id}
        style={[
          styles.slide,
          {
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            top: index * SLIDE_HEIGHT,
          }
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
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.carouselContainer, containerAnimatedStyle]}>
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