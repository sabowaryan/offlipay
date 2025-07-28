import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { IllustrationProps } from '../../types';

// Composant pour une icône 3D isométrique
const IsometricIcon: React.FC<{
  children: React.ReactNode;
  rotation: Animated.SharedValue<number>;
  delay: number;
  position: { x: number; y: number };
  color: string;
}> = ({ children, rotation, delay, position, color }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotateY: `${rotation.value}deg` },
        { rotateX: '15deg' },
      ],
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <View style={[styles.iconFace, { backgroundColor: color }]}>
        {children}
      </View>
      <View style={[styles.iconSide, { backgroundColor: color, opacity: 0.7 }]} />
      <View style={[styles.iconTop, { backgroundColor: color, opacity: 0.9 }]} />
    </Animated.View>
  );
};

// Composant pour les connexions animées
const AnimatedConnection: React.FC<{
  start: { x: number; y: number };
  end: { x: number; y: number };
  progress: Animated.SharedValue<number>;
  color: string;
}> = ({ start, end, progress, color }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    const currentLength = interpolate(progress.value, [0, 1], [0, length]);

    return {
      width: currentLength,
    };
  });

  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

  return (
    <View
      style={[
        styles.connectionContainer,
        {
          left: start.x,
          top: start.y,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.connectionLine,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const WelcomeFeatures: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const rotation = useSharedValue(0);
  const connectionProgress1 = useSharedValue(0);
  const connectionProgress2 = useSharedValue(0);
  const connectionProgress3 = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#4A90E2' : '#2196F3';
  const secondaryColor = isDark ? '#50C878' : '#4CAF50';
  const accentColor = isDark ? '#FFB347' : '#FF9800';
  const textColor = isDark ? '#ffffff' : '#000000';
  const backgroundColor = isDark ? '#1a1a1a' : '#f8f9fa';

  useEffect(() => {
    if (animated) {
      // Animation d'apparition
      fadeIn.value = withTiming(1, { duration: 800 });

      // Animation de rotation continue
      rotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );

      // Animations des connexions avec délais
      connectionProgress1.value = withDelay(
        1000,
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
      );

      connectionProgress2.value = withDelay(
        1500,
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
      );

      connectionProgress3.value = withDelay(
        2000,
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
      );

      // Callback d'animation terminée
      if (onAnimationComplete) {
        setTimeout(() => onAnimationComplete(), 3500);
      }
    }
  }, [animated]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeIn.value,
      transform: [
        { scale: interpolate(fadeIn.value, [0, 1], [0.8, 1]) },
      ],
    };
  });

  // Positions des icônes
  const iconPositions = {
    wallet: { x: -60, y: -40 },
    payment: { x: 60, y: -40 },
    security: { x: 0, y: 40 },
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor,
        width: size,
        height: size,
      },
      containerAnimatedStyle,
    ]}>
      <Text style={[styles.title, { color: textColor }]}>
        Paiements, portefeuille, et bien plus
      </Text>

      <View style={styles.iconsContainer}>
        {/* Icône Portefeuille */}
        <IsometricIcon
          rotation={rotation}
          delay={0}
          position={iconPositions.wallet}
          color={primaryColor}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <Path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </Svg>
        </IsometricIcon>

        {/* Icône Paiement */}
        <IsometricIcon
          rotation={rotation}
          delay={500}
          position={iconPositions.payment}
          color={secondaryColor}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <Path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
          </Svg>
        </IsometricIcon>

        {/* Icône Sécurité */}
        <IsometricIcon
          rotation={rotation}
          delay={1000}
          position={iconPositions.security}
          color={accentColor}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <Path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
          </Svg>
        </IsometricIcon>

        {/* Connexions animées */}
        <AnimatedConnection
          start={{ x: size / 2 + iconPositions.wallet.x + 20, y: size / 2 + iconPositions.wallet.y + 20 }}
          end={{ x: size / 2 + iconPositions.payment.x - 20, y: size / 2 + iconPositions.payment.y + 20 }}
          progress={connectionProgress1}
          color={primaryColor}
        />

        <AnimatedConnection
          start={{ x: size / 2 + iconPositions.wallet.x + 10, y: size / 2 + iconPositions.wallet.y + 30 }}
          end={{ x: size / 2 + iconPositions.security.x - 10, y: size / 2 + iconPositions.security.y }}
          progress={connectionProgress2}
          color={secondaryColor}
        />

        <AnimatedConnection
          start={{ x: size / 2 + iconPositions.payment.x - 10, y: size / 2 + iconPositions.payment.y + 30 }}
          end={{ x: size / 2 + iconPositions.security.x + 10, y: size / 2 + iconPositions.security.y }}
          progress={connectionProgress3}
          color={accentColor}
        />
      </View>

      {/* Particules flottantes */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, index) => (
          <FloatingParticle
            key={index}
            delay={index * 200}
            color={[primaryColor, secondaryColor, accentColor][index % 3]}
            size={size}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// Composant pour les particules flottantes
const FloatingParticle: React.FC<{
  delay: number;
  color: string;
  size: number;
}> = ({ delay, color, size }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 1000 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const randomPosition = {
    left: Math.random() * (size - 20),
    top: Math.random() * (size - 20),
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          ...randomPosition,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  iconsContainer: {
    position: 'relative',
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  iconFace: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconSide: {
    position: 'absolute',
    top: 5,
    left: 50,
    width: 10,
    height: 50,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ skewY: '-45deg' }],
  },
  iconTop: {
    position: 'absolute',
    top: -5,
    left: 5,
    width: 50,
    height: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    transform: [{ skewX: '-45deg' }],
  },
  connectionContainer: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  connectionLine: {
    height: 2,
    borderRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default WelcomeFeatures;

