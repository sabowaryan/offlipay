import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IllustrationProps } from '../types';
import { LIGHT_COLORS, DARK_COLORS } from '../../../utils/theme';
import { 
  getOptimizedAnimationConfig, 
  getSVGOptimizations, 
  SVGMemoryManager,
  getOptimizedTiming,
  shouldUseComplexAnimations 
} from '../utils/performanceOptimization';

const { width } = Dimensions.get('window');
const ILLUSTRATION_SIZE = Math.min(width * 0.6, 300);

const WelcomeIllustration: React.FC<IllustrationProps> = ({
  animated = true,
  theme,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Get optimized configuration based on device performance
  const animConfig = getOptimizedAnimationConfig();
  const svgOptimizations = getSVGOptimizations();
  const memoryManager = SVGMemoryManager.getInstance();
  const useComplexAnimations = shouldUseComplexAnimations();
  const particleCount = animConfig.particleCount;
  
  const particleAnims = useRef(
    Array.from({ length: particleCount }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    if (animated && memoryManager.canStartAnimation('welcome-logo')) {
      memoryManager.startAnimation('welcome-logo');
      
      // Logo animation with performance optimization
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: getOptimizedTiming(800),
          useNativeDriver: animConfig.useNativeDriver,
        }),
        // Only add rotation if complex animations are supported
        ...(useComplexAnimations ? [
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: getOptimizedTiming(1000),
            useNativeDriver: animConfig.useNativeDriver,
          })
        ] : []),
      ]).start();

      // Particle animations only if device supports them
      if (particleCount > 0 && memoryManager.canStartAnimation('welcome-particles')) {
        memoryManager.startAnimation('welcome-particles');
        
        const particleAnimations = particleAnims.map((particle, index) => {
          const angle = (index * (360 / particleCount)) * (Math.PI / 180);
          const radius = useComplexAnimations ? 60 : 40; // Smaller radius for low-end devices
          
          return Animated.sequence([
            Animated.delay(getOptimizedTiming(500 + index * 100)),
            Animated.parallel([
              Animated.timing(particle.scale, {
                toValue: 1,
                duration: getOptimizedTiming(600),
                useNativeDriver: animConfig.useNativeDriver,
              }),
              Animated.timing(particle.opacity, {
                toValue: useComplexAnimations ? 0.8 : 0.6,
                duration: getOptimizedTiming(600),
                useNativeDriver: animConfig.useNativeDriver,
              }),
              Animated.timing(particle.translateX, {
                toValue: Math.cos(angle) * radius,
                duration: getOptimizedTiming(800),
                useNativeDriver: animConfig.useNativeDriver,
              }),
              Animated.timing(particle.translateY, {
                toValue: Math.sin(angle) * radius,
                duration: getOptimizedTiming(800),
                useNativeDriver: animConfig.useNativeDriver,
              }),
            ]),
            Animated.timing(particle.opacity, {
              toValue: 0.3,
              duration: getOptimizedTiming(1000),
              useNativeDriver: animConfig.useNativeDriver,
            }),
          ]);
        });

        Animated.parallel(particleAnimations).start(() => {
          memoryManager.stopAnimation('welcome-particles');
          onAnimationComplete?.();
        });
      } else {
        // Fallback completion for devices without particle support
        setTimeout(() => {
          onAnimationComplete?.();
        }, getOptimizedTiming(2000));
      }
    }

    // Cleanup function
    return () => {
      memoryManager.stopAnimation('welcome-logo');
      memoryManager.stopAnimation('welcome-particles');
    };
  }, [animated, scaleAnim, rotateAnim, particleAnims, onAnimationComplete, animConfig, useComplexAnimations, particleCount, memoryManager]);

  const logoRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: ILLUSTRATION_SIZE }}>
      {/* Particles */}
      {particleAnims.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            transform: [
              { scale: particle.scale },
              { translateX: particle.translateX },
              { translateY: particle.translateY },
            ],
            opacity: particle.opacity,
          }}
        >
          <Svg width="12" height="12" viewBox="0 0 12 12">
            <Circle
              cx="6"
              cy="6"
              r="4"
              fill={colors.ACCENT_ORANGE}
              opacity="0.8"
            />
          </Svg>
        </Animated.View>
      ))}

      {/* Main Logo */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotate: logoRotation },
          ],
        }}
      >
        <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.PRIMARY} />
              <Stop offset="100%" stopColor={colors.PRIMARY_LIGHT} />
            </LinearGradient>
            <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.ACCENT_ORANGE} />
              <Stop offset="100%" stopColor="#ff8a65" />
            </LinearGradient>
          </Defs>
          
          {/* Outer circle */}
          <Circle
            cx="100"
            cy="100"
            r="90"
            fill="url(#logoGradient)"
            stroke={colors.ACCENT_ORANGE}
            strokeWidth="3"
          />
          
          {/* Inner design - representing payment/wallet concept */}
          <G>
            {/* Wallet shape */}
            <Path
              d="M60 80 L140 80 Q150 80 150 90 L150 130 Q150 140 140 140 L60 140 Q50 140 50 130 L50 90 Q50 80 60 80 Z"
              fill={colors.WHITE}
              opacity="0.9"
            />
            
            {/* Card slot */}
            <Path
              d="M120 95 L135 95 Q140 95 140 100 L140 115 Q140 120 135 120 L120 120 Q115 120 115 115 L115 100 Q115 95 120 95 Z"
              fill="url(#accentGradient)"
            />
            
            {/* Payment symbol */}
            <Circle cx="85" cy="110" r="8" fill={colors.PRIMARY} opacity="0.7" />
            <Path
              d="M81 110 L85 114 L93 106"
              stroke={colors.WHITE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </G>
          
          {/* OffliPay text curve */}
          <Path
            id="textPath"
            d="M 50 100 A 50 50 0 1 1 150 100"
            fill="none"
            stroke="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default WelcomeIllustration;