import { InteractionManager, Platform } from 'react-native';

/**
 * Performance optimization utilities for OffliPay
 */

// Device capability detection
export const getDeviceCapabilities = () => {
  // Simple heuristic based on platform and available APIs
  const isLowEndDevice = Platform.OS === 'android' && Platform.Version < 28;
  
  return {
    supportsComplexAnimations: !isLowEndDevice,
    supportsHeavyOperations: !isLowEndDevice,
    recommendedAnimationDuration: isLowEndDevice ? 200 : 300,
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
  const { supportsComplexAnimations, recommendedAnimationDuration } = getDeviceCapabilities();
  
  return {
    duration: recommendedAnimationDuration,
    useNativeDriver: true,
    // Reduce spring complexity on low-end devices
    spring: supportsComplexAnimations 
      ? { damping: 15, stiffness: 150 }
      : { damping: 20, stiffness: 200, mass: 0.8 },
  };
};