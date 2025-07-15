import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { OnboardingService } from '@/services/OnboardingService';
import { OnboardingContainerProps, OnboardingScreenConfig } from './types';
import OnboardingScreen from './OnboardingScreen';
import { OnboardingProgress } from './OnboardingProgress';
import OnboardingButton from './OnboardingButton';

// Import illustrations
import WelcomeIllustration from './illustrations/WelcomeIllustration';
import QRPaymentIllustration from './illustrations/QRPaymentIllustration';
import WalletIllustration from './illustrations/WalletIllustration';
import OfflineIllustration from './illustrations/OfflineIllustration';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 500;

// Map illustration names to components
const ILLUSTRATION_MAP = {
  welcome: WelcomeIllustration,
  qr_payment: QRPaymentIllustration,
  wallet: WalletIllustration,
  offline: OfflineIllustration,
};

const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  onComplete,
  onSkip,
}) => {
  const { colors, theme } = useThemeColors();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [screens, setScreens] = useState<OnboardingScreenConfig[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipEnabled, setSkipEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const translateX = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const progressOpacity = useSharedValue(0);

  // Refs
  const panRef = useRef(null);
  const autoProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load onboarding configuration
  useEffect(() => {
    const loadOnboardingConfig = async () => {
      try {
        setIsLoading(true);
        const [screensConfig, settings] = await Promise.all([
          OnboardingService.getScreensConfig(),
          OnboardingService.getOnboardingSettings(),
        ]);

        setScreens(screensConfig);
        setSkipEnabled(settings.skipEnabled);

        // Restore progress if user was in the middle of onboarding
        const state = await OnboardingService.getOnboardingState();
        if (state.currentScreen > 0 && state.currentScreen < screensConfig.length) {
          setCurrentScreen(state.currentScreen);
        }

        // Animate progress indicator in
        progressOpacity.value = withTiming(1, { duration: 500 });
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration d\'onboarding:', error);
        // Fallback to default configuration
        setScreens([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingConfig();
  }, []);

  // Save progress automatically
  const saveProgress = useCallback(async (screenIndex: number) => {
    try {
      await OnboardingService.saveProgress(screenIndex);
    } catch (error) {
      console.warn('Impossible de sauvegarder la progression:', error);
    }
  }, []);

  // Handle screen navigation
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

      if (animated) {
        // Animate screen transition
        screenOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(setCurrentScreen)(targetScreen);
          runOnJS(saveProgress)(targetScreen);

          screenOpacity.value = withTiming(1, { duration: 300 }, () => {
            runOnJS(setIsAnimating)(false);
          });
        });
      } else {
        setCurrentScreen(targetScreen);
        await saveProgress(targetScreen);
        setIsAnimating(false);
      }

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [isAnimating, screens.length, screenOpacity, saveProgress]
  );

  // Handle next screen
  const handleNext = useCallback(() => {
    if (currentScreen < screens.length - 1) {
      navigateToScreen(currentScreen + 1);
    } else {
      handleComplete();
    }
  }, [currentScreen, screens.length, navigateToScreen]);

  // Handle previous screen
  const handlePrevious = useCallback(() => {
    if (currentScreen > 0) {
      navigateToScreen(currentScreen - 1);
    }
  }, [currentScreen, navigateToScreen]);

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

  // Create pan gesture handler using the new API
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .enabled(!isAnimating)
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (isAnimating) return;

      const { translationX, velocityX } = event;

      // Determine swipe direction and strength
      const isSwipeLeft = translationX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY_THRESHOLD;
      const isSwipeRight = translationX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD;

      if (isSwipeLeft) {
        runOnJS(handleNext)();
      } else if (isSwipeRight) {
        runOnJS(handlePrevious)();
      }

      // Reset gesture values
      translateX.value = withSpring(0);
    });

  // Handle screen interaction
  const handleScreenInteraction = useCallback(() => {
    if (!isAnimating) {
      handleNext();
    }
  }, [isAnimating, handleNext]);

  // Auto-progress functionality (optional)
  const startAutoProgress = useCallback(() => {
    if (autoProgressTimer.current) {
      clearTimeout(autoProgressTimer.current);
    }

    const currentScreenConfig = screens[currentScreen];
    if (currentScreenConfig && currentScreenConfig.duration > 0) {
      autoProgressTimer.current = setTimeout(() => {
        if (currentScreen < screens.length - 1) {
          handleNext();
        }
      }, currentScreenConfig.duration);
    }
  }, [currentScreen, screens, handleNext]);

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentScreen > 0) {
          handlePrevious();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentScreen, handlePrevious])
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
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-SCREEN_WIDTH * 0.3, 0, SCREEN_WIDTH * 0.3]
        ),
      },
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  const styles = createStyles(colors);

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
  const IllustrationComponent = ILLUSTRATION_MAP[currentScreenConfig.illustration as keyof typeof ILLUSTRATION_MAP];

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
            currentStep={currentScreen + 1}
            totalSteps={screens.length}
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
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.screenContainer, containerAnimatedStyle]}>
            <OnboardingScreen
              title={currentScreenConfig.title}
              subtitle={currentScreenConfig.subtitle}
              illustration={IllustrationComponent}
              animationDelay={isAnimating ? 0 : 300}
              onInteraction={handleScreenInteraction}
              interactionHint={
                currentScreen === screens.length - 1
                  ? 'Appuyez pour commencer'
                  : 'Appuyez pour continuer'
              }
            />
          </Animated.View>
        </GestureDetector>

        {/* Navigation Controls */}
        <View style={styles.navigationContainer}>
          {currentScreen > 0 && (
            <OnboardingButton
              title="Précédent"
              onPress={handlePrevious}
              variant="secondary"
              disabled={isAnimating}
            />
          )}

          <View style={styles.navigationSpacer} />

          <OnboardingButton
            title={currentScreen === screens.length - 1 ? 'Commencer' : 'Suivant'}
            onPress={handleNext}
            variant="primary"
            disabled={isAnimating}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
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