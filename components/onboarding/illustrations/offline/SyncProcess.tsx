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

const SyncProcess: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const syncProgress = useSharedValue(0);
  const dataFlow = useSharedValue(0);
  const cloudPulse = useSharedValue(0);
  const devicePulse = useSharedValue(0);
  const progressBar = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Animation du processus de synchronisation
      syncProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          withDelay(500, withTiming(0, { duration: 500 }))
        ),
        -1,
        false
      );

      // Animation du flux de données
      dataFlow.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );

      // Pulsation du cloud
      cloudPulse.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      // Pulsation du device
      devicePulse.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      // Barre de progression
      progressBar.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.out(Easing.quad) }),
          withDelay(1000, withTiming(0, { duration: 300 }))
        ),
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
        syncProgress.value = 0;
        dataFlow.value = 0;
        cloudPulse.value = 0;
        devicePulse.value = 0;
        progressBar.value = 0;
      };
    }
  }, [animated]);

  const cloudStyle = useAnimatedStyle(() => {
    const pulse = interpolate(cloudPulse.value, [0, 1], [0.9, 1.1]);
    const opacity = interpolate(syncProgress.value, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);
    return {
      transform: [{ scale: pulse }],
      opacity,
    };
  });

  const deviceStyle = useAnimatedStyle(() => {
    const pulse = interpolate(devicePulse.value, [0, 1], [0.95, 1.05]);
    const opacity = interpolate(syncProgress.value, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);
    return {
      transform: [{ scale: pulse }],
      opacity,
    };
  });

  const dataPacketStyle = useAnimatedStyle(() => {
    const translateY = interpolate(dataFlow.value, [0, 1], [60, -60]);
    const opacity = interpolate(dataFlow.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(progressBar.value, [0, 1], [0, 100]);
    return {
      width: `${width}%`,
    };
  });

  const syncStatusStyle = useAnimatedStyle(() => {
    const opacity = interpolate(syncProgress.value, [0, 0.5, 1], [0, 1, 0]);
    return {
      opacity,
    };
  });

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const textColor = isDark ? '#ffffff' : '#000000';
  const accentColor = isDark ? '#3b82f6' : '#2563eb';
  const successColor = isDark ? '#10b981' : '#059669';

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
        Processus de Synchronisation
      </Text>

      {/* Illustration principale */}
      <View style={styles.illustrationContainer}>
        {/* Cloud (serveur) */}
        <Animated.View style={[styles.cloudContainer, cloudStyle]}>
          <View style={[styles.cloud, { backgroundColor: accentColor }]}>
            <View style={[styles.cloudDot, styles.cloudDot1]} />
            <View style={[styles.cloudDot, styles.cloudDot2]} />
            <View style={[styles.cloudDot, styles.cloudDot3]} />
          </View>
          <Text style={[styles.label, { color: textColor }]}>Serveur</Text>
        </Animated.View>

        {/* Ligne de connexion */}
        <View style={[styles.connectionLine, { backgroundColor: textColor }]} />

        {/* Packets de données animés */}
        <Animated.View style={[styles.dataPacket, dataPacketStyle]}>
          <View style={[styles.packet, { backgroundColor: successColor }]} />
          <View style={[styles.packet, { backgroundColor: accentColor }]} />
          <View style={[styles.packet, { backgroundColor: isDark ? '#f59e0b' : '#d97706' }]} />
        </Animated.View>

        {/* Device (téléphone) */}
        <Animated.View style={[styles.deviceContainer, deviceStyle]}>
          <View style={[styles.device, { backgroundColor: accentColor, borderColor: textColor }]}>
            <View style={[styles.deviceScreen, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} />
          </View>
          <Text style={[styles.label, { color: textColor }]}>Appareil</Text>
        </Animated.View>

        {/* Barre de progression */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBackground, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <Animated.View style={[
              styles.progressFill,
              { backgroundColor: successColor },
              progressBarStyle
            ]} />
          </View>
          <Animated.View style={syncStatusStyle}>
            <Text style={[styles.progressText, { color: textColor }]}>
              Synchronisation en cours...
            </Text>
          </Animated.View>
        </View>

        {/* Indicateurs de statut */}
        <View style={styles.statusIndicators}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: successColor }]} />
            <Text style={[styles.statusText, { color: textColor }]}>Transactions</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.statusText, { color: textColor }]}>Solde</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: isDark ? '#f59e0b' : '#d97706' }]} />
            <Text style={[styles.statusText, { color: textColor }]}>Contacts</Text>
          </View>
        </View>
      </View>

      {/* Texte descriptif */}
      <Text style={[styles.description, { color: textColor }]}>
        Vos données se synchronisent automatiquement dès que la connexion est rétablie
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
    width: 220,
    height: 300,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  cloudContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  cloud: {
    width: 80,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  cloudDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cloudDot1: {
    left: 15,
    top: 15,
  },
  cloudDot2: {
    right: 15,
    top: 15,
  },
  cloudDot3: {
    left: '50%',
    marginLeft: -4,
    bottom: 15,
  },
  connectionLine: {
    position: 'absolute',
    width: 2,
    height: 120,
    top: 80,
    opacity: 0.3,
    zIndex: 1,
  },
  dataPacket: {
    position: 'absolute',
    top: 90,
    alignItems: 'center',
    zIndex: 5,
  },
  packet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  deviceContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  device: {
    width: 60,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceScreen: {
    width: 40,
    height: 70,
    borderRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    width: 180,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusIndicators: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 180,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});

export default SyncProcess;

