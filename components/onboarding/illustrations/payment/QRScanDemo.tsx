import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { 
  Defs, 
  LinearGradient, 
  Stop, 
  Rect, 
  Circle, 
  G,
  ClipPath,
  RadialGradient
} from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
import { IllustrationProps } from '@/types';

export const QRScanDemo: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const phoneRotateAnim = useRef(new Animated.Value(0)).current;
  const qrOpacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#4F46E5' : '#6366F1';
  const secondaryColor = isDark ? '#10B981' : '#059669';
  const backgroundColor = isDark ? '#1F2937' : '#F9FAFB';
  const phoneColor = isDark ? '#374151' : '#E5E7EB';
  const screenColor = isDark ? '#111827' : '#FFFFFF';

  useEffect(() => {
    if (!animated) return;

    const startAnimations = () => {
      // Phone subtle rotation animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(phoneRotateAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(phoneRotateAnim, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // QR code appearance
      Animated.timing(qrOpacityAnim, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Scan line animation
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ).start();

      // Glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Particle effects
      Animated.loop(
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Complete animation callback
      setTimeout(() => {
        onAnimationComplete?.();
      }, 2500);
    };

    startAnimations();
  }, [animated, onAnimationComplete]);

  const phoneRotation = phoneRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.4],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const particleRotation = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background with subtle gradient */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={backgroundColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={isDark ? '#0F172A' : '#F1F5F9'} stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGradient)" />
      </Svg>

      {/* Floating particles */}
      <Animated.View 
        style={[
          styles.particleContainer,
          { transform: [{ rotate: particleRotation }] }
        ]}
      >
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                top: `${15 + i * 12}%`,
                left: `${10 + (i * 15) % 70}%`,
                opacity: animated ? 0.6 : 0,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* 3D Phone with isometric perspective */}
      <Animated.View 
        style={[
          styles.phoneContainer,
          { transform: [{ rotate: phoneRotation }] }
        ]}
      >
        <Svg width={size * 0.6} height={size * 0.8} viewBox="0 0 200 300">
          <Defs>
            <LinearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={phoneColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={isDark ? '#1F2937' : '#D1D5DB'} stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={screenColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={isDark ? '#374151' : '#F3F4F6'} stopOpacity="1" />
            </LinearGradient>
            <ClipPath id="screenClip">
              <Rect x="20" y="40" width="160" height="220" rx="8" />
            </ClipPath>
          </Defs>

          {/* Phone body with 3D effect */}
          <G>
            {/* Shadow/depth */}
            <Rect x="8" y="8" width="184" height="284" rx="25" fill={isDark ? '#000000' : '#9CA3AF'} opacity="0.2" />
            {/* Main body */}
            <Rect x="0" y="0" width="184" height="284" rx="25" fill="url(#phoneGradient)" />
            {/* Screen */}
            <Rect x="20" y="40" width="160" height="220" rx="8" fill="url(#screenGradient)" />
            
            {/* Home indicator */}
            <Rect x="80" y="270" width="40" height="4" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'} />
          </G>

          {/* QR Code with animated appearance */}
          <G clipPath="url(#screenClip)">
            <AnimatedG style={{ opacity: qrOpacityAnim }}>
              {/* QR Code background */}
              <Rect x="50" y="80" width="100" height="100" fill={isDark ? '#FFFFFF' : '#000000'} rx="4" />
              
              {/* QR Code pattern (simplified) */}
              {[...Array(8)].map((_, row) => 
                [...Array(8)].map((_, col) => {
                  const shouldFill = (row + col) % 2 === 0 || (row === 0 || row === 7 || col === 0 || col === 7);
                  return shouldFill ? (
                    <Rect
                      key={`${row}-${col}`}
                      x={55 + col * 11}
                      y={85 + row * 11}
                      width="9"
                      height="9"
                      fill={isDark ? '#000000' : '#FFFFFF'}
                    />
                  ) : null;
                })
              )}

              {/* Corner markers */}
              <Rect x="55" y="85" width="25" height="25" fill={isDark ? '#000000' : '#FFFFFF'} />
              <Rect x="120" y="85" width="25" height="25" fill={isDark ? '#000000' : '#FFFFFF'} />
              <Rect x="55" y="150" width="25" height="25" fill={isDark ? '#000000' : '#FFFFFF'} />
            </Animated.G>
          </G>
        </Svg>

        {/* Scan line overlay */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [{ translateY: scanLineY }],
              opacity: animated ? 1 : 0,
            }
          ]}
        >
          <Svg width={size * 0.5} height="3" viewBox="0 0 160 3">
            <Defs>
              <LinearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={secondaryColor} stopOpacity="0" />
                <Stop offset="50%" stopColor={secondaryColor} stopOpacity="1" />
                <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect width="160" height="3" fill="url(#scanGradient)" />
          </Svg>
        </Animated.View>

        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
            }
          ]}
        >
          <Svg width={size * 0.7} height={size * 0.9} style={StyleSheet.absoluteFill}>
            <Circle
              cx={size * 0.35}
              cy={size * 0.45}
              r={size * 0.25}
              fill="url(#glowGradient)"
            />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Success indicators */}
      <Animated.View 
        style={[
          styles.successIndicators,
          { opacity: qrOpacityAnim }
        ]}
      >
        {[...Array(3)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.successDot,
              {
                backgroundColor: secondaryColor,
                left: `${30 + i * 20}%`,
                animationDelay: `${i * 200}ms`,
              }
            ]}
          />
        ))}
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
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  phoneContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    top: '25%',
    left: '5%',
    width: '90%',
    height: 3,
    zIndex: 10,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  successIndicators: {
    position: 'absolute',
    bottom: '15%',
    width: '100%',
    height: 20,
  },
  successDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 6,
  },
});