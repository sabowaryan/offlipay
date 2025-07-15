import { Platform, InteractionManager } from 'react-native';
import { detectDevicePerformance } from './performanceOptimization';

/**
 * Real-time performance monitoring for onboarding components
 * Tracks metrics like frame drops, memory usage, and load times
 */

interface PerformanceMetrics {
  frameDrops: number;
  averageFrameTime: number;
  memoryUsage: number;
  loadTime: number;
  interactionLatency: number;
  animationCompletionRate: number;
}

interface PerformanceThresholds {
  maxFrameDrops: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxLoadTime: number;
  maxInteractionLatency: number;
}

export class OnboardingPerformanceMonitor {
  private static instance: OnboardingPerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private isMonitoring: boolean = false;
  private startTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private performanceCallbacks: Array<(metrics: PerformanceMetrics) => void> = [];
  private degradationCallbacks: Array<() => void> = [];

  constructor() {
    const devicePerformance = detectDevicePerformance();
    
    this.metrics = {
      frameDrops: 0,
      averageFrameTime: 0,
      memoryUsage: 0,
      loadTime: 0,
      interactionLatency: 0,
      animationCompletionRate: 100,
    };

    // Set thresholds based on device performance
    this.thresholds = {
      maxFrameDrops: devicePerformance.isLowEnd ? 15 : 10,
      maxFrameTime: devicePerformance.isLowEnd ? 33 : 16.67, // 30fps vs 60fps
      maxMemoryUsage: devicePerformance.memoryUsage === 'low' ? 50 : 100, // MB
      maxLoadTime: 2000, // 2 seconds as per requirements
      maxInteractionLatency: devicePerformance.isLowEnd ? 200 : 100, // ms
    };
  }

  static getInstance(): OnboardingPerformanceMonitor {
    if (!OnboardingPerformanceMonitor.instance) {
      OnboardingPerformanceMonitor.instance = new OnboardingPerformanceMonitor();
    }
    return OnboardingPerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance metrics
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = Date.now();
    this.lastFrameTime = Date.now();
    this.frameCount = 0;
    this.resetMetrics();

    // Start frame monitoring
    this.scheduleFrameMonitoring();

    console.log('[Performance] Monitoring started');
  }

  /**
   * Stop monitoring and generate final report
   */
  stopMonitoring(): PerformanceMetrics {
    if (!this.isMonitoring) return this.metrics;

    this.isMonitoring = false;
    const totalTime = Date.now() - this.startTime;
    
    // Calculate final metrics
    this.metrics.averageFrameTime = totalTime / Math.max(this.frameCount, 1);
    
    console.log('[Performance] Monitoring stopped', this.metrics);
    
    // Notify callbacks
    this.performanceCallbacks.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.warn('[Performance] Callback error:', error);
      }
    });

    return this.metrics;
  }

  /**
   * Record a frame for performance tracking
   */
  recordFrame(): void {
    if (!this.isMonitoring) return;

    const now = Date.now();
    const frameDuration = now - this.lastFrameTime;
    
    this.frameCount++;
    
    // Check for frame drops
    if (frameDuration > this.thresholds.maxFrameTime * 2) {
      this.metrics.frameDrops++;
      
      // Check if we need to trigger performance degradation
      if (this.metrics.frameDrops > this.thresholds.maxFrameDrops) {
        this.triggerPerformanceDegradation();
      }
    }
    
    this.lastFrameTime = now;
  }

  /**
   * Record load time for a specific operation
   */
  recordLoadTime(operationName: string, duration: number): void {
    this.metrics.loadTime = Math.max(this.metrics.loadTime, duration);
    
    if (duration > this.thresholds.maxLoadTime) {
      console.warn(`[Performance] Load time exceeded threshold: ${operationName} took ${duration}ms`);
    }
  }

  /**
   * Record interaction latency
   */
  recordInteraction(latency: number): void {
    this.metrics.interactionLatency = Math.max(this.metrics.interactionLatency, latency);
    
    if (latency > this.thresholds.maxInteractionLatency) {
      console.warn(`[Performance] Interaction latency exceeded threshold: ${latency}ms`);
    }
  }

  /**
   * Record animation completion
   */
  recordAnimationCompletion(completed: boolean): void {
    if (!completed) {
      this.metrics.animationCompletionRate = Math.max(0, this.metrics.animationCompletionRate - 5);
      
      if (this.metrics.animationCompletionRate < 80) {
        this.triggerPerformanceDegradation();
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    return (
      this.metrics.frameDrops > this.thresholds.maxFrameDrops ||
      this.metrics.averageFrameTime > this.thresholds.maxFrameTime ||
      this.metrics.loadTime > this.thresholds.maxLoadTime ||
      this.metrics.interactionLatency > this.thresholds.maxInteractionLatency ||
      this.metrics.animationCompletionRate < 80
    );
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.frameDrops > this.thresholds.maxFrameDrops) {
      recommendations.push('Reduce animation complexity');
      recommendations.push('Enable performance mode');
    }
    
    if (this.metrics.loadTime > this.thresholds.maxLoadTime) {
      recommendations.push('Enable asset preloading');
      recommendations.push('Optimize image sizes');
    }
    
    if (this.metrics.interactionLatency > this.thresholds.maxInteractionLatency) {
      recommendations.push('Reduce UI complexity');
      recommendations.push('Optimize gesture handlers');
    }
    
    if (this.metrics.animationCompletionRate < 80) {
      recommendations.push('Switch to simplified animations');
      recommendations.push('Reduce concurrent animations');
    }
    
    return recommendations;
  }

  /**
   * Subscribe to performance updates
   */
  onPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.performanceCallbacks.push(callback);
    
    return () => {
      const index = this.performanceCallbacks.indexOf(callback);
      if (index > -1) {
        this.performanceCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to performance degradation events
   */
  onPerformanceDegradation(callback: () => void): () => void {
    this.degradationCallbacks.push(callback);
    
    return () => {
      const index = this.degradationCallbacks.indexOf(callback);
      if (index > -1) {
        this.degradationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Reset all metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      frameDrops: 0,
      averageFrameTime: 0,
      memoryUsage: 0,
      loadTime: 0,
      interactionLatency: 0,
      animationCompletionRate: 100,
    };
  }

  /**
   * Schedule frame monitoring using InteractionManager
   */
  private scheduleFrameMonitoring(): void {
    if (!this.isMonitoring) return;

    InteractionManager.runAfterInteractions(() => {
      this.recordFrame();
      
      if (this.isMonitoring) {
        // Schedule next frame monitoring
        requestAnimationFrame(() => {
          this.scheduleFrameMonitoring();
        });
      }
    });
  }

  /**
   * Trigger performance degradation callbacks
   */
  private triggerPerformanceDegradation(): void {
    console.warn('[Performance] Performance degradation detected', this.metrics);
    
    this.degradationCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('[Performance] Degradation callback error:', error);
      }
    });
  }
}

