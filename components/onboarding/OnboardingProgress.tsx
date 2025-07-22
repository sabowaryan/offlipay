import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { OnboardingProgressProps } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

export const OnboardingProgress: React.FC<OnboardingProgressProps & { testID?: string }> = ({
  currentScreen,
  totalScreens,
  currentSlide,
  totalSlides,
  style,
  animated = true,
  testID,
}) => {
  const { colors } = useThemeColors();
  
  // Animation refs for progress bars
  const screenProgressAnimation = useRef(new Animated.Value(0)).current;
  const slideProgressAnimation = useRef(new Animated.Value(0)).current;
  
  // Animation refs for dots
  const screenDotAnimations = useRef(
    Array.from({ length: totalScreens }, () => new Animated.Value(0))
  ).current;
  const slideDotAnimations = useRef(
    Array.from({ length: totalSlides }, () => new Animated.Value(0))
  ).current;
  
  // Animation refs for circular progress
  const circularScreenAnimation = useRef(new Animated.Value(0)).current;
  const circularSlideAnimation = useRef(new Animated.Value(0)).current;
  const circularRotationAnimation = useRef(new Animated.Value(0)).current;
  
  // Animation refs for transition effects
  const levelTransitionAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Start continuous animations for circular progress
  useEffect(() => {
    if (animated && style === 'circular') {
      // Continuous rotation animation
      const rotationLoop = Animated.loop(
        Animated.timing(circularRotationAnimation, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      
      // Continuous pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      
      rotationLoop.start();
      pulseLoop.start();
      
      return () => {
        rotationLoop.stop();
        pulseLoop.stop();
      };
    }
  }, [animated, style, circularRotationAnimation, pulseAnimation]);

  // Enhanced screen progress animation with level transition
  useEffect(() => {
    if (animated) {
      const screenProgressValue = totalScreens > 1 ? (currentScreen - 1) / (totalScreens - 1) : 0;
      
      // Trigger level transition animation when screen changes
      Animated.sequence([
        Animated.timing(levelTransitionAnimation, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(levelTransitionAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      Animated.timing(screenProgressAnimation, {
        toValue: screenProgressValue,
        duration: 400,
        useNativeDriver: false,
      }).start();
      
      // Update circular progress
      Animated.timing(circularScreenAnimation, {
        toValue: screenProgressValue,
        duration: 400,
        useNativeDriver: false,
      }).start();
    } else {
      const screenProgressValue = totalScreens > 1 ? (currentScreen - 1) / (totalScreens - 1) : 0;
      screenProgressAnimation.setValue(screenProgressValue);
      circularScreenAnimation.setValue(screenProgressValue);
    }
  }, [currentScreen, totalScreens, animated, screenProgressAnimation, circularScreenAnimation, levelTransitionAnimation]);

  // Enhanced slide progress animation with smooth transitions
  useEffect(() => {
    if (animated) {
      const slideProgressValue = totalSlides > 1 ? (currentSlide - 1) / (totalSlides - 1) : 0;
      
      Animated.timing(slideProgressAnimation, {
        toValue: slideProgressValue,
        duration: 250,
        useNativeDriver: false,
      }).start();
      
      // Update circular slide progress
      Animated.timing(circularSlideAnimation, {
        toValue: slideProgressValue,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      const slideProgressValue = totalSlides > 1 ? (currentSlide - 1) / (totalSlides - 1) : 0;
      slideProgressAnimation.setValue(slideProgressValue);
      circularSlideAnimation.setValue(slideProgressValue);
    }
  }, [currentSlide, totalSlides, animated, slideProgressAnimation, circularSlideAnimation]);

  // Animation des points indicateurs des écrans
  useEffect(() => {
    if (animated) {
      screenDotAnimations.forEach((anim, index) => {
        const isActive = index < currentScreen;
        const delay = index * 50;

        Animated.timing(anim, {
          toValue: isActive ? 1 : 0,
          duration: 200,
          delay,
          useNativeDriver: true,
        }).start();
      });
    } else {
      screenDotAnimations.forEach((anim, index) => {
        anim.setValue(index < currentScreen ? 1 : 0);
      });
    }
  }, [currentScreen, animated, screenDotAnimations]);

  // Animation des points indicateurs des slides
  useEffect(() => {
    if (animated) {
      slideDotAnimations.forEach((anim, index) => {
        const isActive = index < currentSlide;
        const delay = index * 30;

        Animated.timing(anim, {
          toValue: isActive ? 1 : 0,
          duration: 150,
          delay,
          useNativeDriver: true,
        }).start();
      });
    } else {
      slideDotAnimations.forEach((anim, index) => {
        anim.setValue(index < currentSlide ? 1 : 0);
      });
    }
  }, [currentSlide, animated, slideDotAnimations]);

  const screenProgressBarWidth = screenProgressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth - 80],
    extrapolate: 'clamp',
  });

  const slideProgressBarWidth = slideProgressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth - 120],
    extrapolate: 'clamp',
  });

  const styles = createStyles(colors);

  // Render different styles based on the style prop
  const renderProgressIndicator = () => {
    switch (style) {
      case 'dots':
        return renderDotsStyle();
      case 'bars':
        return renderBarsStyle();
      case 'circular':
        return renderCircularStyle();
      case 'minimal':
        return renderMinimalStyle();
      default:
        return renderDotsStyle();
    }
  };

  const renderDotsStyle = () => (
    <>
      {/* Screen dots */}
      <View style={styles.screenDotsContainer}>
        {Array.from({ length: totalScreens }, (_, index) => {
          const dotScale = screenDotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
            extrapolate: 'clamp',
          });

          const dotOpacity = screenDotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
            extrapolate: 'clamp',
          });

          const isActive = index < currentScreen;
          const isCurrent = index === currentScreen - 1;

          return (
            <Animated.View
              key={index}
              style={[
                styles.screenDot,
                {
                  backgroundColor: isActive ? colors.PRIMARY : colors.GRAY_MEDIUM,
                  transform: [{ scale: dotScale }],
                  opacity: dotOpacity,
                },
                isCurrent && styles.currentDot,
              ]}
            />
          );
        })}
      </View>

      {/* Slide dots (smaller, below screen dots) */}
      <View style={styles.slideDotsContainer}>
        {Array.from({ length: totalSlides }, (_, index) => {
          const dotScale = slideDotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
            extrapolate: 'clamp',
          });

          const dotOpacity = slideDotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
            extrapolate: 'clamp',
          });

          const isActive = index < currentSlide;

          return (
            <Animated.View
              key={index}
              style={[
                styles.slideDot,
                {
                  backgroundColor: isActive ? colors.PRIMARY : colors.GRAY_LIGHT,
                  transform: [{ scale: dotScale }],
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    </>
  );

  const renderBarsStyle = () => (
    <>
      {/* Screen progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground} />
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: screenProgressBarWidth }
          ]}
        />
      </View>

      {/* Slide progress bar (smaller) */}
      <View style={styles.slideProgressBarContainer}>
        <View style={styles.slideProgressBarBackground} />
        <Animated.View
          style={[
            styles.slideProgressBarFill,
            { width: slideProgressBarWidth }
          ]}
        />
      </View>
    </>
  );

  const renderCircularStyle = () => {
    // Simplified circular progress for better compatibility
    const screenProgress = totalScreens > 1 ? (currentScreen - 1) / (totalScreens - 1) : 0;
    const slideProgress = totalSlides > 1 ? (currentSlide - 1) / (totalSlides - 1) : 0;
    
    // Calculate rotation angles directly
    const screenRotation = `${screenProgress * 360}deg`;
    const slideRotation = `${slideProgress * 360}deg`;

    return (
      <Animated.View 
        style={[
          styles.circularContainer,
          animated ? { transform: [{ scale: levelTransitionAnimation }] } : {}
        ]}
      >
        {/* Outer ring for screen progress */}
        <View style={styles.circularProgressOuter}>
          <View
            style={[
              styles.circularProgressRing,
              { borderColor: colors.GRAY_LIGHT }
            ]}
          >
            <View
              style={[
                styles.circularProgressFill,
                {
                  borderColor: colors.PRIMARY,
                  transform: [{ rotate: screenRotation }],
                },
              ]}
            />
          </View>
          
          {/* Inner ring for slide progress */}
          <View style={styles.circularProgressInner}>
            <View
              style={[
                styles.circularProgressInnerRing,
                {
                  borderColor: colors.GRAY_LIGHT,
                  opacity: 0.6,
                },
              ]}
            >
              <View
                style={[
                  styles.circularProgressInnerFill,
                  {
                    borderColor: colors.PRIMARY,
                    opacity: 0.8,
                    transform: [{ rotate: slideRotation }],
                  },
                ]}
              />
            </View>
          </View>
          
          {/* Center indicator */}
          <View
            style={[
              styles.circularCenter,
              { backgroundColor: colors.PRIMARY },
            ]}
          />
        </View>
        
        {/* Progress text indicators */}
        <View style={styles.circularLabels}>
          <View style={styles.circularLabel}>
            <View style={[styles.circularLabelDot, { backgroundColor: colors.PRIMARY }]} />
            <View style={[styles.circularLabelText, { backgroundColor: colors.GRAY_MEDIUM }]} />
          </View>
          <View style={styles.circularLabel}>
            <View style={[styles.circularLabelDot, { backgroundColor: colors.PRIMARY, opacity: 0.6 }]} />
            <View style={[styles.circularLabelText, { backgroundColor: colors.GRAY_MEDIUM, opacity: 0.6 }]} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderMinimalStyle = () => (
    <View style={styles.minimalContainer}>
      {Array.from({ length: totalScreens }, (_, index) => (
        <View
          key={index}
          style={[
            styles.minimalBar,
            {
              backgroundColor: index < currentScreen ? colors.PRIMARY : colors.GRAY_LIGHT,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View 
      style={styles.container} 
      testID={testID || 'onboarding-progress'}
      accessibilityLabel={`Écran ${currentScreen} sur ${totalScreens}, Slide ${currentSlide} sur ${totalSlides}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: totalScreens,
        now: currentScreen,
      }}
    >
      {renderProgressIndicator()}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  // Screen progress styles
  progressBarContainer: {
    width: '100%',
    height: 4,
    position: 'relative',
    marginBottom: 15,
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.GRAY_LIGHT,
    borderRadius: 2,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: colors.PRIMARY,
    borderRadius: 2,
  },
  // Slide progress styles
  slideProgressBarContainer: {
    width: '80%',
    height: 2,
    position: 'relative',
    marginBottom: 20,
  },
  slideProgressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.GRAY_LIGHT,
    borderRadius: 1,
    opacity: 0.6,
  },
  slideProgressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.PRIMARY,
    borderRadius: 1,
    opacity: 0.8,
  },
  // Screen dots styles
  screenDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  // Slide dots styles
  slideDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  slideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  currentDot: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Enhanced circular progress styles
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  circularProgressOuter: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularProgressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.GRAY_LIGHT,
    position: 'absolute',
  },
  circularProgressFill: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.PRIMARY,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
  },
  circularProgressInner: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  circularProgressInnerRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.GRAY_LIGHT,
    position: 'absolute',
  },
  circularProgressInnerFill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.PRIMARY,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
  },
  circularCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.PRIMARY,
    position: 'absolute',
    zIndex: 10,
  },
  circularLabels: {
    position: 'absolute',
    bottom: -30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
  },
  circularLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularLabelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  circularLabelText: {
    width: 20,
    height: 2,
    backgroundColor: colors.GRAY_MEDIUM,
    borderRadius: 1,
  },
  // Legacy circular styles (kept for compatibility)
  circularProgress: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.GRAY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Minimal progress styles
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  minimalBar: {
    width: 30,
    height: 2,
    marginHorizontal: 2,
    borderRadius: 1,
  },
  // Legacy styles (kept for compatibility)
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBar: {
    width: 20,
    height: 3,
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
});