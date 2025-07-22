import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IllustrationProps } from '@/types';
import Logo from '@/components/Logo';

export const WelcomeIntro: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const morphAnimation = useRef(new Animated.Value(0)).current;
  const cinematicScale = useRef(new Animated.Value(1.2)).current;
  const cinematicOpacity = useRef(new Animated.Value(0)).current;
  
  const particleAnimations = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }))
  ).current;

  const glassLayers = useRef(
    Array.from({ length: 3 }, () => ({
      scale: new Animated.Value(0.8),
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }))
  ).current;

  const isDark = theme === 'dark';
  
  const colors = {
    primary: isDark ? '#4F46E5' : '#6366F1',
    secondary: isDark ? '#7C3AED' : '#8B5CF6',
    accent: isDark ? '#06B6D4' : '#0EA5E9',
    background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
    glass: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.3)',
    particle: isDark ? '#F1F5F9' : '#334155',
  };

  useEffect(() => {
    if (!animated) return;

    // Cinematic entrance animation
    const cinematicEntrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(cinematicScale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cinematicOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Glass layers staggered animation
    const glassLayerStagger = Animated.stagger(
      200,
      glassLayers.map((layer, index) =>
        Animated.sequence([
          Animated.delay(400 + index * 150),
          Animated.parallel([
            Animated.timing(layer.scale, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(layer.opacity, {
              toValue: 0.6 - index * 0.15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(layer.rotation, {
                toValue: 1,
                duration: 8000 + index * 2000,
                easing: Easing.linear,
                useNativeDriver: true,
              })
            ),
          ]),
        ])
      )
    );

    // Enhanced logo animation with morphing
    const logoAnimation = Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.1),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(logoRotation, {
              toValue: 1,
              duration: 12000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(logoRotation, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]);

    // Advanced particle system with 3D-like movement
    const particleStagger = Animated.stagger(
      80,
      particleAnimations.map((particle, index) => {
        const angle = (index * 30) * (Math.PI / 180);
        const radius = 30 + Math.random() * 40;
        
        return Animated.sequence([
          Animated.delay(1000 + index * 60),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0.7 + Math.random() * 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.8 + Math.random() * 0.4,
              duration: 500,
              easing: Easing.out(Easing.back(1.3)),
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.translateX, {
                  toValue: radius * Math.cos(angle),
                  duration: 3000 + Math.random() * 2000,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(particle.translateX, {
                  toValue: -radius * Math.cos(angle),
                  duration: 3000 + Math.random() * 2000,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.translateY, {
                  toValue: -radius * Math.sin(angle),
                  duration: 2500 + Math.random() * 1500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(particle.translateY, {
                  toValue: radius * Math.sin(angle),
                  duration: 2500 + Math.random() * 1500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
            Animated.loop(
              Animated.timing(particle.rotation, {
                toValue: 1,
                duration: 4000 + Math.random() * 2000,
                easing: Easing.linear,
                useNativeDriver: true,
              })
            ),
          ]),
        ]);
      })
    );

    // Enhanced glow with morphing effect
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Morphing animation for glass container
    const morphLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(morphAnimation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(morphAnimation, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      cinematicEntrance,
      glassLayerStagger,
      logoAnimation,
      particleStagger,
      glowLoop,
      morphLoop,
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [animated, theme]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primary + '20', colors.secondary + '10', colors.accent + '15']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Enhanced floating particles with 3D movement */}
      {particleAnimations.map((particle, index) => {
        const particleRotation = particle.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                  { rotate: particleRotation },
                ],
                left: `${15 + (index % 4) * 20}%`,
                top: `${20 + Math.floor(index / 4) * 25}%`,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.particle, colors.particle + '80', colors.particle + '40']}
              style={styles.particleDot}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
        );
      })}

      {/* Cinematic container with morphing */}
      <Animated.View
        style={[
          styles.cinematicContainer,
          {
            opacity: cinematicOpacity,
            transform: [{ scale: cinematicScale }],
          },
        ]}
      >
        {/* Multiple glass layers for depth */}
        {glassLayers.map((layer, index) => {
          const layerRotation = layer.rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });

          const morphScale = morphAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05 + index * 0.02],
          });

          return (
            <Animated.View
              key={`glass-layer-${index}`}
              style={[
                styles.glassLayer,
                {
                  opacity: layer.opacity,
                  transform: [
                    { scale: layer.scale },
                    { rotate: layerRotation },
                    { scale: morphScale },
                  ],
                  zIndex: -index,
                },
              ]}
            >
              <BlurView
                intensity={20 + index * 10}
                tint={isDark ? 'dark' : 'light'}
                style={styles.layerBlur}
              >
                <LinearGradient
                  colors={[
                    colors.glass + (60 - index * 15).toString(16),
                    colors.glass + (40 - index * 10).toString(16),
                  ]}
                  style={styles.layerGradient}
                />
              </BlurView>
            </Animated.View>
          );
        })}
      </Animated.View>

      {/* Glassmorphism container */}
      <View style={styles.glassContainer}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <LinearGradient
            colors={[colors.glass, colors.glass + '80']}
            style={styles.glassOverlay}
          />
          
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
                backgroundColor: colors.primary + '30',
              },
            ]}
          />

          {/* Logo container */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Logo size={size * 0.3} />
          </Animated.View>

          {/* Glass reflection effect */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.4)',
              'rgba(255, 255, 255, 0.1)',
              'transparent',
            ]}
            style={styles.reflection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </BlurView>
      </View>

      {/* Subtle border glow */}
      <View
        style={[
          styles.borderGlow,
          {
            borderColor: colors.primary + '40',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glassContainer: {
    width: '75%',
    height: '75%',
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  glowEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 40,
    zIndex: 0,
  },
  logoContainer: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '60%',
    bottom: '60%',
    borderTopLeftRadius: 32,
    zIndex: 1,
  },
  borderGlow: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 32,
    borderWidth: 1,
    zIndex: 3,
  },
  particle: {
    position: 'absolute',
    zIndex: 0,
  },
  particleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  cinematicContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  glassLayer: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 40,
  },
  layerBlur: {
    flex: 1,
    borderRadius: 40,
  },
  layerGradient: {
    flex: 1,
    borderRadius: 40,
  },
});