import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
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
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { IllustrationProps } from '../../types';

// Fonction utilitaire pour résoudre le thème
const resolveTheme = (theme: 'light' | 'dark' | 'auto', systemTheme: 'light' | 'dark' | null | undefined): 'light' | 'dark' => {
  if (theme === 'auto') {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }
  return theme;
};

// Composant pour le bouclier de sécurité avec effet néomorphisme
const SecurityShield: React.FC<{
  theme: 'light' | 'dark';
  scale: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  size: number;
}> = ({ theme, scale, rotation, size }) => {
  const isDark = theme === 'dark';
  const baseColor = isDark ? '#2a2a2a' : '#e8e8e8';
  const shadowLight = isDark ? '#3a3a3a' : '#ffffff';
  const shadowDark = isDark ? '#1a1a1a' : '#d0d0d0';
  const accentColor = isDark ? '#4CAF50' : '#2E7D32';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateY: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.shieldContainer, animatedStyle]}>
      <View style={[
        styles.shieldBase,
        {
          backgroundColor: baseColor,
          shadowColor: shadowDark,
          elevation: 20,
        }
      ]}>
        <View style={[
          styles.shieldInner,
          {
            backgroundColor: baseColor,
            shadowColor: shadowLight,
          }
        ]}>
          <Svg width="60" height="60" viewBox="0 0 24 24">
            <Defs>
              <RadialGradient id="shieldGradient" cx="50%" cy="30%">
                <Stop offset="0%" stopColor={accentColor} stopOpacity="1" />
                <Stop offset="100%" stopColor={isDark ? '#2E7D32' : '#1B5E20'} stopOpacity="1" />
              </RadialGradient>
            </Defs>
            <Path
              d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"
              fill="url(#shieldGradient)"
            />
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
};

// Composant pour les éléments de validation flottants
const ValidationElement: React.FC<{
  icon: string;
  position: { x: number; y: number };
  delay: number;
  theme: 'light' | 'dark';
  color: string;
}> = ({ icon, position, delay, theme, color }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const isDark = theme === 'dark';
  const baseColor = isDark ? '#2a2a2a' : '#f0f0f0';

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 800 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.back(1.5) }));
    translateY.value = withDelay(
      delay + 800,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const getIconPath = (iconType: string) => {
    switch (iconType) {
      case 'lock':
        return "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10A2,2 0 0,1 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z";
      case 'check':
        return "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
      case 'offline':
        return "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z";
      default:
        return "";
    }
  };

  return (
    <Animated.View
      style={[
        styles.validationElement,
        {
          left: position.x,
          top: position.y,
          backgroundColor: baseColor,
          shadowColor: isDark ? '#000' : '#ccc',
        },
        animatedStyle,
      ]}
    >
      <Svg width="20" height="20" viewBox="0 0 24 24">
        <Path d={getIconPath(icon)} fill={color} />
      </Svg>
    </Animated.View>
  );
};

// Composant pour l'animation de protection (cercles concentriques)
const ProtectionWaves: React.FC<{
  theme: 'light' | 'dark';
  size: number;
}> = ({ theme, size }) => {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  const isDark = theme === 'dark';
  const waveColor = isDark ? '#4CAF50' : '#2E7D32';

  useEffect(() => {
    const animateWaves = () => {
      wave1.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      wave2.value = withDelay(
        400,
        withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }),
          -1,
          false
        )
      );
      wave3.value = withDelay(
        800,
        withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }),
          -1,
          false
        )
      );
    };

    setTimeout(animateWaves, 1500);
  }, []);

  const createWaveStyle = (wave: Animated.SharedValue<number>) => {
    return useAnimatedStyle(() => {
      const scale = interpolate(wave.value, [0, 1], [0.5, 2]);
      const opacity = interpolate(wave.value, [0, 0.3, 1], [0.8, 0.4, 0]);

      return {
        transform: [{ scale }],
        opacity,
      };
    });
  };

  return (
    <View style={styles.wavesContainer}>
      <Animated.View
        style={[
          styles.wave,
          { borderColor: waveColor },
          createWaveStyle(wave1),
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          { borderColor: waveColor },
          createWaveStyle(wave2),
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          { borderColor: waveColor },
          createWaveStyle(wave3),
        ]}
      />
    </View>
  );
};

