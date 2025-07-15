import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import Svg, { Rect, Path, G, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
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

const QRPaymentIllustration: React.FC<IllustrationProps> = ({
  animated = true,
  theme,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const qrScaleAnim = useRef(new Animated.Value(0.8)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State variables for SVG opacity values
  const [pulseOpacity, setPulseOpacity] = React.useState(1);
  const [successOpacity, setSuccessOpacity] = React.useState(0);

  // Performance optimizations
  const animConfig = getOptimizedAnimationConfig();
  const svgOptimizations = getSVGOptimizations();
  const memoryManager = SVGMemoryManager.getInstance();
  const useComplexAnimations = shouldUseComplexAnimations();

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  // Set up animation listeners
  useEffect(() => {
    // Add listeners for animated values to update state
    const pulseListener = pulseAnim.addListener(({ value }) => {
      setPulseOpacity(value);
    });

    const successListener = successAnim.addListener(({ value }) => {
      setSuccessOpacity(value);
    });

    return () => {
      pulseAnim.removeListener(pulseListener);
      successAnim.removeListener(successListener);
    };
  }, [pulseAnim, successAnim]);

  useEffect(() => {
    if (animated && memoryManager.canStartAnimation('qr-payment')) {
      memoryManager.startAnimation('qr-payment');

      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: getOptimizedTiming(500),
        useNativeDriver: animConfig.useNativeDriver,
      }).start();

      // QR code scale animation
      Animated.timing(qrScaleAnim, {
        toValue: 1,
        duration: getOptimizedTiming(600),
        useNativeDriver: animConfig.useNativeDriver,
      }).start();

      // Scanning line animation (continuous loop) - only if complex animations are supported
      let scanAnimation: Animated.CompositeAnimation | null = null;
      if (useComplexAnimations && memoryManager.canStartAnimation('qr-scan-line')) {
        memoryManager.startAnimation('qr-scan-line');
        scanAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(scanLineAnim, {
              toValue: 1,
              duration: getOptimizedTiming(1500),
              useNativeDriver: animConfig.useNativeDriver,
            }),
            Animated.timing(scanLineAnim, {
              toValue: 0,
              duration: getOptimizedTiming(100),
              useNativeDriver: animConfig.useNativeDriver,
            }),
          ])
        );
        scanAnimation.start();
      }

      // Pulse animation for corners - only if device supports it
      let pulseAnimation: Animated.CompositeAnimation | null = null;
      if (useComplexAnimations && memoryManager.canStartAnimation('qr-pulse')) {
        memoryManager.startAnimation('qr-pulse');
        pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: getOptimizedTiming(1000),
              useNativeDriver: animConfig.useNativeDriver,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: getOptimizedTiming(1000),
              useNativeDriver: animConfig.useNativeDriver,
            }),
          ])
        );
        pulseAnimation.start();
      }

      // Success animation after optimized delay
      const successDelay = useComplexAnimations ? 3000 : 2000;
      setTimeout(() => {
        Animated.timing(successAnim, {
          toValue: 1,
          duration: getOptimizedTiming(800),
          useNativeDriver: animConfig.useNativeDriver,
        }).start(() => {
          // Cleanup animations
          scanAnimation?.stop();
          pulseAnimation?.stop();
          memoryManager.stopAnimation('qr-payment');
          memoryManager.stopAnimation('qr-scan-line');
          memoryManager.stopAnimation('qr-pulse');
          onAnimationComplete?.();
        });
      }, getOptimizedTiming(successDelay));
    }

    // Cleanup function
    return () => {
      memoryManager.stopAnimation('qr-payment');
      memoryManager.stopAnimation('qr-scan-line');
      memoryManager.stopAnimation('qr-pulse');
    };
  }, [animated, fadeAnim, scanLineAnim, qrScaleAnim, successAnim, pulseAnim, onAnimationComplete, animConfig, useComplexAnimations, memoryManager]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 80],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: ILLUSTRATION_SIZE }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: qrScaleAnim }],
        }}
      >
        <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.PRIMARY} />
              <Stop offset="100%" stopColor={colors.PRIMARY_LIGHT} />
            </LinearGradient>
            <LinearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.ACCENT_ORANGE} stopOpacity="0" />
              <Stop offset="50%" stopColor={colors.ACCENT_ORANGE} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={colors.ACCENT_ORANGE} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Phone frame */}
          <Rect
            x="40"
            y="30"
            width="120"
            height="140"
            rx="15"
            ry="15"
            fill={colors.CARD}
            stroke={colors.PRIMARY}
            strokeWidth="2"
          />

          {/* Screen */}
          <Rect
            x="50"
            y="45"
            width="100"
            height="110"
            rx="8"
            ry="8"
            fill={colors.BACKGROUND}
          />

          {/* QR Code pattern */}
          <G>
            {/* Corner markers */}
            <G>
              {/* Top-left corner */}
              <Rect x="60" y="55" width="20" height="20" fill={colors.TEXT} rx="2" />
              <Rect x="65" y="60" width="10" height="10" fill={colors.BACKGROUND} rx="1" />
              <Rect x="67" y="62" width="6" height="6" fill={colors.TEXT} />

              {/* Top-right corner */}
              <Rect x="120" y="55" width="20" height="20" fill={colors.TEXT} rx="2" />
              <Rect x="125" y="60" width="10" height="10" fill={colors.BACKGROUND} rx="1" />
              <Rect x="127" y="62" width="6" height="6" fill={colors.TEXT} />

              {/* Bottom-left corner */}
              <Rect x="60" y="125" width="20" height="20" fill={colors.TEXT} rx="2" />
              <Rect x="65" y="130" width="10" height="10" fill={colors.BACKGROUND} rx="1" />
              <Rect x="67" y="132" width="6" height="6" fill={colors.TEXT} />
            </G>

            {/* QR pattern dots */}
            <G opacity="0.8">
              <Rect x="90" y="65" width="3" height="3" fill={colors.TEXT} />
              <Rect x="95" y="65" width="3" height="3" fill={colors.TEXT} />
              <Rect x="105" y="65" width="3" height="3" fill={colors.TEXT} />
              <Rect x="85" y="75" width="3" height="3" fill={colors.TEXT} />
              <Rect x="100" y="75" width="3" height="3" fill={colors.TEXT} />
              <Rect x="110" y="75" width="3" height="3" fill={colors.TEXT} />
              <Rect x="90" y="85" width="3" height="3" fill={colors.TEXT} />
              <Rect x="105" y="85" width="3" height="3" fill={colors.TEXT} />
              <Rect x="85" y="95" width="3" height="3" fill={colors.TEXT} />
              <Rect x="95" y="95" width="3" height="3" fill={colors.TEXT} />
              <Rect x="110" y="95" width="3" height="3" fill={colors.TEXT} />
              <Rect x="90" y="105" width="3" height="3" fill={colors.TEXT} />
              <Rect x="100" y="105" width="3" height="3" fill={colors.TEXT} />
              <Rect x="85" y="115" width="3" height="3" fill={colors.TEXT} />
              <Rect x="105" y="115" width="3" height="3" fill={colors.TEXT} />
              <Rect x="110" y="115" width="3" height="3" fill={colors.TEXT} />
            </G>
          </G>

          {/* Scanning corners (animated) */}
          <G opacity={pulseOpacity}>
            {/* Top-left scanning corner */}
            <Path
              d="M55 50 L55 65 M55 50 L70 50"
              stroke={colors.ACCENT_ORANGE}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Top-right scanning corner */}
            <Path
              d="M145 50 L145 65 M145 50 L130 50"
              stroke={colors.ACCENT_ORANGE}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Bottom-left scanning corner */}
            <Path
              d="M55 150 L55 135 M55 150 L70 150"
              stroke={colors.ACCENT_ORANGE}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Bottom-right scanning corner */}
            <Path
              d="M145 150 L145 135 M145 150 L130 150"
              stroke={colors.ACCENT_ORANGE}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </G>

          {/* Success checkmark (appears after scanning) */}
          <G opacity={successOpacity}>
            <Circle cx="100" cy="100" r="15" fill={colors.SUCCESS} opacity="0.9" />
            <Path
              d="M92 100 L98 106 L108 94"
              stroke={colors.WHITE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </G>
        </Svg>

        {/* Scanning line overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            right: '25%',
            height: 3,
            backgroundColor: colors.ACCENT_ORANGE,
            opacity: 0.8,
            transform: [{ translateY: scanLineTranslateY }],
          }}
        />
      </Animated.View>
    </View>
  );
};

export default QRPaymentIllustration;