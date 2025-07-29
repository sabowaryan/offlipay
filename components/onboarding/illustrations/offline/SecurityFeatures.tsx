import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { IllustrationProps } from '../../types';

const SecurityFeatures: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const encryptionFlow = useSharedValue(0);
  const shieldPulse = useSharedValue(0);
  const lockRotation = useSharedValue(0);
  const keyAnimation = useSharedValue(0);
  const dataScramble = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Animation du flux de chiffrement
      encryptionFlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          withDelay(500, withTiming(0, { duration: 500 }))
        ),
        -1,
        false
      );

      // Pulsation du bouclier
      shieldPulse.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      // Rotation du cadenas
      lockRotation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withDelay(2000, withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }))
        ),
        -1,
        false
      );

      // Animation de la clé
      keyAnimation.value = withRepeat(
        withSequence(
          withDelay(1500, withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) })),
          withDelay(1000, withTiming(0, { duration: 500 }))
        ),
        -1,
        false
      );

      // Animation de brouillage des données
      dataScramble.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );

      // Callback de fin d'animation
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 4000);

      // Cleanup function
      return () => {
        clearTimeout(timer);
        encryptionFlow.value = 0;
        shieldPulse.value = 0;
        lockRotation.value = 0;
        keyAnimation.value = 0;
        dataScramble.value = 0;
      };
    }
  }, [animated]);

  const shieldStyle = useAnimatedStyle(() => {
    const pulse = interpolate(shieldPulse.value, [0, 1], [0.95, 1.05]);
    const glow = interpolate(shieldPulse.value, [0, 1], [0.7, 1]);
    return {
      transform: [{ scale: pulse }],
      opacity: glow,
    };
  });

  const lockStyle = useAnimatedStyle(() => {
    const rotation = interpolate(lockRotation.value, [0, 1], [0, 10]);
    const scale = interpolate(lockRotation.value, [0, 0.5, 1], [1, 1.1, 1]);
    return {
      transform: [
        { rotate: `${rotation}deg` },
        { scale }
      ],
    };
  });

  const keyStyle = useAnimatedStyle(() => {
    const translateX = interpolate(keyAnimation.value, [0, 1], [30, 0]);
    const opacity = interpolate(keyAnimation.value, [0, 0.3, 1], [0, 1, 1]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const encryptionTextStyle = useAnimatedStyle(() => {
    const scrambleIntensity = interpolate(dataScramble.value, [0, 0.5, 1], [0, 1, 0]);
    const opacity = interpolate(encryptionFlow.value, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
    return {
      opacity,
      transform: [{ translateX: scrambleIntensity * (Math.random() - 0.5) * 4 }],
    };
  });

  const securityBadgeStyle = useAnimatedStyle(() => {
    const scale = interpolate(encryptionFlow.value, [0, 0.5, 1], [0.8, 1, 0.8]);
    return {
      transform: [{ scale }],
    };
  });

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const textColor = isDark ? '#ffffff' : '#000000';
  const primaryColor = isDark ? '#3b82f6' : '#2563eb';
  const successColor = isDark ? '#10b981' : '#059669';
  const warningColor = isDark ? '#f59e0b' : '#d97706';

  // Neumorphism shadow colors
  const shadowLight = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)';
  const shadowDark = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)';

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
        Fonctionnalités de Sécurité
      </Text>

      {/* Illustration principale */}
      <View style={styles.illustrationContainer}>
        {/* Bouclier central avec neumorphism */}
        <Animated.View style={[
          styles.shieldContainer,
          {
            shadowColor: shadowDark,
            backgroundColor,
          },
          styles.neumorphism,
          shieldStyle
        ]}>
          <View style={[styles.shield, { backgroundColor: successColor }]}>
            <View style={styles.shieldCheck} />
          </View>
        </Animated.View>

        {/* Cadenas avec animation */}
        <Animated.View style={[
          styles.lockContainer,
          {
            shadowColor: shadowDark,
            backgroundColor,
          },
          styles.neumorphism,
          lockStyle
        ]}>
          <View style={[styles.lock, { backgroundColor: primaryColor }]} />
          <Animated.View style={[styles.key, { backgroundColor: warningColor }, keyStyle]} />
        </Animated.View>

        {/* Éléments de chiffrement */}
        <View style={styles.encryptionElements}>
          <Animated.View style={[styles.dataBlock, encryptionTextStyle]}>
            <Text style={[styles.encryptedText, { color: textColor }]}>01101</Text>
          </Animated.View>
          <Animated.View style={[styles.dataBlock, encryptionTextStyle]}>
            <Text style={[styles.encryptedText, { color: textColor }]}>11010</Text>
          </Animated.View>
          <Animated.View style={[styles.dataBlock, encryptionTextStyle]}>
            <Text style={[styles.encryptedText, { color: textColor }]}>10011</Text>
          </Animated.View>
        </View>

        {/* Badges de sécurité */}
        <View style={styles.securityBadges}>
          <Animated.View style={[
            styles.badge,
            {
              shadowColor: shadowDark,
              backgroundColor,
            },
            styles.neumorphism,
            securityBadgeStyle
          ]}>
            <View style={[styles.badgeIcon, { backgroundColor: primaryColor }]} />
            <Text style={[styles.badgeText, { color: textColor }]}>AES-256</Text>
          </Animated.View>

          <Animated.View style={[
            styles.badge,
            {
              shadowColor: shadowDark,
              backgroundColor,
            },
            styles.neumorphism,
            securityBadgeStyle
          ]}>
            <View style={[styles.badgeIcon, { backgroundColor: successColor }]} />
            <Text style={[styles.badgeText, { color: textColor }]}>PIN</Text>
          </Animated.View>

          <Animated.View style={[
            styles.badge,
            {
              shadowColor: shadowDark,
              backgroundColor,
            },
            styles.neumorphism,
            securityBadgeStyle
          ]}>
            <View style={[styles.badgeIcon, { backgroundColor: warningColor }]} />
            <Text style={[styles.badgeText, { color: textColor }]}>Biométrie</Text>
          </Animated.View>
        </View>

        {/* Indicateurs de sécurité */}
        <View style={styles.securityIndicators}>
          <View style={styles.indicator}>
            <View style={[styles.indicatorDot, { backgroundColor: successColor }]} />
            <Text style={[styles.indicatorText, { color: textColor }]}>Données chiffrées</Text>
          </View>
          <View style={styles.indicator}>
            <View style={[styles.indicatorDot, { backgroundColor: primaryColor }]} />
            <Text style={[styles.indicatorText, { color: textColor }]}>Stockage sécurisé</Text>
          </View>
        </View>
      </View>

      {/* Texte descriptif */}
      <Text style={[styles.description, { color: textColor }]}>
        Vos données sont protégées par un chiffrement de niveau bancaire
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
    width: 240,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  neumorphism: {
    shadowOffset: {
      width: -6,
      height: -6,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  shieldContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    zIndex: 10,
  },
  shield: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldCheck: {
    width: 20,
    height: 12,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'white',
    transform: [{ rotate: '-45deg' }],
    marginTop: -4,
    marginLeft: 2,
  },
  lockContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    top: 80,
    zIndex: 8,
  },
  lock: {
    width: 24,
    height: 30,
    borderRadius: 4,
    position: 'relative',
  },
  key: {
    width: 20,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    right: -10,
    top: '50%',
    marginTop: -4,
  },
  encryptionElements: {
    position: 'absolute',
    right: 20,
    top: 60,
    alignItems: 'center',
  },
  dataBlock: {
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  encryptedText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  securityBadges: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  badgeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  securityIndicators: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});

export default SecurityFeatures;

