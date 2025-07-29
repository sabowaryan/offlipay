import React, { useEffect, useRef } from 'react';
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
import { Banknote, CreditCard, Users, ArrowRight } from 'lucide-react-native';
import { IllustrationProps } from '../../types';

const CashInMethods: React.FC<IllustrationProps> = ({ 
  theme, 
  animated = true, 
  size = 280,
  onAnimationComplete 
}) => {
  const isDark = theme === 'dark';
  const baseColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const shadowColor = isDark ? '#000000' : '#d1d9e6';
  const highlightColor = isDark ? '#2a2a2a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#333333';
  const accentColor = '#4CAF50';

  // Animation values
  const containerOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const methodsScale = useSharedValue(0.8);
  const flowAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  // Method icons animation
  const agentScale = useSharedValue(0);
  const voucherScale = useSharedValue(0);
  const bankScale = useSharedValue(0);

  // Money flow particles
  const particle1X = useSharedValue(-50);
  const particle2X = useSharedValue(-50);
  const particle3X = useSharedValue(-50);

  useEffect(() => {
    if (animated) {
      // Initial entrance animation
      containerOpacity.value = withTiming(1, { duration: 800 });
      titleTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      
      // Staggered method icons appearance
      agentScale.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.back(1.2) }));
      voucherScale.value = withDelay(400, withTiming(1, { duration: 500, easing: Easing.back(1.2) }));
      bankScale.value = withDelay(600, withTiming(1, { duration: 500, easing: Easing.back(1.2) }));

      // Methods container scale
      methodsScale.value = withDelay(300, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));

      // Continuous animations
      setTimeout(() => {
        // Flow animation
        flowAnimation.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) }),
          -1,
          true
        );

        // Pulse animation for methods
        pulseAnimation.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        );

        // Money flow particles
        const animateParticles = () => {
          particle1X.value = withRepeat(
            withSequence(
              withTiming(size + 50, { duration: 3000, easing: Easing.linear }),
              withTiming(-50, { duration: 0 })
            ),
            -1,
            false
          );
          
          particle2X.value = withDelay(1000, withRepeat(
            withSequence(
              withTiming(size + 50, { duration: 3000, easing: Easing.linear }),
              withTiming(-50, { duration: 0 })
            ),
            -1,
            false
          ));
          
          particle3X.value = withDelay(2000, withRepeat(
            withSequence(
              withTiming(size + 50, { duration: 3000, easing: Easing.linear }),
              withTiming(-50, { duration: 0 })
            ),
            -1,
            false
          ));
        };

        animateParticles();
      }, 1000);

      // Call completion callback
      setTimeout(() => {
        onAnimationComplete?.();
      }, 2000);
    } else {
      // Static state
      containerOpacity.value = 1;
      titleTranslateY.value = 0;
      methodsScale.value = 1;
      agentScale.value = 1;
      voucherScale.value = 1;
      bankScale.value = 1;
    }
  }, [animated]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const methodsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: methodsScale.value }],
  }));

  const agentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: agentScale.value * pulseAnimation.value }],
  }));

  const voucherAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voucherScale.value * pulseAnimation.value }],
  }));

  const bankAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bankScale.value * pulseAnimation.value }],
  }));

  const flowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(flowAnimation.value, [0, 0.5, 1], [0.3, 1, 0.3]);
    return { opacity };
  });

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: particle1X.value }],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: particle2X.value }],
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: particle3X.value }],
  }));

  const NeumorphicIcon = ({ children, animatedStyle }: { children: React.ReactNode; animatedStyle: any }) => (
    <Animated.View style={[
      styles.iconContainer,
      {
        backgroundColor: baseColor,
        shadowColor: shadowColor,
        elevation: isDark ? 0 : 8,
      },
      isDark ? styles.darkShadow : styles.lightShadow,
      animatedStyle
    ]}>
      {children}
    </Animated.View>
  );

  return (
    <Animated.View style={[
      styles.container,
      { 
        backgroundColor: baseColor,
        width: size,
        height: size,
      },
      containerAnimatedStyle
    ]}>
      {/* Money flow particles */}
      <Animated.View style={[styles.particle, particle1Style, { top: size * 0.2 }]}>
        <Text style={styles.moneySymbol}>💰</Text>
      </Animated.View>
      <Animated.View style={[styles.particle, particle2Style, { top: size * 0.5 }]}>
        <Text style={styles.moneySymbol}>💵</Text>
      </Animated.View>
      <Animated.View style={[styles.particle, particle3Style, { top: size * 0.8 }]}>
        <Text style={styles.moneySymbol}>💳</Text>
      </Animated.View>

      <Animated.Text style={[
        styles.title, 
        { color: textColor },
        titleAnimatedStyle
      ]}>
        Méthodes de Rechargement
      </Animated.Text>

      <Animated.View style={[styles.methodsContainer, methodsAnimatedStyle]}>
        {/* Agent Method */}
        <View style={styles.methodRow}>
          <NeumorphicIcon animatedStyle={agentAnimatedStyle}>
            <Users size={24} color={accentColor} />
          </NeumorphicIcon>
          <Animated.View style={[styles.flowArrow, flowAnimatedStyle]}>
            <ArrowRight size={16} color={textColor} />
          </Animated.View>
          <Text style={[styles.methodLabel, { color: textColor }]}>Agents</Text>
        </View>

        {/* Voucher Method */}
        <View style={styles.methodRow}>
          <NeumorphicIcon animatedStyle={voucherAnimatedStyle}>
            <Banknote size={24} color={accentColor} />
          </NeumorphicIcon>
          <Animated.View style={[styles.flowArrow, flowAnimatedStyle]}>
            <ArrowRight size={16} color={textColor} />
          </Animated.View>
          <Text style={[styles.methodLabel, { color: textColor }]}>Bons</Text>
        </View>

        {/* Banking Method */}
        <View style={styles.methodRow}>
          <NeumorphicIcon animatedStyle={bankAnimatedStyle}>
            <CreditCard size={24} color={accentColor} />
          </NeumorphicIcon>
          <Animated.View style={[styles.flowArrow, flowAnimatedStyle]}>
            <ArrowRight size={16} color={textColor} />
          </Animated.View>
          <Text style={[styles.methodLabel, { color: textColor }]}>Banque</Text>
        </View>
      </Animated.View>

      {/* Central wallet representation */}
      <View style={[
        styles.centralWallet,
        {
          backgroundColor: baseColor,
          shadowColor: shadowColor,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
      ]}>
        <Text style={[styles.walletText, { color: accentColor }]}>💰</Text>
        <Text style={[styles.walletLabel, { color: textColor }]}>Portefeuille</Text>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  methodsContainer: {
    alignItems: 'center',
    gap: 20,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: 180,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightShadow: {
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowColor: '#ffffff',
    elevation: 8,
  },
  darkShadow: {
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowColor: '#000000',
    borderWidth: 1,
    borderColor: '#333333',
  },
  flowArrow: {
    opacity: 0.6,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  centralWallet: {
    position: 'absolute',
    bottom: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },
  walletText: {
    fontSize: 24,
  },
  walletLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  particle: {
    position: 'absolute',
    left: -50,
  },
  moneySymbol: {
    fontSize: 16,
  },
});

export default CashInMethods;

