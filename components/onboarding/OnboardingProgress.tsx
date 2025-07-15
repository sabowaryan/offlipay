import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { OnboardingProgressProps } from './types';

const { width: screenWidth } = Dimensions.get('window');

export const OnboardingProgress: React.FC<OnboardingProgressProps & { testID?: string }> = ({
  currentStep,
  totalSteps,
  animated = true,
  testID,
}) => {
  const { colors } = useThemeColors();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const dotAnimations = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(0))
  ).current;

  // Animation de la barre de progression
  useEffect(() => {
    if (animated) {
      const progressValue = (currentStep - 1) / (totalSteps - 1);
      Animated.timing(progressAnimation, {
        toValue: progressValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnimation.setValue((currentStep - 1) / (totalSteps - 1));
    }
  }, [currentStep, totalSteps, animated, progressAnimation]);

  // Animation des points indicateurs
  useEffect(() => {
    if (animated) {
      dotAnimations.forEach((anim, index) => {
        const isActive = index < currentStep;
        const delay = index * 50; // Animation en cascade

        Animated.timing(anim, {
          toValue: isActive ? 1 : 0,
          duration: 200,
          delay,
          useNativeDriver: true,
        }).start();
      });
    } else {
      dotAnimations.forEach((anim, index) => {
        anim.setValue(index < currentStep ? 1 : 0);
      });
    }
  }, [currentStep, animated, dotAnimations]);

  const progressBarWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth - 80], // 40px de marge de chaque côté
    extrapolate: 'clamp',
  });

  const styles = createStyles(colors);

  return (
    <View 
      style={styles.container} 
      testID={testID || 'onboarding-progress'}
      accessibilityLabel={`Étape ${currentStep} sur ${totalSteps}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentStep,
      }}
    >
      {/* Barre de progression */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground} />
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: progressBarWidth }
          ]}
        />
      </View>

      {/* Indicateurs de points */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const dotScale = dotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
            extrapolate: 'clamp',
          });

          const dotOpacity = dotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
            extrapolate: 'clamp',
          });

          const isActive = index < currentStep;
          const isCurrent = index === currentStep - 1;

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
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

      {/* Indicateur de progression textuel (optionnel) */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepText}>
          {/* Rendu des étapes sous forme de petites barres */}
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.stepBar,
                {
                  backgroundColor: index < currentStep
                    ? colors.PRIMARY
                    : colors.GRAY_LIGHT,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    position: 'relative',
    marginBottom: 20,
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