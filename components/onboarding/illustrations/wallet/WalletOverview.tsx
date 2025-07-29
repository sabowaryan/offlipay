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
import { Wallet, CreditCard, Shield, Zap, TrendingUp, Eye } from 'lucide-react-native';
import { IllustrationProps } from '../../types';

const WalletOverview: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const isDark = theme === 'dark';
  const baseColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const cardColor = isDark ? '#2a2a2a' : '#ffffff';
  const shadowColor = isDark ? '#000000' : '#d1d9e6';
  const highlightColor = isDark ? '#3a3a3a' : '#f8f8f8';
  const textColor = isDark ? '#ffffff' : '#333333';
  const subtleTextColor = isDark ? '#888888' : '#666666';
  const accentColor = '#4CAF50';
  const secondaryColor = '#2196F3';
  const warningColor = '#FF9800';

  // Animation values
  const containerOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const walletRotateY = useSharedValue(-15);
  const walletScale = useSharedValue(0.8);
  const balanceOpacity = useSharedValue(0);
  const balanceScale = useSharedValue(0.9);

  // Floating elements
  const float1Y = useSharedValue(0);
  const float2Y = useSharedValue(0);
  const float3Y = useSharedValue(0);
  const float4Y = useSharedValue(0);

  // Card animations
  const card1Rotate = useSharedValue(5);
  const card2Rotate = useSharedValue(-3);
  const card3Rotate = useSharedValue(2);

  // Feature icons
  const feature1Scale = useSharedValue(0);
  const feature2Scale = useSharedValue(0);
  const feature3Scale = useSharedValue(0);
  const feature4Scale = useSharedValue(0);

  // Glow effect
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Initial entrance animation
      containerOpacity.value = withTiming(1, { duration: 800 });
      titleTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });

      // Wallet 3D entrance
      setTimeout(() => {
        walletScale.value = withTiming(1, { duration: 800, easing: Easing.back(1.2) });
        walletRotateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) });
      }, 300);

      // Balance reveal
      setTimeout(() => {
        balanceOpacity.value = withTiming(1, { duration: 600 });
        balanceScale.value = withTiming(1, { duration: 600, easing: Easing.back(1.1) });
      }, 800);

      // Feature icons staggered appearance
      setTimeout(() => {
        feature1Scale.value = withDelay(0, withTiming(1, { duration: 500, easing: Easing.back(1.3) }));
        feature2Scale.value = withDelay(150, withTiming(1, { duration: 500, easing: Easing.back(1.3) }));
        feature3Scale.value = withDelay(300, withTiming(1, { duration: 500, easing: Easing.back(1.3) }));
        feature4Scale.value = withDelay(450, withTiming(1, { duration: 500, easing: Easing.back(1.3) }));
      }, 1200);

      // Continuous animations
      setTimeout(() => {
        // Floating animations
        float1Y.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );

        float2Y.value = withDelay(500, withRepeat(
          withSequence(
            withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        ));

        float3Y.value = withDelay(1000, withRepeat(
          withSequence(
            withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        ));

        float4Y.value = withDelay(1500, withRepeat(
          withSequence(
            withTiming(-7, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        ));

        // Card subtle rotation
        card1Rotate.value = withRepeat(
          withSequence(
            withTiming(8, { duration: 3000 }),
            withTiming(2, { duration: 3000 })
          ),
          -1,
          true
        );

        card2Rotate.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 3500 }),
            withTiming(0, { duration: 3500 })
          ),
          -1,
          true
        );

        // Glow effect
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.3, { duration: 2000 }),
            withTiming(0.1, { duration: 2000 })
          ),
          -1,
          true
        );
      }, 1800);

      // Call completion callback
      setTimeout(() => {
        onAnimationComplete?.();
      }, 2500);
    } else {
      // Static state
      containerOpacity.value = 1;
      titleTranslateY.value = 0;
      walletRotateY.value = 0;
      walletScale.value = 1;
      balanceOpacity.value = 1;
      balanceScale.value = 1;
      feature1Scale.value = 1;
      feature2Scale.value = 1;
      feature3Scale.value = 1;
      feature4Scale.value = 1;
    }
  }, [animated]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const walletAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: walletScale.value },
      { rotateY: `${walletRotateY.value}deg` },
      { perspective: 1000 },
    ],
  }));

  const balanceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: balanceOpacity.value,
    transform: [{ scale: balanceScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const createFloatStyle = (floatValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: floatValue.value }],
    }));

  const createCardStyle = (rotateValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotateValue.value}deg` }],
    }));

  const createFeatureStyle = (scaleValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));

  const float1Style = createFloatStyle(float1Y);
  const float2Style = createFloatStyle(float2Y);
  const float3Style = createFloatStyle(float3Y);
  const float4Style = createFloatStyle(float4Y);

  const card1Style = createCardStyle(card1Rotate);
  const card2Style = createCardStyle(card2Rotate);
  const card3Style = createCardStyle(card3Rotate);

  const feature1Style = createFeatureStyle(feature1Scale);
  const feature2Style = createFeatureStyle(feature2Scale);
  const feature3Style = createFeatureStyle(feature3Scale);
  const feature4Style = createFeatureStyle(feature4Scale);

  const FeatureIcon = ({
    icon,
    color,
    animatedStyle
  }: {
    icon: React.ReactNode;
    color: string;
    animatedStyle: any;
  }) => (
    <Animated.View style={[
      styles.featureIcon,
      {
        backgroundColor: cardColor,
        shadowColor: shadowColor,
      },
      isDark ? styles.darkShadow : styles.lightShadow,
      animatedStyle
    ]}>
      {icon}
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
      <Animated.Text style={[
        styles.title,
        { color: textColor },
        titleAnimatedStyle
      ]}>
        Vue d'ensemble du Portefeuille
      </Animated.Text>

      {/* 3D Isometric Wallet */}
      <Animated.View style={[styles.walletContainer, walletAnimatedStyle]}>
        {/* Glow effect */}
        <Animated.View style={[
          styles.walletGlow,
          { backgroundColor: accentColor },
          glowAnimatedStyle
        ]} />

        {/* Main wallet body */}
        <View style={[
          styles.walletBody,
          {
            backgroundColor: cardColor,
            shadowColor: shadowColor,
          },
          isDark ? styles.darkShadow : styles.lightShadow,
        ]}>
          <Wallet size={32} color={accentColor} />
        </View>

        {/* Wallet top face (3D effect) */}
        <View style={[
          styles.walletTop,
          {
            backgroundColor: highlightColor,
            borderColor: isDark ? '#444444' : '#e0e0e0',
          }
        ]} />

        {/* Wallet side face (3D effect) */}
        <View style={[
          styles.walletSide,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#e8e8e8',
            borderColor: isDark ? '#333333' : '#d0d0d0',
          }
        ]} />
      </Animated.View>

      {/* Balance Display */}
      <Animated.View style={[
        styles.balanceContainer,
        {
          backgroundColor: cardColor,
          shadowColor: shadowColor,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
        balanceAnimatedStyle
      ]}>
        <Text style={[styles.balanceLabel, { color: subtleTextColor }]}>Solde disponible</Text>
        <Text style={[styles.balanceAmount, { color: accentColor }]}>1,247.50€</Text>
        <View style={styles.balanceDetails}>
          <Text style={[styles.balanceDetail, { color: subtleTextColor }]}>
            <TrendingUp size={12} color={accentColor} /> +5.2% ce mois
          </Text>
        </View>
      </Animated.View>

      {/* Floating Credit Cards */}
      <Animated.View style={[styles.floatingCard, styles.card1, card1Style, float1Style]}>
        <View style={[styles.creditCard, { backgroundColor: secondaryColor }]}>
          <CreditCard size={16} color="#ffffff" />
        </View>
      </Animated.View>

      <Animated.View style={[styles.floatingCard, styles.card2, card2Style, float2Style]}>
        <View style={[styles.creditCard, { backgroundColor: warningColor }]}>
          <CreditCard size={16} color="#ffffff" />
        </View>
      </Animated.View>

      <Animated.View style={[styles.floatingCard, styles.card3, card3Style, float3Style]}>
        <View style={[styles.creditCard, { backgroundColor: accentColor }]}>
          <CreditCard size={16} color="#ffffff" />
        </View>
      </Animated.View>

      {/* Feature Icons */}
      <FeatureIcon
        icon={<Shield size={16} color={accentColor} />}
        color={accentColor}
        animatedStyle={[feature1Style, float1Style, { position: 'absolute', top: 60, left: 30 }]}
      />

      <FeatureIcon
        icon={<Zap size={16} color={warningColor} />}
        color={warningColor}
        animatedStyle={[feature2Style, float2Style, { position: 'absolute', top: 80, right: 40 }]}
      />

      <FeatureIcon
        icon={<Eye size={16} color={secondaryColor} />}
        color={secondaryColor}
        animatedStyle={[feature3Style, float3Style, { position: 'absolute', bottom: 80, left: 40 }]}
      />

      <FeatureIcon
        icon={<TrendingUp size={16} color={accentColor} />}
        color={accentColor}
        animatedStyle={[feature4Style, float4Style, { position: 'absolute', bottom: 60, right: 30 }]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  walletContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  walletGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -5,
    left: -5,
    zIndex: -1,
  },
  walletBody: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 2,
  },
  walletTop: {
    position: 'absolute',
    width: 80,
    height: 20,
    borderRadius: 20,
    top: -10,
    left: 5,
    borderWidth: 1,
    transform: [{ skewX: '45deg' }],
    zIndex: 1,
  },
  walletSide: {
    position: 'absolute',
    width: 20,
    height: 80,
    borderRadius: 10,
    top: 5,
    right: -10,
    borderWidth: 1,
    transform: [{ skewY: '45deg' }],
    zIndex: 1,
  },
  lightShadow: {
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowColor: '#ffffff',
  },
  darkShadow: {
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000000',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  balanceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  balanceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceDetail: {
    fontSize: 10,
    fontWeight: '500',
  },
  floatingCard: {
    position: 'absolute',
  },
  card1: {
    top: 50,
    left: 20,
  },
  card2: {
    top: 70,
    right: 25,
  },
  card3: {
    bottom: 90,
    left: 25,
  },
  creditCard: {
    width: 35,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});

export default WalletOverview;


