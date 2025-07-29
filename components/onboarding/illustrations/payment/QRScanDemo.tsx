import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IllustrationProps } from '../../types';

const QRScanDemo: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const scanLineY = useSharedValue(0);
  const phoneRotation = useSharedValue(0);
  const qrOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);

  const isDark = theme === 'dark';
  const colors = {
    background: isDark ? '#1a1a1a' : '#f8f9fa',
    phoneBody: isDark ? '#2d3748' : '#4a5568',
    phoneScreen: isDark ? '#1a202c' : '#ffffff',
    scanLine: '#00d4aa',
    qrCode: isDark ? '#ffffff' : '#000000',
    success: '#48bb78',
    text: isDark ? '#ffffff' : '#2d3748',
  };

  useEffect(() => {
    if (!animated) {
      phoneRotation.value = 0;
      qrOpacity.value = 1;
      successScale.value = 1;
      onAnimationComplete?.();
      return;
    }

    // Initial setup
    phoneRotation.value = -15;
    scanLineY.value = 0;
    qrOpacity.value = 0;
    successScale.value = 0;

    // Phone entrance animation
    phoneRotation.value = withTiming(0, { duration: 800 });

    // QR code appears
    qrOpacity.value = withTiming(1, { duration: 600 });

    // Scan line animation with cleanup
    const scanTimer = setTimeout(() => {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        2,
        false
      );

      // Success animation after scan completes
      const successTimer = setTimeout(() => {
        successScale.value = withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(1, { duration: 200 })
        );

        const completeTimer = setTimeout(() => {
          onAnimationComplete?.();
        }, 500);

        return () => clearTimeout(completeTimer);
      }, 6000); // 2 scan cycles * 3000ms each

      return () => clearTimeout(successTimer);
    }, 800);

    // Cleanup function
    return () => {
      clearTimeout(scanTimer);
      // Reset animation values
      phoneRotation.value = 0;
      scanLineY.value = 0;
      qrOpacity.value = 0;
      successScale.value = 0;
    };
  }, [animated, onAnimationComplete]);

  const phoneAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${phoneRotation.value}deg` }],
  }));

  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scanLineY.value,
          [0, 1],
          [0, 120]
        ),
      },
    ],
  }));

  const qrAnimatedStyle = useAnimatedStyle(() => ({
    opacity: qrOpacity.value,
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.background,
        width: size,
        height: size,
      }
    ]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Scanner un QR Code
      </Text>

      <View style={styles.scene}>
        {/* QR Code */}
        <Animated.View style={[styles.qrContainer, qrAnimatedStyle]}>
          <Svg width="80" height="80" viewBox="0 0 80 80">
            {/* QR Code pattern */}
            <Rect width="80" height="80" fill={colors.qrCode} />
            <Rect x="2" y="2" width="76" height="76" fill={colors.background} />

            {/* Corner squares */}
            <Rect x="4" y="4" width="20" height="20" fill={colors.qrCode} />
            <Rect x="56" y="4" width="20" height="20" fill={colors.qrCode} />
            <Rect x="4" y="56" width="20" height="20" fill={colors.qrCode} />

            {/* Inner corner squares */}
            <Rect x="8" y="8" width="12" height="12" fill={colors.background} />
            <Rect x="60" y="8" width="12" height="12" fill={colors.background} />
            <Rect x="8" y="60" width="12" height="12" fill={colors.background} />

            {/* Center squares */}
            <Rect x="12" y="12" width="4" height="4" fill={colors.qrCode} />
            <Rect x="64" y="12" width="4" height="4" fill={colors.qrCode} />
            <Rect x="12" y="64" width="4" height="4" fill={colors.qrCode} />

            {/* Data pattern */}
            <Rect x="32" y="8" width="4" height="4" fill={colors.qrCode} />
            <Rect x="40" y="8" width="4" height="4" fill={colors.qrCode} />
            <Rect x="28" y="16" width="4" height="4" fill={colors.qrCode} />
            <Rect x="36" y="16" width="4" height="4" fill={colors.qrCode} />
            <Rect x="44" y="16" width="4" height="4" fill={colors.qrCode} />
            <Rect x="32" y="24" width="4" height="4" fill={colors.qrCode} />
            <Rect x="40" y="24" width="4" height="4" fill={colors.qrCode} />

            {/* More data pattern */}
            <Rect x="28" y="32" width="4" height="4" fill={colors.qrCode} />
            <Rect x="36" y="32" width="4" height="4" fill={colors.qrCode} />
            <Rect x="44" y="32" width="4" height="4" fill={colors.qrCode} />
            <Rect x="32" y="40" width="4" height="4" fill={colors.qrCode} />
            <Rect x="40" y="40" width="4" height="4" fill={colors.qrCode} />
            <Rect x="28" y="48" width="4" height="4" fill={colors.qrCode} />
            <Rect x="44" y="48" width="4" height="4" fill={colors.qrCode} />
          </Svg>
        </Animated.View>

        {/* 3D Phone */}
        <Animated.View style={[styles.phoneContainer, phoneAnimatedStyle]}>
          <Svg width="100" height="180" viewBox="0 0 100 180">
            <Defs>
              <LinearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={colors.phoneBody} />
                <Stop offset="100%" stopColor={isDark ? '#4a5568' : '#2d3748'} />
              </LinearGradient>
              <LinearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.phoneScreen} />
                <Stop offset="100%" stopColor={isDark ? '#2d3748' : '#f7fafc'} />
              </LinearGradient>
            </Defs>

            {/* Phone body */}
            <Rect
              x="10"
              y="10"
              width="80"
              height="160"
              rx="12"
              fill="url(#phoneGradient)"
              stroke={isDark ? '#4a5568' : '#2d3748'}
              strokeWidth="1"
            />

            {/* Screen */}
            <Rect
              x="15"
              y="25"
              width="70"
              height="130"
              rx="8"
              fill="url(#screenGradient)"
            />

            {/* Camera viewfinder */}
            <Rect
              x="20"
              y="30"
              width="60"
              height="120"
              rx="4"
              fill={isDark ? '#1a202c' : '#2d3748'}
              opacity="0.8"
            />

            {/* Viewfinder corners */}
            <Path
              d="M25 35 L35 35 L35 40 M75 35 L65 35 L65 40 M25 145 L35 145 L35 140 M75 145 L65 145 L65 140"
              stroke={colors.scanLine}
              strokeWidth="2"
              fill="none"
            />

            {/* Home button */}
            <Circle cx="50" cy="165" r="6" fill={colors.phoneBody} />
          </Svg>

          {/* Scan line */}
          <Animated.View style={[styles.scanLine, scanLineAnimatedStyle]}>
            <View style={[styles.scanLineGlow, { backgroundColor: colors.scanLine }]} />
          </Animated.View>
        </Animated.View>

        {/* Success indicator */}
        <Animated.View style={[styles.successIndicator, successAnimatedStyle]}>
          <Svg width="40" height="40" viewBox="0 0 40 40">
            <Circle cx="20" cy="20" r="18" fill={colors.success} />
            <Path
              d="M12 20 L18 26 L28 14"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </View>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        Pointez votre caméra vers le QR code
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrContainer: {
    position: 'absolute',
    left: -60,
    top: '50%',
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  phoneContainer: {
    position: 'relative',
    right: -40,
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    top: 30,
    width: 60,
    height: 2,
    zIndex: 10,
  },
  scanLineGlow: {
    width: '100%',
    height: '100%',
    shadowColor: '#00d4aa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  successIndicator: {
    position: 'absolute',
    right: -20,
    top: '30%',
  },
});

export default QRScanDemo;


