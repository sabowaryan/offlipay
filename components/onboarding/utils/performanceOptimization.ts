import { Dimensions, Platform } from 'react-native';

/**
 * Performance optimization utilities for onboarding animations
 * Helps detect device capabilities and adjust animation complexity accordingly
 */

interface DevicePerformance {
  isLowEnd: boolean;
  shouldReduceAnimations: boolean;
  maxParticles: number;
  animationDuration: number;
  memoryUsage: 'low' | 'medium' | 'high';
  cpuIntensive: boolean;
}

/**
 * Detect device performance capabilities
 * This is a simplified heuristic based on screen size and platform
 */
export const detectDevicePerformance = (): DevicePerformance => {
  const { width, height } = Dimensions.get('window');
  const screenArea = width * height;
  
  // Heuristic: smaller screens often indicate lower-end devices
  const isLowEnd = screenArea < 800 * 600; // Less than ~480k pixels
  const isMidRange = screenArea >= 800 * 600 && screenArea < 1200 * 800;
  
  // Additional checks for older devices (simplified)
  const shouldReduceAnimations = isLowEnd || (Platform.OS === 'android' && isLowEnd);
  
  // Determine memory usage category
  let memoryUsage: 'low' | 'medium' | 'high' = 'medium';
  if (isLowEnd) {
    memoryUsage = 'low';
  } else if (screenArea > 1200 * 800) {
    memoryUsage = 'high';
  }
  
  // CPU intensive operations should be limited on low-end devices
  const cpuIntensive = !isLowEnd && screenArea > 1000 * 700;
  
  return {
    isLowEnd,
    shouldReduceAnimations,
    maxParticles: isLowEnd ? 4 : isMidRange ? 6 : 8,
    animationDuration: shouldReduceAnimations ? 0.7 : 1.0,
    memoryUsage,
    cpuIntensive,
  };
};

/**
 * Get optimized animation configuration based on device performance
 */
export const getOptimizedAnimationConfig = () => {
  const performance = detectDevicePerformance();
  
  return {
    // Animation durations (multiplier)
    durationMultiplier: performance.animationDuration,
    
    // Particle effects
    particleCount: performance.maxParticles,
    
    // Animation complexity
    useSimpleAnimations: performance.shouldReduceAnimations,
    
    // Frame rate targets
    targetFPS: performance.isLowEnd ? 30 : 60,
    
    // Preloading strategy
    preloadAssets: !performance.isLowEnd,
    
    // SVG-specific optimizations
    svgComplexity: performance.isLowEnd ? 'low' : performance.memoryUsage === 'high' ? 'high' : 'medium',
    
    // Memory management
    enableGradients: performance.memoryUsage !== 'low',
    enableShadows: performance.cpuIntensive,
    maxConcurrentAnimations: performance.isLowEnd ? 2 : 4,
    
    // Animation timing optimizations
    useNativeDriver: true,
    enableInteractionManager: performance.isLowEnd,
  };
};

/**
 * Lazy loading utility for heavy animation assets
 */
export const createLazyAnimationLoader = () => {
  const loadedAssets = new Set<string>();
  
  return {
    isLoaded: (assetId: string) => loadedAssets.has(assetId),
    
    markAsLoaded: (assetId: string) => {
      loadedAssets.add(assetId);
    },
    
    shouldPreload: () => {
      const config = getOptimizedAnimationConfig();
      return config.preloadAssets;
    },
  };
};

/**
 * Animation performance monitor
 * Helps detect if animations are causing performance issues
 */
export class AnimationPerformanceMonitor {
  private frameDrops = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;
  
  startMonitoring() {
    this.isMonitoring = true;
    this.frameDrops = 0;
    this.lastFrameTime = Date.now();
  }
  
  stopMonitoring() {
    this.isMonitoring = false;
  }
  
  recordFrame() {
    if (!this.isMonitoring) return;
    
    const now = Date.now();
    const frameDuration = now - this.lastFrameTime;
    
    // Detect frame drops (assuming 60fps target = ~16.67ms per frame)
    if (frameDuration > 33) { // More than 2 frames worth of time
      this.frameDrops++;
    }
    
    this.lastFrameTime = now;
  }
  
