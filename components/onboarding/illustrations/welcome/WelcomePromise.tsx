import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Lock, CheckCircle, Zap, Clock, Globe } from 'lucide-react-native';
import { IllustrationProps } from '@/types';

export const WelcomePromise: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  const containerScale = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const neomorphDepth = useRef(new Animated.Value(0)).current;
  const securityPulse = useRef(new Animated.Value(0)).current;

  const shieldAnimations = useRef({
    scale: new Animated.Value(0),
    rotateZ: new Animated.Value(0),
    opacity: new Animated.Value(0),
    morphScale: new Animated.Value(1),
    innerGlow: new Animated.Value(0),
  }).current;

  const badgeAnimations = useRef(
    Array.from({ length: 5 }, () => ({
      scale: new Animated.Value(0),
      translateY: new Animated.Value(30),
      opacity: new Animated.Value(0),
      pulse: new Animated.Value(0),
      neomorphDepth: new Animated.Value(0),
      securityGlow: new Animated.Value(0),
    }))
  ).current;

  const securityRingAnimation = useRef(new Animated.Value(0)).current;
  const encryptionAnimation = useRef(new Animated.Value(0)).current;
  const validationAnimation = useRef(new Animated.Value(0)).current;
  const dataFlowAnimation = useRef(new Animated.Value(0)).current;
  const protectionFieldAnimation = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';

  const colors = {
    primary: isDark ? '#4F46E5' : '#6366F1',
    success: isDark ? '#10B981' : '#059669',
    warning: isDark ? '#F59E0B' : '#D97706',
    accent: isDark ? '#06B6D4' : '#0EA5E9',
    background: isDark ? '#0F172A' : '#F8FAFC',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    surfaceLight: isDark ? '#334155' : '#F1F5F9',
    text: isDark ? '#F1F5F9' : '#334155',
    border: isDark ? '#475569' : '#CBD5E1',
  };

  const badges = [
    { icon: Shield, color: colors.success, label: 'Secure', angle: 0 },
    { icon: Lock, color: colors.primary, label: 'Encrypted', angle: 72 },
    { icon: CheckCircle, color: colors.success, label: 'Verified', angle: 144 },
    { icon: Zap, color: colors.warning, label: 'Fast', angle: 216 },
    { icon: Globe, color: colors.accent, label: 'Global', angle: 288 },
  ];

  useEffect(() => {
    if (!animated) return;

    // Enhanced container animation with neomorphism depth
    const containerAnimation = Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(containerScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Neomorphism depth animation
    const neomorphLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(neomorphDepth, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(neomorphDepth, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Security pulse for overall protection feeling
    const securityPulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(securityPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(securityPulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Enhanced shield animation with morphing and inner glow
    const shieldAnimation = Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(shieldAnimations.scale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(shieldAnimations.opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(shieldAnimations.rotateZ, {
            toValue: 1,
            duration: 12000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(shieldAnimations.morphScale, {
              toValue: 1.05,
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shieldAnimations.morphScale, {
              toValue: 1,
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(shieldAnimations.innerGlow, {
              toValue: 1,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shieldAnimations.innerGlow, {
              toValue: 0,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]);

    // Enhanced badge stagger with neomorphism and security glow
    const badgeStagger = Animated.stagger(
      120,
      badgeAnimations.map((badge, index) =>
        Animated.sequence([
          Animated.delay(600 + index * 80),
          Animated.parallel([
            Animated.timing(badge.scale, {
              toValue: 1,
              duration: 700,
              easing: Easing.out(Easing.back(1.3)),
              useNativeDriver: true,
            }),
            Animated.timing(badge.opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(badge.translateY, {
              toValue: 0,
              duration: 700,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(badge.neomorphDepth, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            // Enhanced pulse with security glow
            Animated.loop(
              Animated.sequence([
                Animated.timing(badge.pulse, {
                  toValue: 1,
                  duration: 1800 + index * 150,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(badge.pulse, {
                  toValue: 0,
                  duration: 1800 + index * 150,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
            // Security glow animation
            Animated.loop(
              Animated.sequence([
                Animated.delay(index * 300),
                Animated.timing(badge.securityGlow, {
                  toValue: 1,
                  duration: 1000,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(badge.securityGlow, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]),
        ])
      )
    );

    // Enhanced security rings with multiple layers
    const securityRingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(securityRingAnimation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(securityRingAnimation, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Enhanced encryption with data flow visualization
    const encryptionLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(encryptionAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(encryptionAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );

    // Data flow animation for security visualization
    const dataFlowLoop = Animated.loop(
      Animated.timing(dataFlowAnimation, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Protection field animation
    const protectionFieldLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(protectionFieldAnimation, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(protectionFieldAnimation, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Enhanced validation with security confirmation
    const validationLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(validationAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(validationAnimation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      containerAnimation,
      neomorphLoop,
      securityPulseLoop,
      shieldAnimation,
      badgeStagger,
      securityRingLoop,
      encryptionLoop,
      dataFlowLoop,
      protectionFieldLoop,
      validationLoop,
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [animated, theme]);

  const shieldRotation = shieldAnimations.rotateZ.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const securityRingScale = securityRingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const securityRingOpacity = securityRingAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  const encryptionRotation = encryptionAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getBadgePosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    const centerOffset = size * 0.5;
    const radiusPixels = (radius / 100) * size;

    return {
      left: centerOffset + radiusPixels * Math.cos(radian) - 25, // Subtract half badge width
      top: centerOffset + radiusPixels * Math.sin(radian) - 25,  // Subtract half badge height
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background */}
      <LinearGradient
        colors={[colors.background, colors.surfaceLight]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Main container */}
      <Animated.View
        style={[
          styles.promiseContainer,
          {
            opacity: containerOpacity,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        {/* Security rings */}
        <Animated.View
          style={[
            styles.securityRing,
            styles.outerRing,
            {
              opacity: securityRingOpacity,
              transform: [{ scale: securityRingScale }],
              borderColor: colors.primary + '40',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.securityRing,
            styles.middleRing,
            {
              opacity: securityRingOpacity,
              transform: [{ scale: securityRingScale }],
              borderColor: colors.success + '60',
            },
          ]}
        />

        {/* Central shield */}
        <Animated.View
          style={[
            styles.centralShield,
            {
              opacity: shieldAnimations.opacity,
              transform: [
                { scale: shieldAnimations.scale },
                { rotateZ: shieldRotation },
              ],
            },
          ]}
        >
          {/* Neomorphism container */}
          <View
            style={[
              styles.neomorphContainer,
              {
                backgroundColor: colors.surface,
                shadowColor: isDark ? '#000' : colors.border,
              },
            ]}
          >
            {/* Inner shadow for neomorphism */}
            <View
              style={[
                styles.innerShadow,
                {
                  shadowColor: isDark ? '#000' : colors.border,
                },
              ]}
            />

            {/* Shield icon */}
            <View style={styles.shieldIconContainer}>
              <Shield
                size={size * 0.12}
                color={colors.success}
                strokeWidth={2}
              />
            </View>

            {/* Encryption progress ring */}
            <Animated.View
              style={[
                styles.encryptionRing,
                {
                  transform: [{ rotateZ: encryptionRotation }],
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.accent, 'transparent']}
                style={styles.encryptionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Validation checkmark */}
            <Animated.View
              style={[
                styles.validationCheck,
                {
                  opacity: validationAnimation,
                  transform: [
                    {
                      scale: validationAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <CheckCircle
                size={size * 0.06}
                color={colors.success}
                strokeWidth={3}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Enhanced security badges with neomorphism and security glow */}
        {badges.map((badge, index) => {
          const animation = badgeAnimations[index];
          const position = getBadgePosition(badge.angle, 35);
          const IconComponent = badge.icon;

          const pulseScale = animation.pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.15],
          });

          const pulseOpacity = animation.pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          });

          // Enhanced neomorphism depth
          const neomorphScale = animation.neomorphDepth.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.02],
          });

          const neomorphShadow = animation.neomorphDepth.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.2],
          });

          // Security glow effect
          const securityGlowOpacity = animation.securityGlow.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.8],
          });

          const securityGlowScale = animation.securityGlow.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.3],
          });

          // Protection field effect
          const protectionOpacity = protectionFieldAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.6],
          });

          const protectionScale = protectionFieldAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });

          return (
            <Animated.View
              key={`badge-${index}`}
              style={[
                styles.securityBadge,
                {
                  left: position.left,
                  top: position.top,
                  opacity: animation.opacity,
                  transform: [
                    { scale: animation.scale },
                    { translateY: animation.translateY },
                  ],
                },
              ]}
            >
              {/* Protection field */}
              <Animated.View
                style={[
                  styles.protectionField,
                  {
                    backgroundColor: badge.color + '10',
                    borderColor: badge.color + '30',
                    opacity: protectionOpacity,
                    transform: [{ scale: protectionScale }],
                  },
                ]}
              />

              {/* Security glow */}
              <Animated.View
                style={[
                  styles.securityGlow,
                  {
                    backgroundColor: badge.color + '40',
                    opacity: securityGlowOpacity,
                    transform: [{ scale: securityGlowScale }],
                  },
                ]}
              />

              {/* Enhanced neomorphism badge */}
              <Animated.View
                style={[
                  styles.badgeContainer,
                  {
                    backgroundColor: colors.surface,
                    shadowColor: isDark ? '#000' : colors.border,
                    shadowOpacity: neomorphShadow,
                    transform: [
                      { scale: pulseScale },
                      { scale: neomorphScale },
                    ],
                    opacity: pulseOpacity,
                  },
                ]}
              >
                {/* Enhanced badge inner shadow for deeper neomorphism */}
                <Animated.View
                  style={[
                    styles.badgeInnerShadow,
                    {
                      shadowColor: isDark ? '#000' : colors.border,
                      shadowOpacity: neomorphShadow,
                    },
                  ]}
                />

                {/* Data flow visualization */}
                <Animated.View
                  style={[
                    styles.dataFlow,
                    {
                      opacity: dataFlowAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1, 0],
                      }),
                      transform: [
                        {
                          rotate: dataFlowAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[badge.color + '60', badge.color + '20', 'transparent']}
                    style={styles.dataFlowGradient}
                  />
                </Animated.View>

                {/* Enhanced badge icon with security indicators */}
                <View
                  style={[
                    styles.badgeIcon,
                    { 
                      backgroundColor: badge.color + '15',
                      borderWidth: 1,
                      borderColor: badge.color + '40',
                    },
                  ]}
                >
                  <IconComponent
                    size={size * 0.04}
                    color={badge.color}
                    strokeWidth={2.5}
                  />

                  {/* Security validation indicator */}
                  <Animated.View
                    style={[
                      styles.securityIndicator,
                      {
                        backgroundColor: colors.success,
                        opacity: animation.securityGlow,
                      },
                    ]}
                  />
                </View>

                {/* Enhanced badge highlight with security shimmer */}
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(255, 255, 255, 0.1)',
                    'rgba(255, 255, 255, 0.05)',
                    'transparent',
                  ]}
                  style={styles.badgeHighlight}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                {/* Security shimmer effect */}
                <Animated.View
                  style={[
                    styles.securityShimmer,
                    {
                      opacity: animation.securityGlow,
                      transform: [
                        {
                          translateX: animation.securityGlow.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 50],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['transparent', badge.color + '40', 'transparent']}
                    style={styles.shimmerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          );
        })}
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
  promiseContainer: {
    width: '90%',
    height: '90%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 1000,
    borderStyle: 'dashed',
  },
  outerRing: {
    width: '80%',
    height: '80%',
  },
  middleRing: {
    width: '65%',
    height: '65%',
  },
  centralShield: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  neomorphContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    position: 'relative',
  },
  innerShadow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 54,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  shieldIconContainer: {
    zIndex: 2,
  },
  encryptionRing: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: 66,
    zIndex: 1,
  },
  encryptionGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 66,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  validationCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 3,
  },
  securityBadge: {
    position: 'absolute',
    width: 50,
    height: 50,
    marginLeft: -25,
    marginTop: -25,
    zIndex: 1,
  },
  badgeContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  badgeInnerShadow: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 21,
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    bottom: '50%',
    borderTopLeftRadius: 25,
    zIndex: 1,
  },
  protectionField: {
    position: 'absolute',
    width: '130%',
    height: '130%',
    borderRadius: 32,
    borderWidth: 1,
    top: -7.5,
    left: -7.5,
    zIndex: 0,
  },
  securityGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 30,
    top: -5,
    left: -5,
    zIndex: 0,
  },
  dataFlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    zIndex: 1,
  },
  dataFlowGradient: {
    flex: 1,
    borderRadius: 25,
  },
  securityIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -2,
    right: -2,
    zIndex: 3,
  },
  securityShimmer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 2,
  },
  shimmerGradient: {
    flex: 1,
    width: '200%',
    borderRadius: 25,
  },
});