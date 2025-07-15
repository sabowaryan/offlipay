import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, Text } from 'react-native';
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

const WalletIllustration: React.FC<IllustrationProps> = ({
  animated = true,
  theme,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const walletScaleAnim = useRef(new Animated.Value(0.8)).current;
  const balanceCountAnim = useRef(new Animated.Value(0)).current;
  const transactionAnims = useRef(
    Array.from({ length: 4 }, () => ({
      translateX: new Animated.Value(-200),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const [displayBalance, setDisplayBalance] = useState(0);
  // State for transaction opacities
  const [transactionOpacities, setTransactionOpacities] = useState(
    Array(4).fill(0)
  );

  // Performance optimizations
  const animConfig = getOptimizedAnimationConfig();
  const svgOptimizations = getSVGOptimizations();
  const memoryManager = SVGMemoryManager.getInstance();
  const useComplexAnimations = shouldUseComplexAnimations();

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    if (animated && memoryManager.canStartAnimation('wallet-main')) {
      memoryManager.startAnimation('wallet-main');

      // Initial animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: getOptimizedTiming(500),
          useNativeDriver: animConfig.useNativeDriver,
        }),
        Animated.timing(walletScaleAnim, {
          toValue: 1,
          duration: getOptimizedTiming(600),
          useNativeDriver: animConfig.useNativeDriver,
        }),
      ]).start();

      // Balance counter animation - only if complex animations are supported
      if (useComplexAnimations && memoryManager.canStartAnimation('wallet-balance')) {
        memoryManager.startAnimation('wallet-balance');
        setTimeout(() => {
          Animated.timing(balanceCountAnim, {
            toValue: 1,
            duration: getOptimizedTiming(2000),
            useNativeDriver: false, // Cannot use native driver for non-transform properties
          }).start(() => {
            memoryManager.stopAnimation('wallet-balance');
          });
        }, getOptimizedTiming(800));
      } else {
        // Instant balance display for low-end devices
        setDisplayBalance(15420);
      }

      // Transaction animations with staggered delays - limit concurrent animations
      const maxTransactions = Math.min(transactions.length, animConfig.maxConcurrentAnimations);
      const transactionAnimations = transactionAnims.slice(0, maxTransactions).map((transaction, index) => {
        return Animated.sequence([
          Animated.delay(getOptimizedTiming(1200 + index * (useComplexAnimations ? 400 : 200))),
          Animated.parallel([
            Animated.timing(transaction.translateX, {
              toValue: 0,
              duration: getOptimizedTiming(600),
              useNativeDriver: animConfig.useNativeDriver,
            }),
            Animated.timing(transaction.opacity, {
              toValue: 1,
              duration: getOptimizedTiming(400),
              useNativeDriver: animConfig.useNativeDriver,
            }),
          ]),
        ]);
      });

      Animated.parallel(transactionAnimations).start(() => {
        memoryManager.stopAnimation('wallet-main');
        onAnimationComplete?.();
      });
    }

    // Cleanup function
    return () => {
      memoryManager.stopAnimation('wallet-main');
      memoryManager.stopAnimation('wallet-balance');
    };
  }, [animated, fadeAnim, walletScaleAnim, balanceCountAnim, transactionAnims, onAnimationComplete, animConfig, useComplexAnimations, memoryManager]);

  // Update balance display based on animation progress
  useEffect(() => {
    const listener = balanceCountAnim.addListener(({ value }) => {
      setDisplayBalance(Math.floor(value * 15420)); // Target balance: 15,420
    });

    // Add listeners for transaction opacity animations
    const transactionListeners = transactionAnims.map((anim, index) => {
      return anim.opacity.addListener(({ value }) => {
        setTransactionOpacities(prev => {
          const newOpacities = [...prev];
          newOpacities[index] = value;
          return newOpacities;
        });
      });
    });

    return () => {
      balanceCountAnim.removeListener(listener);
      // Clean up transaction listeners
      transactionAnims.forEach((anim, index) => {
        if (transactionListeners[index]) {
          anim.opacity.removeListener(transactionListeners[index]);
        }
      });
    };
  }, [balanceCountAnim, transactionAnims]);

  const transactions = [
    { type: 'received', amount: '+2,500', description: 'Recharge Agent', icon: 'plus' },
    { type: 'sent', amount: '-850', description: 'Paiement Restaurant', icon: 'minus' },
    { type: 'received', amount: '+1,200', description: 'Transfert reçu', icon: 'plus' },
    { type: 'sent', amount: '-320', description: 'Achat Épicerie', icon: 'minus' },
  ];

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: ILLUSTRATION_SIZE }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: walletScaleAnim }],
        }}
      >
        <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.PRIMARY} />
              <Stop offset="100%" stopColor={colors.PRIMARY_LIGHT} />
            </LinearGradient>
            <LinearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.ACCENT_ORANGE} />
              <Stop offset="100%" stopColor="#ff8a65" />
            </LinearGradient>
            <LinearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.CARD} />
              <Stop offset="100%" stopColor={colors.BACKGROUND} />
            </LinearGradient>
          </Defs>

          {/* Phone frame */}
          <Rect
            x="30"
            y="20"
            width="140"
            height="160"
            rx="20"
            ry="20"
            fill="url(#walletGradient)"
            stroke={colors.ACCENT_ORANGE}
            strokeWidth="2"
          />

          {/* Screen */}
          <Rect
            x="40"
            y="35"
            width="120"
            height="130"
            rx="12"
            ry="12"
            fill="url(#screenGradient)"
          />

          {/* Balance card */}
          <Rect
            x="50"
            y="45"
            width="100"
            height="40"
            rx="8"
            ry="8"
            fill="url(#cardGradient)"
            opacity="0.9"
          />

          {/* Balance text area */}
          <Rect
            x="55"
            y="50"
            width="90"
            height="30"
            rx="4"
            ry="4"
            fill={colors.WHITE}
            opacity="0.2"
          />

          {/* Transaction list background */}
          <Rect
            x="50"
            y="95"
            width="100"
            height="60"
            rx="6"
            ry="6"
            fill={colors.WHITE}
            opacity="0.1"
          />

          {/* Transaction items */}
          {transactions.map((transaction, index) => {
            // Use the state-based opacity value that we're updating via animation listeners
            const opacity = transactionOpacities[index];

            return (
              <G
                key={index}
                opacity={opacity}
              >
                {/* Transaction row */}
                <Rect
                  x="55"
                  y={100 + index * 12}
                  width="90"
                  height="10"
                  rx="2"
                  ry="2"
                  fill={colors.WHITE}
                  opacity="0.8"
                />

                {/* Transaction icon */}
                <Circle
                  cx="62"
                  cy={105 + index * 12}
                  r="3"
                  fill={transaction.type === 'received' ? colors.SUCCESS : colors.ERROR}
                />

                {/* Amount indicator */}
                <Rect
                  x="130"
                  y={102 + index * 12}
                  width="12"
                  height="6"
                  rx="1"
                  ry="1"
                  fill={transaction.type === 'received' ? colors.SUCCESS : colors.ERROR}
                  opacity="0.7"
                />
              </G>
            );
          })}

          {/* Wallet icon */}
          <G transform="translate(85, 160)">
            <Path
              d="M-10 5 L10 5 Q15 5 15 10 L15 20 Q15 25 10 25 L-10 25 Q-15 25 -15 20 L-15 10 Q-15 5 -10 5 Z"
              fill={colors.ACCENT_ORANGE}
              opacity="0.8"
            />
            <Rect
              x="5"
              y="12"
              width="8"
              height="6"
              rx="2"
              ry="2"
              fill={colors.PRIMARY}
            />
          </G>

          {/* Cash-in methods icons */}
          <G opacity="0.6">
            {/* Agent icon */}
            <Circle cx="180" cy="40" r="8" fill={colors.SUCCESS} opacity="0.7" />
            <Path
              d="M176 36 L184 36 M178 40 L182 40 M176 44 L184 44"
              stroke={colors.WHITE}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Bank icon */}
            <Circle cx="180" cy="60" r="8" fill={colors.INFO} opacity="0.7" />
            <Rect x="176" y="56" width="8" height="8" fill={colors.WHITE} opacity="0.8" />

            {/* Voucher icon */}
            <Circle cx="180" cy="80" r="8" fill={colors.WARNING} opacity="0.7" />
            <Path
              d="M176 76 L184 84 M176 84 L184 76"
              stroke={colors.WHITE}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Animated balance counter overlay */}
        <View
          style={{
            position: 'absolute',
            top: '28%',
            left: '35%',
            right: '35%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: colors.WHITE,
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {displayBalance.toLocaleString()} FCFA
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default WalletIllustration;