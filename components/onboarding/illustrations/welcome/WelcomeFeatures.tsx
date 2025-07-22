import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Wallet, Shield, Zap, Users, Globe } from 'lucide-react-native';
import { IllustrationProps } from '@/types';

export const WelcomeFeatures: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  const containerScale = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const isometricRotation = useRef(new Animated.Value(0)).current;
  const depthAnimation = useRef(new Animated.Value(0)).current;
  
  const featureAnimations = useRef(
    Array.from({ length: 6 }, () => ({
      scale: new Animated.Value(0),
      rotateY: new Animated.Value(0),
      rotateX: new Animated.Value(0),
      translateY: new Animated.Value(20),
      translateZ: new Animated.Value(0),
      opacity: new Animated.Value(0),
      shadowOpacity: new Animated.Value(0),
      glowIntensity: new Animated.Value(0),
    }))
  ).current;

  const connectionAnimations = useRef(
    Array.from({ length: 6 }, () => ({
      opacity: new Animated.Value(0),
      scaleX: new Animated.Value(0),
      flowAnimation: new Animated.Value(0),
    }))
  ).current;

  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const orbitalAnimation = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';
  
  const colors = {
    primary: isDark ? '#4F46E5' : '#6366F1',
    secondary: isDark ? '#7C3AED' : '#8B5CF6',
    accent: isDark ? '#06B6D4' : '#0EA5E9',
    success: isDark ? '#10B981' : '#059669',
    warning: isDark ? '#F59E0B' : '#D97706',
    error: isDark ? '#EF4444' : '#DC2626',
    background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.9)',
    card: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    connection: isDark ? '#64748B' : '#94A3B8',
  };

  const features = [
    { icon: QrCode, color: colors.primary, name: 'QR Payments' },
    { icon: Wallet, color: colors.accent, name: 'Digital Wallet' },
    { icon: Shield, color: colors.success, name: 'Security' },
    { icon: Zap, color: colors.warning, name: 'Instant' },
    { icon: Users, color: colors.secondary, name: 'Social' },
    { icon: Globe, color: colors.error, name: 'Global' },
  ];

  useEffect(() => {
    if (!animated) return;

    // Enhanced container animation with isometric entrance
    const containerAnimation = Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(containerScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Isometric rotation for 3D effect
    const isometricLoop = Animated.loop(
      Animated.timing(isometricRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Depth animation for layered effect
    const depthLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(depthAnimation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(depthAnimation, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Orbital animation for dynamic positioning
    const orbitalLoop = Animated.loop(
      Animated.timing(orbitalAnimation, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Enhanced feature stagger with 3D effects
    const featureStagger = Animated.stagger(
      100,
      featureAnimations.map((feature, index) =>
        Animated.sequence([
          Animated.delay(400 + index * 60),
          Animated.parallel([
            Animated.timing(feature.scale, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.back(1.4)),
              useNativeDriver: true,
            }),
            Animated.timing(feature.opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(feature.translateY, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(feature.shadowOpacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            // 3D rotation with multiple axes
            Animated.loop(
              Animated.sequence([
                Animated.timing(feature.rotateY, {
                  toValue: 1,
                  duration: 4000 + index * 300,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(feature.rotateY, {
                  toValue: 0,
                  duration: 4000 + index * 300,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
            Animated.loop(
              Animated.sequence([
                Animated.timing(feature.rotateX, {
                  toValue: 1,
                  duration: 6000 + index * 400,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(feature.rotateX, {
                  toValue: 0,
                  duration: 6000 + index * 400,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
            // Glow intensity animation
            Animated.loop(
              Animated.sequence([
                Animated.timing(feature.glowIntensity, {
                  toValue: 1,
                  duration: 2000 + index * 200,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(feature.glowIntensity, {
                  toValue: 0,
                  duration: 2000 + index * 200,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
          ]),
        ])
      )
    );

    // Enhanced connection animations with flow effect
    const connectionStagger = Animated.stagger(
      80,
      connectionAnimations.map((connection, index) =>
        Animated.sequence([
          Animated.delay(1000 + index * 120),
          Animated.parallel([
            Animated.timing(connection.opacity, {
              toValue: 0.7,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(connection.scaleX, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            // Flow animation for data visualization
            Animated.loop(
              Animated.timing(connection.flowAnimation, {
                toValue: 1,
                duration: 2000 + index * 300,
                easing: Easing.linear,
                useNativeDriver: true,
              })
            ),
          ]),
        ])
      )
    );

    // Enhanced pulse with breathing effect
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      containerAnimation,
      isometricLoop,
      depthLoop,
      orbitalLoop,
      featureStagger,
      connectionStagger,
      pulseLoop,
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [animated, theme]);

  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const pulseOpacity = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const getFeaturePosition = (index: number) => {
    const centerX = size * 0.45; // 45% of container size
    const centerY = size * 0.45; // 45% of container size
    const radius = size * 0.315; // 31.5% of container size (35% of 90%)
    const angle = (index * 60) * (Math.PI / 180); // 60 degrees apart
    
    return {
      left: centerX + radius * Math.cos(angle),
      top: centerY + radius * Math.sin(angle),
    };
  };

  const getConnectionPath = (fromIndex: number, toIndex: number, containerSize: number) => {
    const from = getFeaturePosition(fromIndex);
    const to = getFeaturePosition(toIndex);
    
    // Values are already numeric pixels
    const fromLeft = from.left;
    const fromTop = from.top;
    const toLeft = to.left;
    const toTop = to.top;
    
    const width = Math.abs(toLeft - fromLeft);
    const angle = Math.atan2(toTop - fromTop, toLeft - fromLeft);
    
    return {
      left: fromLeft,
      top: fromTop,
      width: width,
      transform: [
        {
          rotate: `${angle}rad`,
        },
      ],
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background, colors.background + '80']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Main container */}
      <Animated.View
        style={[
          styles.featuresContainer,
          {
            opacity: containerOpacity,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        {/* Connection lines */}
        {connectionAnimations.map((connection, index) => {
          const containerSize = size * 0.9; // 90% of the total size
          const connectionPath = getConnectionPath(index, (index + 1) % features.length, containerSize);
          return (
            <Animated.View
              key={`connection-${index}`}
              style={[
                styles.connection,
                {
                  opacity: connection.opacity,
                  backgroundColor: colors.connection,
                  left: connectionPath.left,
                  top: connectionPath.top,
                  width: connectionPath.width,
                  transform: [
                    { scaleX: connection.scaleX },
                    ...connectionPath.transform,
                  ],
                },
              ]}
            />
          );
        })}

        {/* Enhanced feature icons with 3D isometric effects */}
        {features.map((feature, index) => {
          const animation = featureAnimations[index];
          const position = getFeaturePosition(index);
          const IconComponent = feature.icon;

          // Enhanced 3D rotations
          const rotateY = animation.rotateY.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });

          const rotateX = animation.rotateX.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '15deg'],
          });

          // Isometric perspective adjustment
          const isometricRotation = orbitalAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${index * 60}deg`],
          });

          // Depth-based scaling
          const depthScale = depthAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1 + index * 0.02],
          });

          // Glow effect
          const glowOpacity = animation.glowIntensity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
          });

          const glowScale = animation.glowIntensity.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.2],
          });

          return (
            <Animated.View
              key={`feature-${index}`}
              style={[
                styles.featureItem,
                {
                  left: position.left,
                  top: position.top,
                  opacity: animation.opacity,
                  transform: [
                    { scale: animation.scale },
                    { translateY: animation.translateY },
                    { rotateY },
                    { rotateX },
                    { rotate: isometricRotation },
                    { scale: depthScale },
                  ],
                },
              ]}
            >
              {/* Enhanced isometric shadow with depth */}
              <Animated.View
                style={[
                  styles.isometricShadow,
                  {
                    backgroundColor: feature.color + '15',
                    opacity: animation.shadowOpacity,
                    transform: [
                      { scale: depthScale },
                      { translateX: 6 + index * 2 },
                      { translateY: 6 + index * 2 },
                    ],
                  },
                ]}
              />

              {/* Glow effect for premium feel */}
              <Animated.View
                style={[
                  styles.glowEffect,
                  {
                    backgroundColor: feature.color + '30',
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />
              
              {/* Enhanced feature card with 3D effects */}
              <Animated.View
                style={[
                  styles.featureCard,
                  {
                    transform: [
                      { scale: pulseScale },
                      { perspective: 1000 },
                    ],
                    opacity: pulseOpacity,
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    colors.card,
                    colors.card + '95',
                    colors.card + '85',
                  ]}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                
                {/* Enhanced icon container with depth */}
                <View
                  style={[
                    styles.iconContainer,
                    { 
                      backgroundColor: feature.color + '15',
                      borderWidth: 1,
                      borderColor: feature.color + '30',
                    },
                  ]}
                >
                  <IconComponent
                    size={size * 0.08}
                    color={feature.color}
                    strokeWidth={2.5}
                  />
                  
                  {/* Icon glow overlay */}
                  <Animated.View
                    style={[
                      styles.iconGlow,
                      {
                        backgroundColor: feature.color + '20',
                        opacity: glowOpacity,
                      },
                    ]}
                  />
                </View>

                {/* Enhanced highlight with 3D effect */}
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.4)',
                    'rgba(255, 255, 255, 0.2)',
                    'rgba(255, 255, 255, 0.05)',
                    'transparent',
                  ]}
                  style={styles.highlight}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                {/* 3D edge highlight */}
                <View
                  style={[
                    styles.edgeHighlight,
                    { borderColor: feature.color + '40' },
                  ]}
                />
              </Animated.View>
            </Animated.View>
          );
        })}

        {/* Center pulse */}
        <Animated.View
          style={[
            styles.centerPulse,
            {
              opacity: pulseAnimation,
              transform: [{ scale: pulseScale }],
              backgroundColor: colors.primary + '20',
            },
          ]}
        />
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
  featuresContainer: {
    width: '90%',
    height: '90%',
    position: 'relative',
  },
  featureItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
  },
  isometricShadow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    top: 4,
    left: 4,
    zIndex: 0,
  },
  featureCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 1,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    bottom: '50%',
    borderTopLeftRadius: 16,
  },
  connection: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    zIndex: 0,
  },
  centerPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    zIndex: 0,
  },
  glowEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 20,
    top: -6,
    left: -6,
    zIndex: 0,
  },
  iconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    zIndex: 1,
  },
  edgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 2,
  },
});