import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { 
  Defs, 
  LinearGradient, 
  Stop, 
  Rect, 
  Circle, 
  G,
  RadialGradient,
  Filter,
  FeGaussianBlur,
  FeOffset,
  FeMerge,
  FeMergeNode
} from 'react-native-svg';
import { IllustrationProps } from '@/types';

export const QRGenerateDemo: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  const containerAnim = useRef(new Animated.Value(0)).current;
  const glassAnim = useRef(new Animated.Value(0)).current;
  const pixelAnimations = useRef([...Array(64)].map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const [pixelsVisible, setPixelsVisible] = useState<boolean[]>(new Array(64).fill(false));

  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#8B5CF6' : '#A855F7';
  const secondaryColor = isDark ? '#06B6D4' : '#0891B2';
  const accentColor = isDark ? '#F59E0B' : '#D97706';
  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
  const glassColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)';
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    if (!animated) return;

    const startAnimations = () => {
      // Container entrance
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();

      // Glass morphism effect
      Animated.timing(glassAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Pixel-by-pixel QR generation
      const animatePixels = () => {
        const qrPattern = [
          1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,
          1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1,
          1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,1,
          1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,1,
        ];

        pixelAnimations.forEach((anim, index) => {
          const shouldShow = qrPattern[index] === 1;
          if (shouldShow) {
            Animated.timing(anim, {
              toValue: 1,
              duration: 150,
              delay: index * 50,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start(() => {
              setPixelsVisible(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            });
          }
        });
      };

      setTimeout(animatePixels, 800);

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

      // Particle effects
      Animated.loop(
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Complete animation callback
      setTimeout(() => {
        onAnimationComplete?.();
      }, 4000);
    };

    startAnimations();
  }, [animated, onAnimationComplete]);

  const containerScale = containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const containerOpacity = containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glassOpacity = glassAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const particleRotation = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background with gradient */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={backgroundColor} stopOpacity="1" />
            <Stop offset="50%" stopColor={isDark ? '#1E293B' : '#E2E8F0'} stopOpacity="1" />
            <Stop offset="100%" stopColor={isDark ? '#0F172A' : '#F1F5F9'} stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="glowGradient" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </RadialGradient>
          <Filter id="glassShadow">
            <FeGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <FeOffset dx="0" dy="4" result="offset"/>
            <FeMerge>
              <FeMergeNode in="offset"/>
              <FeMergeNode in="SourceGraphic"/>
            </FeMerge>
          </Filter>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGradient)" />
        <Circle cx={size/2} cy={size/2} r={size * 0.4} fill="url(#glowGradient)" />
      </Svg>

      {/* Floating particles */}
      <Animated.View 
        style={[
          styles.particleContainer,
          { transform: [{ rotate: particleRotation }] }
        ]}
      >
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: [primaryColor, secondaryColor, accentColor][i % 3],
                top: `${20 + (i * 10) % 60}%`,
                left: `${15 + (i * 12) % 70}%`,
                opacity: animated ? 0.4 : 0,
                transform: [{ scale: 0.5 + (i % 3) * 0.3 }],
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Main glassmorphism container */}
      <Animated.View
        style={[
          styles.glassContainer,
          {
            transform: [{ scale: containerScale }],
            opacity: containerOpacity,
          }
        ]}
      >
        {/* Glass background with blur effect */}
        <Animated.View
          style={[
            styles.glassBackground,
            {
              backgroundColor: glassColor,
              opacity: glassOpacity,
              shadowColor: shadowColor,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }
          ]}
        />

        {/* QR Code generation area */}
        <Animated.View
          style={[
            styles.qrContainer,
            {
              transform: [{ scale: pulseScale }],
            }
          ]}
        >
          <View style={styles.qrGrid}>
            {[...Array(8)].map((_, row) => (
              <View key={row} style={styles.qrRow}>
                {[...Array(8)].map((_, col) => {
                  const index = row * 8 + col;
                  const pixelAnim = pixelAnimations[index];
                  const shouldShow = [
                    1,1,1,1,1,1,1,0,
                    1,0,0,0,0,0,1,0,
                    1,0,1,1,1,0,1,0,
                    1,0,1,1,1,0,1,0,
                    1,0,1,1,1,0,1,0,
                    1,0,0,0,0,0,1,0,
                    1,1,1,1,1,1,1,0,
                    0,0,0,0,0,0,0,0,
                  ][index] === 1;

                  return (
                    <Animated.View
                      key={col}
                      style={[
                        styles.qrPixel,
                        {
                          backgroundColor: shouldShow ? (isDark ? '#FFFFFF' : '#000000') : 'transparent',
                          opacity: shouldShow ? pixelAnim : 0,
                          transform: [
                            {
                              scale: pixelAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                              })
                            }
                          ],
                        }
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          {/* Generation progress indicator */}
          <View style={styles.progressContainer}>
            {[...Array(3)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: secondaryColor,
                    opacity: containerAnim,
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        })
                      }
                    ],
                  }
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Interface elements */}
        <View style={styles.interfaceElements}>
          {/* Amount display */}
          <Animated.View
            style={[
              styles.amountDisplay,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                opacity: glassOpacity,
              }
            ]}
          >
            <View style={[styles.amountText, { backgroundColor: primaryColor }]} />
          </Animated.View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {[...Array(2)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: i === 0 ? primaryColor : secondaryColor,
                    opacity: glassOpacity,
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        })
                      }
                    ],
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Success ripple effect */}
      <Animated.View
        style={[
          styles.rippleEffect,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                })
              }
            ],
          }
        ]}
      >
        <View style={[styles.ripple, { borderColor: primaryColor }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  glassContainer: {
    width: '75%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glassBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrGrid: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  qrRow: {
    flexDirection: 'row',
    flex: 1,
  },
  qrPixel: {
    flex: 1,
    margin: 0.5,
    borderRadius: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  interfaceElements: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  amountDisplay: {
    width: '80%',
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  amountText: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 60,
    height: 32,
    borderRadius: 16,
    opacity: 0.9,
  },
  rippleEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    borderWidth: 2,
    opacity: 0.5,
  },
});