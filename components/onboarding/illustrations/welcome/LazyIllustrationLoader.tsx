import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { IllustrationProps, DeviceCapability, AnimationLevel } from '@/types';

interface LazyIllustrationLoaderProps extends IllustrationProps {
  children: React.ReactNode;
  preloadDistance?: number;
  memoryThreshold?: number;
  enablePerformanceMonitoring?: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameDrops: number;
  animationComplexity: AnimationLevel;
}

export const LazyIllustrationLoader: React.FC<LazyIllustrationLoaderProps> = ({
  children,
  theme,
  animated,
  size,
  onAnimationComplete,
  preloadDistance = 100,
  memoryThreshold = 80, // MB
  enablePerformanceMonitoring = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('medium');
  const [animationLevel, setAnimationLevel] = useState<AnimationLevel>('standard');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    frameDrops: 0,
    animationComplexity: 'standard',
  });

  const containerRef = useRef<View>(null);
  const loadStartTime = useRef<number>(0);
  const frameDropCounter = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const opacity = useRef(new Animated.Value(0)).current;

  // Device capability detection
  const detectDeviceCapability = useMemo((): DeviceCapability => {
    const { width, height } = Dimensions.get('window');
    const screenSize = width * height;
    const pixelRatio = Dimensions.get('window').scale;
    
    // Simple heuristic based on screen size and pixel ratio
    if (screenSize > 2000000 && pixelRatio >= 3) {
      return 'high';
    } else if (screenSize > 1000000 && pixelRatio >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }, []);

  // Animation level adaptation based on device capability
  const adaptAnimationLevel = useMemo((): AnimationLevel => {
    switch (deviceCapability) {
      case 'high':
        return 'premium';
      case 'medium':
        return 'standard';
      case 'low':
        return 'minimal';
      default:
        return 'standard';
    }
  }, [deviceCapability]);

  // Memory monitoring
  const monitorMemoryUsage = () => {
    if (!enablePerformanceMonitoring) return;

    // Simulate memory usage monitoring
    // In a real implementation, you would use native modules or performance APIs
    const estimatedMemoryUsage = Math.random() * 100; // Simulated value
    
    setPerformanceMetrics(prev => ({
      ...prev,
      memoryUsage: estimatedMemoryUsage,
    }));

    // Reduce animation complexity if memory usage is high
    if (estimatedMemoryUsage > memoryThreshold) {
      setAnimationLevel(prev => {
        if (prev === 'premium') return 'standard';
        if (prev === 'standard') return 'minimal';
        return prev;
      });
    }
  };

  // Frame drop detection
  const monitorFrameDrops = () => {
    if (!enablePerformanceMonitoring) return;

    const currentTime = Date.now();
    if (lastFrameTime.current > 0) {
      const frameDuration = currentTime - lastFrameTime.current;
      // Detect frame drops (assuming 60fps = 16.67ms per frame)
      if (frameDuration > 33) { // More than 2 frames
        frameDropCounter.current++;
        setPerformanceMetrics(prev => ({
          ...prev,
          frameDrops: frameDropCounter.current,
        }));
      }
    }
    lastFrameTime.current = currentTime;
  };

  // Intersection observer simulation for lazy loading
  useEffect(() => {
    const checkVisibility = () => {
      // Simulate intersection observer
      // In a real implementation, you would use proper intersection detection
      setIsVisible(true);
    };

    const timer = setTimeout(checkVisibility, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load illustration when visible
  useEffect(() => {
    if (isVisible && !isLoaded) {
      loadStartTime.current = Date.now();
      
      // Simulate loading delay based on device capability
      const loadDelay = deviceCapability === 'low' ? 300 : 
                       deviceCapability === 'medium' ? 150 : 50;
      
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
        const renderTime = Date.now() - loadStartTime.current;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime,
          animationComplexity: animationLevel,
        }));

        // Fade in animation
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, loadDelay);

      return () => clearTimeout(loadTimer);
    }
  }, [isVisible, isLoaded, deviceCapability, animationLevel]);

  // Set up device capability and animation level
  useEffect(() => {
    setDeviceCapability(detectDeviceCapability);
  }, [detectDeviceCapability]);

  useEffect(() => {
    setAnimationLevel(adaptAnimationLevel);
  }, [adaptAnimationLevel]);

  // Performance monitoring intervals
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const memoryInterval = setInterval(monitorMemoryUsage, 1000);
    const frameInterval = setInterval(monitorFrameDrops, 16); // ~60fps

    return () => {
      clearInterval(memoryInterval);
      clearInterval(frameInterval);
    };
  }, [enablePerformanceMonitoring, memoryThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset performance counters
      frameDropCounter.current = 0;
      lastFrameTime.current = 0;
    };
  }, []);

  // Render placeholder while loading
  if (!isLoaded) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[
          styles.placeholder,
          {
            backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0',
            width: size * 0.8,
            height: size * 0.8,
          }
        ]}>
          <Animated.View
            style={[
              styles.loadingIndicator,
              {
                backgroundColor: theme === 'dark' ? '#64748B' : '#94A3B8',
              }
            ]}
          />
        </View>
      </View>
    );
  }

  // Enhanced props with performance optimizations
  const enhancedProps: IllustrationProps = {
    theme,
    animated: animated && animationLevel !== 'minimal',
    size,
    onAnimationComplete: () => {
      onAnimationComplete?.();
      
      // Log performance metrics in development
      if (__DEV__ && enablePerformanceMonitoring) {
        console.log('Illustration Performance Metrics:', performanceMetrics);
      }
    },
  };

  return (
    <Animated.View
      ref={containerRef}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity,
        }
      ]}
    >
      {React.cloneElement(children as React.ReactElement, enhancedProps)}
      
      {/* Performance overlay in development */}
      {__DEV__ && enablePerformanceMonitoring && (
        <View style={styles.performanceOverlay}>
          <View style={[
            styles.performanceIndicator,
            {
              backgroundColor: performanceMetrics.frameDrops > 5 ? '#EF4444' : 
                              performanceMetrics.memoryUsage > memoryThreshold ? '#F59E0B' : '#10B981'
            }
          ]} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.8,
  },
  performanceOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1000,
  },
  performanceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});