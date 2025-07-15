import React, { useEffect, useRef, useState } from 'react';
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

const OfflineIllustration: React.FC<IllustrationProps> = ({
  animated = true,
  theme,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const phoneScaleAnim = useRef(new Animated.Value(0.8)).current;

  const wifiSignalAnim = useRef(new Animated.Value(1)).current;
  const offlineIndicatorAnim = useRef(new Animated.Value(0)).current;
  const transactionPulseAnim = useRef(new Animated.Value(1)).current;

  const [connectionState, setConnectionState] = useState<'online' | 'transitioning' | 'offline'>('online');
  
  // Performance optimizations
  const animConfig = getOptimizedAnimationConfig();
  const svgOptimizations = getSVGOptimizations();
  const memoryManager = SVGMemoryManager.getInstance();
  const useComplexAnimations = shouldUseComplexAnimations();
  
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    if (animated && memoryManager.canStartAnimation('offline-main')) {
      memoryManager.startAnimation('offline-main');

      // Initial animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: getOptimizedTiming(500),
          useNativeDriver: animConfig.useNativeDriver,
        }),
        Animated.timing(phoneScaleAnim, {
          toValue: 1,
          duration: getOptimizedTiming(600),
          useNativeDriver: animConfig.useNativeDriver,
        }),
      ]).start();

      // Connection state transition sequence - simplified for low-end devices
      const transitionDelay = useComplexAnimations ? 1500 : 1000;
      setTimeout(() => {
        // Start with online state, then transition to offline
        setConnectionState('transitioning');
        
        // Fade out WiFi signal
        if (memoryManager.canStartAnimation('offline-wifi')) {
          memoryManager.startAnimation('offline-wifi');
          Animated.timing(wifiSignalAnim, {
            toValue: 0,
            duration: getOptimizedTiming(800),
            useNativeDriver: animConfig.useNativeDriver,
          }).start(() => {
            memoryManager.stopAnimation('offline-wifi');
          });
        }

        // Show offline indicator
        const offlineDelay = useComplexAnimations ? 800 : 400;
        setTimeout(() => {
          setConnectionState('offline');
          
          if (memoryManager.canStartAnimation('offline-indicator')) {
            memoryManager.startAnimation('offline-indicator');
            Animated.timing(offlineIndicatorAnim, {
              toValue: 1,
              duration: getOptimizedTiming(600),
              useNativeDriver: animConfig.useNativeDriver,
            }).start(() => {
              memoryManager.stopAnimation('offline-indicator');
            });
          }

          // Pulse animation for offline transactions - only if complex animations are supported
          let pulseAnimation: Animated.CompositeAnimation | null = null;
          if (useComplexAnimations && memoryManager.canStartAnimation('offline-pulse')) {
            memoryManager.startAnimation('offline-pulse');
            pulseAnimation = Animated.loop(
              Animated.sequence([
                Animated.timing(transactionPulseAnim, {
                  toValue: 1.1,
                  duration: getOptimizedTiming(1000),
                  useNativeDriver: animConfig.useNativeDriver,
                }),
                Animated.timing(transactionPulseAnim, {
                  toValue: 1,
                  duration: getOptimizedTiming(1000),
                  useNativeDriver: animConfig.useNativeDriver,
                }),
              ])
            );
            pulseAnimation.start();
          }

          // Complete animation after showing offline capabilities
          const completionDelay = useComplexAnimations ? 2000 : 1000;
          setTimeout(() => {
            pulseAnimation?.stop();
            memoryManager.stopAnimation('offline-main');
            memoryManager.stopAnimation('offline-pulse');
            onAnimationComplete?.();
          }, getOptimizedTiming(completionDelay));
        }, getOptimizedTiming(offlineDelay));
      }, getOptimizedTiming(transitionDelay));
    }

    // Cleanup function
    return () => {
      memoryManager.stopAnimation('offline-main');
      memoryManager.stopAnimation('offline-wifi');
      memoryManager.stopAnimation('offline-indicator');
      memoryManager.stopAnimation('offline-pulse');
    };
  }, [animated, fadeAnim, phoneScaleAnim, wifiSignalAnim, offlineIndicatorAnim, transactionPulseAnim, onAnimationComplete, animConfig, useComplexAnimations, memoryManager]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: ILLUSTRATION_SIZE }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: phoneScaleAnim }],
        }}
      >
        <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.PRIMARY} />
              <Stop offset="100%" stopColor={colors.PRIMARY_LIGHT} />
            </LinearGradient>
            <LinearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.CARD} />
              <Stop offset="100%" stopColor={colors.BACKGROUND} />
            </LinearGradient>
            <LinearGradient id="offlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.WARNING} />
              <Stop offset="100%" stopColor="#ffa726" />
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
            fill="url(#phoneGradient)"
            stroke={colors.ACCENT_ORANGE}
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
            fill="url(#screenGradient)"
          />

          {/* Status bar */}
          <Rect
            x="55"
            y="50"
            width="90"
            height="8"
            rx="2"
            ry="2"
            fill={colors.GRAY_LIGHT}
            opacity="0.3"
          />

          {/* WiFi signal (animated) */}
          <G opacity={wifiSignalAnim}>
            <Path
              d="M125 52 Q130 52 130 57 Q130 62 125 62 Q120 62 120 57 Q120 52 125 52"
              fill={colors.SUCCESS}
            />
            <Path
              d="M122 54 Q128 54 128 60 Q128 66 122 66"
              stroke={colors.SUCCESS}
              strokeWidth="1"
              fill="none"
            />
            <Path
              d="M119 56 Q131 56 131 68"
              stroke={colors.SUCCESS}
              strokeWidth="1"
              fill="none"
              opacity="0.7"
            />
          </G>

          {/* Offline indicator (animated) */}
          <G opacity={offlineIndicatorAnim}>
            <Circle cx="125" cy="57" r="6" fill={colors.WARNING} opacity="0.9" />
            <Path
              d="M122 54 L128 60 M122 60 L128 54"
              stroke={colors.WHITE}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </G>

          {/* App interface */}
          <G>
            {/* Header */}
            <Rect
              x="55"
              y="65"
              width="90"
              height="15"
              rx="3"
              ry="3"
              fill={colors.PRIMARY}
              opacity="0.8"
            />

            {/* Balance card */}
            <Rect
              x="60"
              y="85"
              width="80"
              height="25"
              rx="5"
              ry="5"
              fill={colors.ACCENT_ORANGE}
              opacity="0.9"
            />

            {/* Transaction list */}
            <G>
              {/* Transaction 1 */}
              <G>
                <Rect
                  x="60"
                  y="115"
                  width="80"
                  height="8"
                  rx="2"
                  ry="2"
                  fill={connectionState === 'offline' ? colors.WARNING : colors.WHITE}
                  opacity="0.8"
                />
                <Circle
                  cx="67"
                  cy="119"
                  r="2"
                  fill={connectionState === 'offline' ? colors.ACCENT_ORANGE : colors.SUCCESS}
                />
              </G>

              {/* Transaction 2 */}
              <G>
                <Rect
                  x="60"
                  y="127"
                  width="80"
                  height="8"
                  rx="2"
                  ry="2"
                  fill={connectionState === 'offline' ? colors.WARNING : colors.WHITE}
                  opacity="0.8"
                />
                <Circle
                  cx="67"
                  cy="131"
                  r="2"
                  fill={connectionState === 'offline' ? colors.ACCENT_ORANGE : colors.ERROR}
                />
              </G>

              {/* Transaction 3 */}
              <G>
                <Rect
                  x="60"
                  y="139"
                  width="80"
                  height="8"
                  rx="2"
                  ry="2"
                  fill={connectionState === 'offline' ? colors.WARNING : colors.WHITE}
                  opacity="0.8"
                />
                <Circle
                  cx="67"
                  cy="143"
                  r="2"
                  fill={connectionState === 'offline' ? colors.ACCENT_ORANGE : colors.SUCCESS}
                />
              </G>
            </G>
          </G>

          {/* Connection state indicators */}
          <G transform="translate(100, 180)">
            {/* Online state */}
            <Circle
              cx="-20"
              cy="0"
              r="6"
              fill={connectionState === 'online' ? colors.SUCCESS : colors.GRAY_MEDIUM}
              opacity={connectionState === 'online' ? 1 : 0.3}
            />
            <Path
              d="M-23 -2 L-17 2 M-23 2 L-17 -2"
              stroke={colors.WHITE}
              strokeWidth="1"
              strokeLinecap="round"
              opacity={connectionState === 'online' ? 1 : 0.3}
            />

            {/* Transitioning state */}
            <Circle
              cx="0"
              cy="0"
              r="6"
              fill={connectionState === 'transitioning' ? colors.WARNING : colors.GRAY_MEDIUM}
              opacity={connectionState === 'transitioning' ? 1 : 0.3}
            />
            <Path
              d="M-2 -3 L2 0 L-2 3"
              stroke={colors.WHITE}
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity={connectionState === 'transitioning' ? 1 : 0.3}
            />

            {/* Offline state */}
            <Circle
              cx="20"
              cy="0"
              r="6"
              fill={connectionState === 'offline' ? colors.ACCENT_ORANGE : colors.GRAY_MEDIUM}
              opacity={connectionState === 'offline' ? 1 : 0.3}
            />
            <Path
              d="M17 -3 L23 3 M17 3 L23 -3"
              stroke={colors.WHITE}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={connectionState === 'offline' ? 1 : 0.3}
            />
          </G>

          {/* Offline capability badge */}
          <G opacity={offlineIndicatorAnim}>
            <Rect
              x="160"
              y="40"
              width="30"
              height="20"
              rx="10"
              ry="10"
              fill="url(#offlineGradient)"
              opacity="0.9"
            />
            <Path
              d="M170 46 L175 50 L180 46"
              stroke={colors.WHITE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="175" cy="53" r="1.5" fill={colors.WHITE} />
          </G>

          {/* Sync arrows (showing offline sync capability) */}
          <G opacity={offlineIndicatorAnim}>
            <G transform="translate(25, 100)">
              <Path
                d="M0 0 Q5 -5 10 0 L8 2 M10 0 L8 -2"
                stroke={colors.SUCCESS}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.7"
              />
              <Path
                d="M0 8 Q5 13 10 8 L8 6 M10 8 L8 10"
                stroke={colors.SUCCESS}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.7"
                transform="rotate(180 5 8)"
              />
            </G>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};

export default OfflineIllustration;