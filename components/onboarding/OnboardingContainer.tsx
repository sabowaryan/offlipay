import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  BackHandler,
  Alert,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { OnboardingService, OnboardingScreenConfig } from '@/services/OnboardingService';
import { OnboardingContainerProps } from './types';
import { OnboardingProgress } from './OnboardingProgress';
import OnboardingButton from './OnboardingButton';
import {
  getOptimizedAnimationConfig,
  getDeviceCapabilities
} from '@/utils/performanceOptimizer';

// Import new components
import { OnboardingSlideCarousel } from './OnboardingSlideCarousel';
import OnboardingGestureHandler from './OnboardingGestureHandler';



const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  onComplete,
  onSkip,
}) => {
  const { colors, theme } = useThemeColors();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0); // New state for current slide
  const [screens, setScreens] = useState<OnboardingScreenConfig[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipEnabled, setSkipEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Get device capabilities for performance optimization
  const deviceCapabilities = getDeviceCapabilities();
  const animationConfig = getOptimizedAnimationConfig();

  // Animation values
  const screenOpacity = useSharedValue(1);
  const progressOpacity = useSharedValue(0);

  // Refs
  const autoProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartTime = useRef<number>(Date.now());

  // Simplified initialization - no heavy performance monitoring
  useEffect(() => {
    // Just initialize the progress indicator
    progressOpacity.value = withTiming(1, {
      duration: animationConfig.duration,
    });
  }, [progressOpacity, animationConfig.duration]);

  // Load onboarding configuration with optimized performance
  useEffect(() => {
    const loadOnboardingConfig = async () => {
      try {
        setIsLoading(true);
        loadStartTime.current = Date.now();

        // Use InteractionManager to ensure smooth loading
        await InteractionManager.runAfterInteractions(async () => {
          // Batch async operations for better performance
          const [screensResult, settingsResult, stateResult] = await Promise.allSettled([
            OnboardingService.getScreensConfig(),
            OnboardingService.getOnboardingSettings(),
            OnboardingService.getOnboardingState(),
          ]);

          if (screensResult.status === 'fulfilled') {
            setScreens(screensResult.value);
          }

          if (settingsResult.status === 'fulfilled') {
            setSkipEnabled(settingsResult.value.skipEnabled);
          }

          // Restore progress if user was in the middle of onboarding
          if (stateResult.status === 'fulfilled' && screensResult.status === 'fulfilled') {
            const state = stateResult.value;
            if (state.currentScreen > 0 && state.currentScreen < screensResult.value.length) {
              setCurrentScreen(state.currentScreen);
              setCurrentSlide(state.currentSlide || 0); // Restore current slide
            }
          }

          const loadTime = Date.now() - loadStartTime.current;
          if (loadTime > 100) {
            console.log(`[Performance] Onboarding config loaded in ${loadTime}ms`);
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration d\'onboarding:', error);
        setScreens([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingConfig();
  }, []);

  // Save progress automatically
  const saveProgress = useCallback(async (screenIndex: number, slideIndex: number) => {
    try {
      await OnboardingService.saveProgress(screenIndex, slideIndex);
    } catch (error) {
      console.warn('Impossible de sauvegarder la progression:', error);
    }
  }, []);

  // Handle screen navigation with performance monitoring
  const navigateToScreen = useCallback(
    async (targetScreen: number, animated: boolean = true) => {
      if (isAnimating || targetScreen < 0 || targetScreen >= screens.length) {
        return;
      }

      setIsAnimating(true);

      // Clear auto-progress timer
      if (autoProgressTimer.current) {
        clearTimeout(autoProgressTimer.current);
        autoProgressTimer.current = null;
      }

      if (animated && deviceCapabilities.supportsComplexAnimations) {
        // Use optimized animation durations
        const exitDuration = animationConfig.duration * 0.7;
        const enterDuration = animationConfig.duration;

        // Animate screen transition
        screenOpacity.value = withTiming(0, {
          duration: exitDuration,
        }, () => {
          runOnJS(setCurrentScreen)(targetScreen);
          runOnJS(setCurrentSlide)(0); // Reset slide when changing screen
          runOnJS(saveProgress)(targetScreen, 0);

          screenOpacity.value = withTiming(1, {
            duration: enterDuration,
          }, () => {
            runOnJS(setIsAnimating)(false);
          });
        });
      } else {
        // Simplified navigation for low-end devices
        setCurrentScreen(targetScreen);
        setCurrentSlide(0); // Reset slide when changing screen
        await saveProgress(targetScreen, 0);
        setIsAnimating(false);
      }

      // Haptic feedback (only on iOS)
      if (Platform.OS === 'ios' && deviceCapabilities.supportsHeavyOperations) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [isAnimating, screens.length, screenOpacity, saveProgress, deviceCapabilities.supportsComplexAnimations, deviceCapabilities.supportsHeavyOperations, animationConfig.duration]
  );

  // Handle slide navigation
  const navigateToSlide = useCallback(
    (targetSlide: number) => {
      const currentScreenConfig = screens[currentScreen];
      if (!currentScreenConfig || targetSlide < 0 || targetSlide >= currentScreenConfig.slides.length) {
        return;
      }
      setCurrentSlide(targetSlide);
      saveProgress(currentScreen, targetSlide);
    },
    [currentScreen, screens, saveProgress]
  );

  // Handle completion
  const handleComplete = useCallback(async () => {
    try {
      await OnboardingService.markOnboardingCompleted();
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la finalisation de l\'onboarding:', error);
      onComplete(); // Continue anyway
    }
  }, [onComplete]);

  // Handle next screen
  const handleNextScreen = useCallback(() => {
    if (currentScreen < screens.length - 1) {
      navigateToScreen(currentScreen + 1);
    } else {
      handleComplete();
    }
  }, [currentScreen, screens.length, navigateToScreen, handleComplete]);

  // Handle previous screen
  const handlePreviousScreen = useCallback(() => {
    if (currentScreen > 0) {
      navigateToScreen(currentScreen - 1);
    }
  }, [currentScreen, navigateToScreen]);

  // Handle next slide
  const handleNextSlide = useCallback(() => {
    const currentScreenConfig = screens[currentScreen];
    if (!currentScreenConfig) return;
    
    if (currentSlide < currentScreenConfig.slides.length - 1) {
      navigateToSlide(currentSlide + 1);
    } else {
      // Only move to next screen if we're not on the last screen
      if (currentScreen < screens.length - 1) {
        handleNextScreen();
      } else {
        // We're on the last slide of the last screen, complete onboarding
        handleComplete();
      }
    }
  }, [currentScreen, currentSlide, screens, navigateToSlide, handleNextScreen, handleComplete]);

  // Handle previous slide
  const handlePreviousSlide = useCallback(() => {
    if (currentSlide > 0) {
      navigateToSlide(currentSlide - 1);
    } else {
      handlePreviousScreen(); // Move to previous screen if no more slides
    }
  }, [currentSlide, navigateToSlide, handlePreviousScreen]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!skipEnabled) return;

    Alert.alert(
      'Ignorer l\'introduction',
      'Êtes-vous sûr de vouloir ignorer l\'introduction ? Vous pourrez toujours la revoir plus tard dans les paramètres.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Ignorer',
          style: 'destructive',
          onPress: async () => {
            try {
              await OnboardingService.markOnboardingSkipped();
              onSkip();
            } catch (error) {
              console.error('Erreur lors de l\'ignorance de l\'onboarding:', error);
              onSkip(); // Continue anyway
            }
          },
        },
      ]
    );
  }, [skipEnabled, onSkip]);



  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentSlide > 0) {
          handlePreviousSlide();
          return true;
        } else if (currentScreen > 0) {
          handlePreviousScreen();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentScreen, currentSlide, handlePreviousSlide, handlePreviousScreen])
  );

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (autoProgressTimer.current) {
        clearTimeout(autoProgressTimer.current);
      }
    };
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  const styles = createStyles();

  if (isLoading || screens.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.loadingContainer}>
          {/* Loading state - could add a spinner here */}
        </View>
      </SafeAreaView>
    );
  }

  const currentScreenConfig = screens[currentScreen];

  // Add detailed debugging and error handling
  if (!currentScreenConfig) {
    console.error('currentScreenConfig is undefined', {
      currentScreen,
      screensLength: screens.length,
      screens: screens.map(s => ({ id: s.id, title: s.title }))
    });
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.TEXT }}>Error: Screen configuration not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentScreenConfig.slides || !Array.isArray(currentScreenConfig.slides)) {
    console.error('currentScreenConfig.slides is invalid', {
      currentScreen,
      screenId: currentScreenConfig.id,
      slides: currentScreenConfig.slides,
      hasSlides: 'slides' in currentScreenConfig
    });
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.TEXT }}>Error: Slides configuration not found</Text>
        </View>
      </SafeAreaView>
    );
  }



  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.BACKGROUND}
        />

        {/* Progress Indicator */}
        <Animated.View style={[styles.progressContainer, progressAnimatedStyle]}>
          <OnboardingProgress
            currentScreen={currentScreen + 1}
            totalScreens={screens.length}
            currentSlide={currentSlide + 1} // Pass current slide
            totalSlides={currentScreenConfig.slides.length} // Pass total slides for current screen
            style="dots"
            animated={true}
          />
        </Animated.View>

        {/* Skip Button */}
        {skipEnabled && (
          <View style={styles.skipContainer}>
            <OnboardingButton
              title="Ignorer"
              onPress={handleSkip}
              variant="ghost"
              disabled={isAnimating}
            />
          </View>
        )}

        {/* Main Content */}
        <OnboardingGestureHandler
          onHorizontalSwipe={direction => {
            if (direction === 'left') handleNextScreen();
            else handlePreviousScreen();
          }}
          onVerticalSwipe={direction => {
            if (direction === 'up') handleNextSlide();
            else handlePreviousSlide();
          }}
          onTap={handleNextSlide} // Tap to advance slide/screen
          enabled={!isAnimating}
        >
          <Animated.View style={[styles.screenContainer, containerAnimatedStyle]}>
            <OnboardingSlideCarousel
              slides={currentScreenConfig.slides}
              currentSlide={currentSlide}
              onSlideChange={navigateToSlide}
              onLastSlideReached={handleNextSlide} // Only called when user manually reaches last slide
              autoProgress={false} // Disable auto-progress - user controls navigation
              autoProgressDelay={currentScreenConfig.duration || 3000} // Keep for potential future use
              theme={theme}
            />
          </Animated.View>
        </OnboardingGestureHandler>

        {/* Navigation Controls */}
        <View style={styles.navigationContainer}>
          {currentScreen > 0 && (
            <OnboardingButton
              title="Précédent"
              onPress={handlePreviousScreen}
              variant="secondary"
              disabled={isAnimating}
            />
          )}

          <View style={styles.navigationSpacer} />

          <OnboardingButton
            title={currentScreen === screens.length - 1 && currentSlide === currentScreenConfig.slides.length - 1 ? 'Commencer' : 'Suivant'}
            onPress={handleNextSlide}
            variant="primary"
            disabled={isAnimating}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 20,
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 20,
  },
  navigationSpacer: {
    flex: 1,
  },
});

export default OnboardingContainer;

