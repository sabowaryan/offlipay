import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
  G,
  RadialGradient
} from 'react-native-svg';
import { IllustrationProps } from '@/types';

export const PaymentSuccess: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnimations = useRef([...Array(20)].map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnimations = useRef([...Array(8)].map(() => new Animated.Value(0))).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#10B981' : '#059669';
  const secondaryColor = isDark ? '#F59E0B' : '#D97706';
  const accentColor = isDark ? '#EC4899' : '#DB2777';
  const backgroundColor = isDark ? '#0F172A' : '#F0FDF4';
  const successColor = isDark ? '#34D399' : '#10B981';

  const confettiColors = [primaryColor, secondaryColor, accentColor, '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    if (!animated) return;

    const startAnimations = () => {
      // Success circle animation
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();

      // Checkmark drawing animation
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Confetti explosion
      confettiAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          delay: 600 + index * 50,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });

      // Sparkle effects
      sparkleAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              delay: index * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Celebration wave
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 1500,
        delay: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Complete animation callback
      setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
    };

    startAnimations();
  }, [animated, onAnimationComplete]);

  const circleScale = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const checkmarkScale = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const [checkmarkOpacity, setCheckmarkOpacity] = useState(0);

  useEffect(() => {
    if (animated) {
      const listener = checkmarkAnim.addListener(({ value }) => {
        setCheckmarkOpacity(value);
      });

      return () => {
        checkmarkAnim.removeListener(listener);
      };
    }
  }, [animated, checkmarkAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const celebrationScale = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const celebrationOpacity = celebrationAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0.7],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background with gradient */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={backgroundColor} stopOpacity="1" />
            <Stop offset="50%" stopColor={isDark ? '#064E3B' : '#ECFDF5'} stopOpacity="1" />
            <Stop offset="100%" stopColor={isDark ? '#0F172A' : '#F0FDF4'} stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="successGlow" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor={successColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={successColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#bgGradient)" />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.4} fill="url(#successGlow)" />
      </Svg>

      {/* Confetti particles */}
      {confettiAnimations.map((anim, index) => {
        const angle = (index / confettiAnimations.length) * 2 * Math.PI;
        const distance = 80 + Math.random() * 60;
        const confettiX = Math.cos(angle) * distance;
        const confettiY = Math.sin(angle) * distance;

        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, confettiX],
        });

        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, confettiY + 50], // Add gravity effect
        });

        const rotation = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${360 + Math.random() * 360}deg`],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: confettiColors[index % confettiColors.length],
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: rotation },
                ],
                opacity,
              }
            ]}
          />
        );
      })}

      {/* Sparkle effects */}
      {sparkleAnimations.map((anim, index) => {
        const sparkleAngle = (index / sparkleAnimations.length) * 2 * Math.PI;
        const sparkleDistance = 100 + index * 15;
        const sparkleX = Math.cos(sparkleAngle) * sparkleDistance;
        const sparkleY = Math.sin(sparkleAngle) * sparkleDistance;

        const sparkleOpacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        const sparkleScale = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1.5, 0],
        });

        return (
          <Animated.View
            key={`sparkle-${index}`}
            style={[
              styles.sparkle,
              {
                left: size / 2 + sparkleX - 4,
                top: size / 2 + sparkleY - 4,
                opacity: sparkleOpacity,
                transform: [{ scale: sparkleScale }],
              }
            ]}
          >
            <Svg width="8" height="8" viewBox="0 0 8 8">
              <Path
                d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z"
                fill={confettiColors[index % confettiColors.length]}
              />
            </Svg>
          </Animated.View>
        );
      })}

      {/* Main success circle */}
      <Animated.View
        style={[
          styles.successCircle,
          {
            transform: [
              { scale: Animated.multiply(circleScale, pulseScale) }
            ],
          }
        ]}
      >
        <Svg width={size * 0.4} height={size * 0.4} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={successColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity="1" />
            </LinearGradient>
            <RadialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" stopOpacity="1" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Circle background */}
          <Circle cx="50" cy="50" r="45" fill="url(#circleGradient)" />
          <Circle cx="50" cy="50" r="45" fill="url(#innerGlow)" />

          {/* Checkmark */}
          <G>
            <Path
              d="M25 50 L40 65 L75 30"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={checkmarkOpacity}
            />
          </G>
        </Svg>
      </Animated.View>

      {/* Celebration rings */}
      <Animated.View
        style={[
          styles.celebrationRings,
          {
            opacity: celebrationOpacity,
            transform: [{ scale: celebrationScale }],
          }
        ]}
      >
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          {[...Array(3)].map((_, i) => (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={size * (0.25 + i * 0.1)}
              stroke={confettiColors[i % confettiColors.length]}
              strokeWidth="2"
              strokeOpacity={0.6 - i * 0.2}
              fill="none"
              strokeDasharray="10,5"
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Success message area */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: celebrationOpacity,
            transform: [{
              translateY: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }],
          }
        ]}
      >
        <View style={styles.messageBox}>
          <View style={[styles.messageLine, { backgroundColor: successColor, width: '60%' }]} />
          <View style={[styles.messageLine, { backgroundColor: primaryColor, width: '40%', marginTop: 8 }]} />
        </View>
      </Animated.View>

      {/* Floating success icons */}
      {[...Array(4)].map((_, i) => {
        const iconAnim = celebrationAnim;
        const iconAngle = (i / 4) * 2 * Math.PI;
        const iconDistance = 120;
        const iconX = Math.cos(iconAngle) * iconDistance;
        const iconY = Math.sin(iconAngle) * iconDistance;

        return (
          <Animated.View
            key={`icon-${i}`}
            style={[
              styles.floatingIcon,
              {
                left: size / 2 + iconX - 12,
                top: size / 2 + iconY - 12,
                opacity: celebrationOpacity,
                transform: [
                  {
                    scale: iconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  },
                  {
                    rotate: iconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    })
                  }
                ],
              }
            ]}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                fill={confettiColors[i % confettiColors.length]}
              />
            </Svg>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 12,
    left: '50%',
    top: '50%',
    marginLeft: -4,
    marginTop: -6,
    borderRadius: 2,
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  successCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  celebrationRings: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    position: 'absolute',
    bottom: '20%',
    alignItems: 'center',
  },
  messageBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageLine: {
    height: 4,
    borderRadius: 2,
  },
  floatingIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
});