/**
 * Performance monitoring hook for React components
 */
export const usePerformanceMonitoring = () => {
  const monitor = OnboardingPerformanceMonitor.getInstance();
  
  const startMonitoring = () => monitor.startMonitoring();
  const stopMonitoring = () => monitor.stopMonitoring();
  const recordLoadTime = (name: string, duration: number) => monitor.recordLoadTime(name, duration);
  const recordInteraction = (latency: number) => monitor.recordInteraction(latency);
  const recordAnimationCompletion = (completed: boolean) => monitor.recordAnimationCompletion(completed);
  const getCurrentMetrics = () => monitor.getCurrentMetrics();
  const isPerformanceDegraded = () => monitor.isPerformanceDegraded();
  const getRecommendations = () => monitor.getPerformanceRecommendations();
  
  return {
    startMonitoring,
    stopMonitoring,
    recordLoadTime,
    recordInteraction,
    recordAnimationCompletion,
    getCurrentMetrics,
    isPerformanceDegraded,
    getRecommendations,
    onPerformanceUpdate: monitor.onPerformanceUpdate.bind(monitor),
    onPerformanceDegradation: monitor.onPerformanceDegradation.bind(monitor),
  };
};

/**
 * Performance measurement decorator for timing functions
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T => {
  return ((...args: any[]) => {
    const monitor = OnboardingPerformanceMonitor.getInstance();
    const startTime = Date.now();
    
    try {
      const result = fn(...args);
      
      // Handle both sync and async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const duration = Date.now() - startTime;
          monitor.recordLoadTime(operationName, duration);
        });
      } else {
        const duration = Date.now() - startTime;
        monitor.recordLoadTime(operationName, duration);
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      monitor.recordLoadTime(`${operationName}-error`, duration);
      throw error;
    }
  }) as T;
};

/**
 * Performance-aware timeout that adjusts based on device performance
 */
export const createPerformanceAwareTimeout = (
  callback: () => void,
  baseDelay: number
): ReturnType<typeof setTimeout> => {
  const devicePerformance = detectDevicePerformance();
  const adjustedDelay = baseDelay * devicePerformance.animationDuration;
  
  return setTimeout(callback, adjustedDelay);
};

/**
 * Utility to check if device can handle complex operations
 */
export const canHandleComplexOperation = (): boolean => {
  const monitor = OnboardingPerformanceMonitor.getInstance();
  const metrics = monitor.getCurrentMetrics();
  
  return (
    metrics.frameDrops < 5 &&
    metrics.animationCompletionRate > 90 &&
    !monitor.isPerformanceDegraded()
  );
};