const WelcomePromise: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const shieldScale = useSharedValue(0);
  const shieldRotation = useSharedValue(-10);
  const fadeIn = useSharedValue(0);

  const systemTheme = useColorScheme();
  const resolvedTheme = resolveTheme(theme, systemTheme);
  const isDark = resolvedTheme === 'dark';
  const backgroundColor = isDark ? '#1a1a1a' : '#f8f9fa';
  const textColor = isDark ? '#ffffff' : '#000000';
  const primaryColor = isDark ? '#4CAF50' : '#2E7D32';
  const secondaryColor = isDark ? '#2196F3' : '#1976D2';
  const accentColor = isDark ? '#FF9800' : '#F57C00';

  useEffect(() => {
    if (animated) {
      // Animation d'apparition
      fadeIn.value = withTiming(1, { duration: 800 });

      // Animation du bouclier
      shieldScale.value = withDelay(
        500,
        withTiming(1, { duration: 1000, easing: Easing.back(1.2) })
      );

      shieldRotation.value = withDelay(
        500,
        withSequence(
          withTiming(10, { duration: 500 }),
          withTiming(-5, { duration: 300 }),
          withTiming(0, { duration: 200 })
        )
      );

      // Callback d'animation terminée
      if (onAnimationComplete) {
        setTimeout(() => onAnimationComplete(), 4000);
      }
    }
  }, [animated]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeIn.value,
      transform: [
        { scale: interpolate(fadeIn.value, [0, 1], [0.9, 1]) },
      ],
    };
  });

  // Positions des éléments de validation
  const validationElements = [
    { icon: 'lock', position: { x: size * 0.15, y: size * 0.3 }, color: primaryColor },
    { icon: 'check', position: { x: size * 0.75, y: size * 0.25 }, color: secondaryColor },
    { icon: 'offline', position: { x: size * 0.8, y: size * 0.6 }, color: accentColor },
    { icon: 'check', position: { x: size * 0.1, y: size * 0.65 }, color: primaryColor },
  ];

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
        Sécurisé, simple, toujours disponible
      </Text>

      <View style={styles.illustrationContainer}>
        {/* Animation de protection (ondes) */}
        <ProtectionWaves theme={resolvedTheme} size={size} />

        {/* Bouclier principal avec effet néomorphisme */}
        <SecurityShield
          theme={resolvedTheme}
          scale={shieldScale}
          rotation={shieldRotation}
          size={size}
        />

        {/* Éléments de validation flottants */}
        {validationElements.map((element, index) => (
          <ValidationElement
            key={index}
            icon={element.icon}
            position={element.position}
            delay={1000 + index * 300}
            theme={resolvedTheme}
            color={element.color}
          />
        ))}
      </View>

      {/* Texte des promesses */}
      <View style={styles.promisesContainer}>
        {['Sécurisé', 'Simple', 'Disponible'].map((promise, index) => (
          <PromiseItem
            key={promise}
            text={promise}
            delay={2000 + index * 200}
            theme={resolvedTheme}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// Composant pour les éléments de promesse
const PromiseItem: React.FC<{
  text: string;
  delay: number;
  theme: 'light' | 'dark';
}> = ({ text, delay, theme }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#333333';

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[styles.promiseItem, animatedStyle]}>
      <View style={styles.promiseDot} />
      <Text style={[styles.promiseText, { color: textColor }]}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  shieldContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldBase: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: -8, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  shieldInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  wavesContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  wave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  validationElement: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  promisesContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    width: '100%',
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  promiseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  promiseText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WelcomePromise;