  getPerformanceReport() {
    return {
      frameDrops: this.frameDrops,
      shouldReduceComplexity: this.frameDrops > 5, // Arbitrary threshold
    };
  }
}

/**
 * Fallback animation configurations for different performance levels
 */
export const ANIMATION_FALLBACKS = {
  HIGH_PERFORMANCE: {
    particleCount: 8,
    animationDuration: 1.0,
    useComplexPaths: true,
    enableBlur: true,
  },
  
  MEDIUM_PERFORMANCE: {
    particleCount: 6,
    animationDuration: 0.8,
    useComplexPaths: true,
    enableBlur: false,
  },
  
  LOW_PERFORMANCE: {
    particleCount: 4,
    animationDuration: 0.6,
    useComplexPaths: false,
    enableBlur: false,
  },
  
  MINIMAL: {
    particleCount: 0,
    animationDuration: 0.3,
    useComplexPaths: false,
    enableBlur: false,
  },
};

/**
 * Get appropriate fallback configuration based on device performance
 */
export const getAnimationFallback = () => {
  const performance = detectDevicePerformance();
  
  if (performance.isLowEnd) {
    return ANIMATION_FALLBACKS.LOW_PERFORMANCE;
  } else if (performance.shouldReduceAnimations) {
    return ANIMATION_FALLBACKS.MEDIUM_PERFORMANCE;
  } else {
    return ANIMATION_FALLBACKS.HIGH_PERFORMANCE;
  }
};

/**
 * SVG-specific performance optimizations
 */
export const getSVGOptimizations = () => {
  const config = getOptimizedAnimationConfig();
  
  return {
    // Reduce SVG complexity based on device performance
    simplifyPaths: config.svgComplexity === 'low',
    
    // Gradient optimizations
    useGradients: config.enableGradients,
    gradientStops: config.svgComplexity === 'low' ? 2 : config.svgComplexity === 'medium' ? 3 : 5,
    
    // Animation optimizations
    maxAnimatedElements: config.maxConcurrentAnimations,
    useTransforms: true, // Always use transforms for better performance
    
    // Memory optimizations
    reuseElements: true,
    optimizeViewBox: true,
    
    // Rendering optimizations
    vectorEffect: config.svgComplexity === 'low' ? 'non-scaling-stroke' : undefined,
    shapeRendering: config.svgComplexity === 'low' ? 'optimizeSpeed' : 'auto',
  };
};

/**
 * Memory management for SVG animations
 */
export class SVGMemoryManager {
  private static instance: SVGMemoryManager;
  private activeAnimations = new Set<string>();
  private memoryThreshold: number;
  
  constructor() {
    const performance = detectDevicePerformance();
    this.memoryThreshold = performance.isLowEnd ? 2 : performance.memoryUsage === 'high' ? 8 : 4;
  }
  
  static getInstance(): SVGMemoryManager {
    if (!SVGMemoryManager.instance) {
      SVGMemoryManager.instance = new SVGMemoryManager();
    }
    return SVGMemoryManager.instance;
  }
  
  canStartAnimation(animationId: string): boolean {
    return this.activeAnimations.size < this.memoryThreshold;
  }
  
  startAnimation(animationId: string): void {
    if (this.canStartAnimation(animationId)) {
      this.activeAnimations.add(animationId);
    }
  }
  
  stopAnimation(animationId: string): void {
    this.activeAnimations.delete(animationId);
  }
  
  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }
  
  clearAll(): void {
    this.activeAnimations.clear();
  }
}

/**
 * Utility to optimize animation timing based on device performance
 */
export const getOptimizedTiming = (baseDuration: number) => {
  const config = getOptimizedAnimationConfig();
  return Math.round(baseDuration * config.durationMultiplier);
};

/**
 * Utility to determine if complex animations should be enabled
 */
export const shouldUseComplexAnimations = (): boolean => {
  const performance = detectDevicePerformance();
  return !performance.shouldReduceAnimations && performance.cpuIntensive;
};