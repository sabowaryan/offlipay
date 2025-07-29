import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { IllustrationProps } from '../../types';

const OfflineCapability: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const connectivityToggle = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const glassOpacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Animation de basculement de connectivité (online/offline)
      connectivityToggle.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Animation de pulsation pour les éléments glassmorphism
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      // Animation d'apparition du glassmorphism
      glassOpacity.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.quad)
      });

      // Callback de fin d'animation
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);

      // Cleanup function
      return () => {
        clearTimeout(timer);
        connectivityToggle.value = 0;
        pulseAnimation.value = 0;
        glassOpacity.value = 0;
      };
    }
  }, [animated]);

  const connectivityStyle = useAnimatedStyle(() => {
    const isOnline = connectivityToggle.value > 0.5;
    return {
      backgroundColor: isOnline
        ? theme === 'dark' ? '#4ade80' : '#22c55e'
        : theme === 'dark' ? '#ef4444' : '#dc2626',
      transform: [
        { scale: interpolate(connectivityToggle.value, [0, 0.5, 1], [1, 1.1, 1]) }
      ],
    };
  });

  const glassStyle = useAnimatedStyle(() => {
    const pulse = interpolate(pulseAnimation.value, [0, 1], [0.8, 1]);
    return {
      opacity: glassOpacity.value * 0.7,
      transform: [{ scale: pulse }],
    };
  });

  const offlineIndicatorStyle = useAnimatedStyle(() => {
    const isOffline = connectivityToggle.value < 0.5;
    return {
      opacity: isOffline ? 1 : 0.3,
      transform: [
        { scale: isOffline ? 1 : 0.8 }
      ],
    };
  });

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const textColor = isDark ? '#ffffff' : '#000000';
  const glassColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        width: size,
        height: size,
      }
    ]}>
      {/* Titre */}
      <Text style={[styles.title, { color: textColor }]}>
        Capacités Hors Ligne
      </Text>

      {/* Illustration principale */}
      <View style={styles.illustrationContainer}>
        {/* Glassmorphism background */}
        <Animated.View style={[
          styles.glassBackground,
          { backgroundColor: glassColor },
          glassStyle
        ]} />

        {/* Indicateur de connectivité central */}
        <Animated.View style={[
          styles.connectivityIndicator,
          connectivityStyle
        ]}>
          <View style={styles.connectivityDot} />
        </Animated.View>

        {/* Éléments de fonctionnalité hors ligne */}
        <Animated.View style={[styles.offlineFeature, styles.topFeature, offlineIndicatorStyle]}>
          <View style={[styles.featureIcon, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]} />
          <Text style={[styles.featureText, { color: textColor }]}>Paiements</Text>
        </Animated.View>

        <Animated.View style={[styles.offlineFeature, styles.leftFeature, offlineIndicatorStyle]}>
          <View style={[styles.featureIcon, { backgroundColor: isDark ? '#8b5cf6' : '#7c3aed' }]} />
          <Text style={[styles.featureText, { color: textColor }]}>Wallet</Text>
        </Animated.View>

        <Animated.View style={[styles.offlineFeature, styles.rightFeature, offlineIndicatorStyle]}>
          <View style={[styles.featureIcon, { backgroundColor: isDark ? '#f59e0b' : '#d97706' }]} />
          <Text style={[styles.featureText, { color: textColor }]}>QR Codes</Text>
        </Animated.View>

        <Animated.View style={[styles.offlineFeature, styles.bottomFeature, offlineIndicatorStyle]}>
          <View style={[styles.featureIcon, { backgroundColor: isDark ? '#10b981' : '#059669' }]} />
          <Text style={[styles.featureText, { color: textColor }]}>Historique</Text>
        </Animated.View>

        {/* Lignes de connexion */}
        <View style={[styles.connectionLine, styles.topLine, { backgroundColor: textColor }]} />
        <View style={[styles.connectionLine, styles.leftLine, { backgroundColor: textColor }]} />
        <View style={[styles.connectionLine, styles.rightLine, { backgroundColor: textColor }]} />
        <View style={[styles.connectionLine, styles.bottomLine, { backgroundColor: textColor }]} />
      </View>

      {/* Texte descriptif */}
      <Text style={[styles.description, { color: textColor }]}>
        Toutes vos fonctionnalités restent disponibles même sans connexion internet
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  glassBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  connectivityIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  connectivityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  offlineFeature: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  topFeature: {
    top: 10,
  },
  leftFeature: {
    left: 10,
    top: '50%',
    marginTop: -20,
  },
  rightFeature: {
    right: 10,
    top: '50%',
    marginTop: -20,
  },
  bottomFeature: {
    bottom: 10,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  connectionLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  topLine: {
    width: 2,
    height: 40,
    top: 50,
    left: '50%',
    marginLeft: -1,
  },
  leftLine: {
    width: 40,
    height: 2,
    left: 50,
    top: '50%',
    marginTop: -1,
  },
  rightLine: {
    width: 40,
    height: 2,
    right: 50,
    top: '50%',
    marginTop: -1,
  },
  bottomLine: {
    width: 2,
    height: 40,
    bottom: 50,
    left: '50%',
    marginLeft: -1,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});

export default OfflineCapability;


