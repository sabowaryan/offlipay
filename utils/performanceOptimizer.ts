import { InteractionManager, Platform, Dimensions } from 'react-native';

/**
 * Performance optimization utilities for OffliPay
 */

// Device capability detection
export const getDeviceCapabilities = () => {
  const { width, height } = Dimensions.get('window');
  const screenArea = width * height;
  const isLowEndDevice = Platform.OS === 'android' && Platform.Version < 28;
  const isSmallScreen = screenArea < 700 * 1200; // Example threshold for small screens

  return {
    supportsComplexAnimations: !isLowEndDevice && !isSmallScreen, // Consider screen size
    supportsHeavyOperations: !isLowEndDevice,
    recommendedAnimationDuration: isLowEndDevice ? 200 : 300,
    deviceTier: isLowEndDevice ? 'low' : (isSmallScreen ? 'medium' : 'high'),
  };
};

// Deferred execution helper
export const deferHeavyOperation = (operation: () => Promise<void> | void) => {
  return InteractionManager.runAfterInteractions(async () => {
    try {
      await operation();
    } catch (error) {
      console.warn('Deferred operation failed:', error);
    }
  });
};

// Batch async operations
export const batchAsyncOperations = async <T>(
  operations: (() => Promise<T>)[]
): Promise<PromiseSettledResult<T>[]> => {
  return Promise.allSettled(operations.map(op => op()));
};

// Simple performance timer
export const measureOperation = async <T>(
  operation: () => Promise<T>,
  label: string
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log(`[Performance] ${label}: ${duration}ms`);
    }
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.warn(`[Performance] ${label} failed after ${duration}ms:`, error);
    throw error;
  }
};

// Animation config based on device capabilities
export const getOptimizedAnimationConfig = () => {
  const { supportsComplexAnimations, recommendedAnimationDuration, deviceTier } = getDeviceCapabilities();
  
  let springConfig = {};
  switch (deviceTier) {
    case 'low':
      springConfig = { damping: 25, stiffness: 250, mass: 1 };
      break;
    case 'medium':
      springConfig = { damping: 20, stiffness: 200, mass: 0.9 };
      break;
    case 'high':
    default:
      springConfig = { damping: 15, stiffness: 150, mass: 0.8 };
      break;
  }

  return {
    duration: recommendedAnimationDuration,
    useNativeDriver: true,
    spring: springConfig,
    // New: Adaptive animation complexity based on device tier
    animationComplexity: {
      parallax: deviceTier === 'high' ? 1 : (deviceTier === 'medium' ? 0.5 : 0),
      morphing: deviceTier === 'high',
      particles: deviceTier === 'high' || deviceTier === 'medium',
    },
  };
};

// New: Intelligent lazy loading and caching for illustrations
const illustrationCache = new Map<string, any>();

export const getIllustration = async (illustrationId: string, loadFunction: () => Promise<any>) => {
  if (illustrationCache.has(illustrationId)) {
    return illustrationCache.get(illustrationId);
  }

  // Preload next illustrations
  deferHeavyOperation(async () => {
    // Logic to identify and preload next 1-2 illustrations
    // This would depend on your onboarding flow and screen/slide structure
    console.log(`[Performance] Preloading next illustrations for ${illustrationId}`);
  });

  const illustration = await measureOperation(loadFunction, `Load Illustration ${illustrationId}`);
  illustrationCache.set(illustrationId, illustration);
  return illustration;
};

// New: Memory management for illustrations
export const clearIllustrationCache = () => {
  illustrationCache.clear();
  console.log('[Performance] Illustration cache cleared.');
};

// New: Monitoring memory usage (conceptual, actual implementation depends on native modules)
export const startMemoryMonitoring = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // In a real app, you'd use a native module to get actual memory usage
    setInterval(() => {
      // console.log('[Memory] Current memory usage: X MB');
    }, 5000);
  }
};

// Start monitoring when the app starts
// startMemoryMonitoring();


