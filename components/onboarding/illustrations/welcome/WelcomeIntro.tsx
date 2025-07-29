import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Logo from '@/components/Logo';
import { IllustrationProps } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

// Particle component
const Particle: React.FC<{
  delay: number;
  theme: 'light' | 'dark';
  size: number;
}> = ({ delay, theme, size }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Staggered particle animation
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: 2000, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 2000, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.2, { duration: 1000 })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.out(Easing.back(1.2)) }),
          withTiming(0.5, { duration: 1500, easing: Easing.in(Easing.back(1.2)) })
        ),
        -1,
        true
      )
    );
  }, [delay, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: theme === 'dark' ? '#4A90E2' : '#007AFF',
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    />
  );
};

const WelcomeIntro: React.FC<IllustrationProps> = ({ 
  theme, 
  animated = true, 
  size = 280,
  onAnimationComplete 
}) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const glassOpacity = useSharedValue(0);
  const glassScale = useSharedValue(0.8);
  const backgroundRotation = useSharedValue(0);

  const animationCompleted = useRef(false);

  // Resolve theme to light/dark (handle 'auto' case)
  const resolvedTheme: 'light' | 'dark' = theme === 'auto' ? 'light' : theme;

  useEffect(() => {
    if (!animated) {
      // Use runOnJS to avoid reading shared values during render
      logoScale.value = withTiming(1, { duration: 0 });
      logoOpacity.value = withTiming(1, { duration: 0 });
      titleOpacity.value = withTiming(1, { duration: 0 });
      titleTranslateY.value = withTiming(0, { duration: 0 });
      glassOpacity.value = withTiming(1, { duration: 0 });
      glassScale.value = withTiming(1, { duration: 0 });
      return;
    }

    // Sequence d'animations
    const startAnimations = () => {
      // Background rotation continue
      backgroundRotation.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1
      );

      // Glass effect apparition
      glassOpacity.value = withTiming(0.9, { 
        duration: 800, 
        easing: Easing.out(Easing.quad) 
      });
      glassScale.value = withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.back(1.2)) 
      });

      // Logo animation avec bounce
      logoScale.value = withDelay(
        300,
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
          withTiming(1, { duration: 200, easing: Easing.inOut(Easing.quad) })
        )
      );

      logoOpacity.value = withDelay(
        300,
        withTiming(1, { duration: 600 })
      );

      // Title animation
      titleOpacity.value = withDelay(
        800,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
      );

      titleTranslateY.value = withDelay(
        800,
        withTiming(0, { 
          duration: 800, 
          easing: Easing.out(Easing.back(1.2)) 
        }, () => {
          if (!animationCompleted.current) {
            animationCompleted.current = true;
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          }
        })
      );
    };

    startAnimations();
  }, [animated, logoScale, logoOpacity, titleOpacity, titleTranslateY, glassOpacity, glassScale, backgroundRotation, onAnimationComplete]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const glassAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glassOpacity.value,
    transform: [{ scale: glassScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${backgroundRotation.value}deg` }],
  }));

  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[
      styles.container, 
      { 
        width: size,
        height: size,
      }
    ]}>
      {/* Background gradient animé */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={isDark 
            ? ['#1a1a2e', '#16213e', '#0f3460'] 
            : ['#667eea', '#764ba2', '#f093fb']
          }
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Particules animées */}
      {animated && (
        <View style={styles.particlesContainer}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.particleWrapper,
                {
                  left: `${(index * 12 + 10) % 80}%`,
                  top: `${(index * 15 + 20) % 60}%`,
                }
              ]}
            >
              <Particle 
                delay={index * 200} 
                theme={resolvedTheme} 
                size={4 + (index % 3) * 2}
              />
            </View>
          ))}
        </View>
      )}

      {/* Effet glassmorphism */}
      <Animated.View style={[styles.glassContainer, glassAnimatedStyle]}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurView}
        >
          <View style={[
            styles.glassContent,
            {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.2)',
              borderColor: isDark 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.3)',
            }
          ]}>
            {/* Logo OffliPay */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <Logo size={80} />
            </Animated.View>

            {/* Titre animé */}
            <Animated.View style={titleAnimatedStyle}>
              <Text style={[
                styles.title, 
                { color: isDark ? '#ffffff' : '#ffffff' }
              ]}>
                Bienvenue dans OffliPay
              </Text>
              <Text style={[
                styles.subtitle, 
                { color: isDark ? '#cccccc' : '#f0f0f0' }
              ]}>
                L'avenir des paiements est arrivé
              </Text>
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Effet de brillance */}
      {animated && (
        <View style={styles.shineContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
            style={styles.shine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 20,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particleWrapper: {
    position: 'absolute',
  },
  particle: {
    borderRadius: 50,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  glassContainer: {
    width: '85%',
    height: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
  },
  glassContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shineContainer: {
    position: 'absolute',
    width: '100%',
    height: 4,
    top: '30%',
  },
  shine: {
    flex: 1,
    opacity: 0.6,
  },
});

export default WelcomeIntro;


