import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
 
} from 'react-native-reanimated';
import { CheckCircle, Sparkles } from 'lucide-react-native';
import { IllustrationProps } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

// Simplified confetti particle component with better performance
const ConfettiParticle: React.FC<{
  delay: number;
  color: string;
  startX: number;
  animated: boolean;
}> = ({ delay, color, startX, animated }) => {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
      translateY.value = withDelay(
        delay,
        withTiming(300, { duration: 1500 })
      );

      // Cleanup after animation
      const cleanup = setTimeout(() => {
        opacity.value = 0;
        translateY.value = -50;
      }, delay + 1700);

      return () => clearTimeout(cleanup);
    }
  }, [animated, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    position: 'absolute',
    left: startX,
    top: 0,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.confetti,
          { backgroundColor: color }
        ]}
      />
    </Animated.View>
  );
};

const PaymentSuccess: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const sparkleRotate = useSharedValue(0);
  const sparkleScale = useSharedValue(0);
  const containerScale = useSharedValue(0.8);

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const textColor = isDark ? '#ffffff' : '#000000';
  const successColor = '#4CAF50';

  // Reduced confetti colors for better performance
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

  useEffect(() => {
    if (!animated) {
      containerScale.value = 1;
      checkScale.value = 1;
      checkOpacity.value = 1;
      titleScale.value = 1;
      titleOpacity.value = 1;
      sparkleScale.value = 1;
      onAnimationComplete?.();
      return;
    }

    // Container entrance
    containerScale.value = withSpring(1, { damping: 15, stiffness: 150 });

    // Check icon animation
    checkScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 200 }));
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

    // Title animation
    titleScale.value = withDelay(600, withSpring(1, { damping: 15, stiffness: 150 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));

    // Simplified sparkle animation
    sparkleScale.value = withDelay(900, withSpring(1, { damping: 10, stiffness: 100 }));
    sparkleRotate.value = withDelay(900, withTiming(360, { duration: 1000 }));

    // Complete animation callback
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      // Reset animation values
      containerScale.value = 0.8;
      checkScale.value = 0;
      checkOpacity.value = 0;
      titleScale.value = 0;
      titleOpacity.value = 0;
      sparkleScale.value = 0;
      sparkleRotate.value = 0;
    };
  }, [animated, onAnimationComplete]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: sparkleScale.value },
      { rotate: `${sparkleRotate.value}deg` }
    ],
  }));

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor,
        width: size,
        height: size,
      },
      containerAnimatedStyle
    ]}>
      {/* Confetti particles */}
      {animated && confettiColors.map((color, index) => (
        <ConfettiParticle
          key={index}
          delay={800 + index * 100}
          color={color}
          startX={Math.random() * (size - 20)}
          animated={animated}
        />
      ))}

      {/* Success check icon */}
      <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
        <View style={[styles.checkBackground, { backgroundColor: successColor }]}>
          <CheckCircle
            size={60}
            color="white"
            strokeWidth={2}
          />
        </View>
      </Animated.View>

      {/* Sparkle effects around the check */}
      <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
        <View style={styles.sparkleTop}>
          <Sparkles size={24} color={successColor} />
        </View>
        <View style={styles.sparkleRight}>
          <Sparkles size={20} color={isDark ? '#FFD700' : '#FFA500'} />
        </View>
        <View style={styles.sparkleLeft}>
          <Sparkles size={18} color={isDark ? '#FF69B4' : '#FF1493'} />
        </View>
        <View style={styles.sparkleBottom}>
          <Sparkles size={22} color={isDark ? '#00CED1' : '#1E90FF'} />
        </View>
      </Animated.View>

      {/* Success title */}
      <Animated.View style={titleAnimatedStyle}>
        <Text style={[styles.title, { color: textColor }]}>
          Paiement Réussi!
        </Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Votre transaction a été effectuée avec succès
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  checkContainer: {
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleTop: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -12,
  },
  sparkleRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
  },
  sparkleLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -9,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -11,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  confetti: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default PaymentSuccess;

