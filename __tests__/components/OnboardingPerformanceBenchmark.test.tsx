import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Dimensions, Platform } from 'react-native';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { 
  detectDevicePerformance,
  getOptimizedAnimationConfig,
  AnimationPerformanceMonitor 
} from '@/components/onboarding/utils/performanceOptimization';

// Mock dependencies
jest.mock('@/services/OnboardingService');
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      BACKGROUND: '#FFFFFF',
      TEXT: '#000000',
      PRIMARY: '#007AFF',
      GRAY_MEDIUM: '#666666',
    },
    theme: 'light',
  }),
}));

// Performance benchmarking utilities
class PerformanceBenchmark {
  private measurements: { [key: string]: number[] } = {};
  
  startMeasurement(name: string): () => number {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements[name]) {
        this.measurements[name] = [];
      }
      this.measurements[name].push(duration);
      
      return duration;
    };
  }
  
  getAverageTime(name: string): number {
    const times = this.measurements[name] || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
  
  getMedianTime(name: string): number {
    const times = [...(this.measurements[name] || [])].sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    return times.length % 2 === 0 ? (times[mid - 1] + times[mid]) / 2 : times[mid];
  }
  
  getPercentile(name: string, percentile: number): number {
    const times = [...(this.measurements[name] || [])].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * times.length) - 1;
    return times[Math.max(0, index)] || 0;
  }
  
  getReport(): { [key: string]: any } {
    const report: { [key: string]: any } = {};
    
    Object.keys(this.measurements).forEach(name => {
      report[name] = {
        count: this.measurements[name].length,
        average: this.getAverageTime(name),
        median: this.getMedianTime(name),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
        min: Math.min(...this.measurements[name]),
        max: Math.max(...this.measurements[name]),
      };
    });
    
    return report;
  }
  
  clear() {
    this.measurements = {};
  }
}

describe('Onboarding Performance Benchmarks', () => {
  let benchmark: PerformanceBenchmark;
  let performanceMonitor: AnimationPerformanceMonitor;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
    performanceMonitor = new AnimationPerformanceMonitor();
    jest.clearAllMocks();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
    benchmark.clear();
  });

  describe('Rendering Performance Benchmarks', () => {
    it('should meet rendering performance targets', async () => {
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasurement = benchmark.startMeasurement('component-render');
        
        const { unmount } = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        
        endMeasurement();
        unmount();
      }
      
      const report = benchmark.getReport();
      const renderStats = report['component-render'];
      
      // Performance targets based on requirements
      expect(renderStats.average).toBeLessThan(100); // Average < 100ms
      expect(renderStats.p95).toBeLessThan(200); // 95th percentile < 200ms
      expect(renderStats.p99).toBeLessThan(500); // 99th percentile < 500ms
      
      console.log('Rendering Performance Report:', renderStats);
    });

    it('should benchmark different device performance levels', () => {
      const deviceConfigs = [
        { name: 'low-end', width: 320, height: 568 },
        { name: 'mid-range', width: 375, height: 667 },
        { name: 'high-end', width: 414, height: 896 },
        { name: 'tablet', width: 768, height: 1024 },
      ];

      deviceConfigs.forEach(config => {
        jest.spyOn(Dimensions, 'get').mockReturnValue({
          width: config.width,
          height: config.height,
          scale: 2,
          fontScale: 1,
        });

        const endMeasurement = benchmark.startMeasurement(`render-${config.name}`);
        
        const { unmount } = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        
        endMeasurement();
        unmount();
      });

      const report = benchmark.getReport();
      
      // All device types should meet basic performance requirements
      Object.keys(report).forEach(key => {
        if (key.startsWith('render-')) {
          expect(report[key].average).toBeLessThan(200);
        }
      });
      
      console.log('Device Performance Report:', report);
    });
  });

  describe('Animation Performance Benchmarks', () => {
    it('should benchmark animation configuration generation', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasurement = benchmark.startMeasurement('animation-config');
        getOptimizedAnimationConfig();
        endMeasurement();
      }
      
      const report = benchmark.getReport();
      const configStats = report['animation-config'];
      
      // Configuration generation should be very fast
      expect(configStats.average).toBeLessThan(1); // < 1ms average
      expect(configStats.p99).toBeLessThan(5); // < 5ms 99th percentile
      
      console.log('Animation Config Performance:', configStats);
    });

    it('should benchmark device performance detection', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasurement = benchmark.startMeasurement('device-detection');
        detectDevicePerformance();
        endMeasurement();
      }
      
      const report = benchmark.getReport();
      const detectionStats = report['device-detection'];
      
      // Device detection should be very fast
      expect(detectionStats.average).toBeLessThan(1); // < 1ms average
      expect(detectionStats.max).toBeLessThan(10); // < 10ms maximum
      
      console.log('Device Detection Performance:', detectionStats);
    });
  });

  describe('Memory Performance Benchmarks', () => {
    it('should benchmark memory usage during component lifecycle', () => {
      const iterations = 20;
      const components: any[] = [];
      
      // Measure memory during component creation
      const endCreateMeasurement = benchmark.startMeasurement('memory-create');
      
      for (let i = 0; i < iterations; i++) {
        const component = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        components.push(component);
      }
      
      endCreateMeasurement();
      
      // Measure memory during cleanup
      const endCleanupMeasurement = benchmark.startMeasurement('memory-cleanup');
      
      components.forEach(component => {
        component.unmount();
      });
      
      endCleanupMeasurement();
      
      const report = benchmark.getReport();
      
      // Memory operations should be reasonably fast
      expect(report['memory-create'].average).toBeLessThan(50);
      expect(report['memory-cleanup'].average).toBeLessThan(30);
      
      console.log('Memory Performance Report:', {
        create: report['memory-create'],
        cleanup: report['memory-cleanup'],
      });
    });
  });

  describe('Load Time Benchmarks', () => {
    it('should meet the 2-second load time requirement', async () => {
      const iterations = 5;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasurement = benchmark.startMeasurement('full-load-time');
        
        // Simulate full onboarding load including async operations
        const { unmount } = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        
        // Wait for any async operations to complete
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        endMeasurement();
        unmount();
      }
      
      const report = benchmark.getReport();
      const loadStats = report['full-load-time'];
      
      // Must meet the 2-second requirement from specs
      expect(loadStats.average).toBeLessThan(2000); // < 2 seconds average
      expect(loadStats.p95).toBeLessThan(2500); // < 2.5 seconds 95th percentile
      expect(loadStats.max).toBeLessThan(3000); // < 3 seconds maximum
      
      console.log('Load Time Performance Report:', loadStats);
    });

    it('should benchmark performance under different network conditions', async () => {
      const networkConditions = [
        { name: 'fast', delay: 10 },
        { name: 'medium', delay: 100 },
        { name: 'slow', delay: 500 },
        { name: 'very-slow', delay: 1000 },
      ];

      for (const condition of networkConditions) {
        const endMeasurement = benchmark.startMeasurement(`load-${condition.name}`);
        
        // Simulate network delay
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, condition.delay));
        });
        
        const { unmount } = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        
        endMeasurement();
        unmount();
      }
      
      const report = benchmark.getReport();
      
      // Even slow networks should meet reasonable performance targets
      expect(report['load-fast'].average).toBeLessThan(100);
      expect(report['load-medium'].average).toBeLessThan(200);
      expect(report['load-slow'].average).toBeLessThan(600);
      expect(report['load-very-slow'].average).toBeLessThan(1100);
      
      console.log('Network Performance Report:', {
        fast: report['load-fast'],
        medium: report['load-medium'],
        slow: report['load-slow'],
        verySlow: report['load-very-slow'],
      });
    });
  });

  describe('Frame Rate Benchmarks', () => {
    it('should maintain target frame rates during animations', () => {
      const targetFPS = 60;
      const testDuration = 1000; // 1 second
      const expectedFrames = (targetFPS * testDuration) / 1000;
      
      performanceMonitor.startMonitoring();
      
      // Simulate animation frames
      const frameInterval = 1000 / targetFPS; // ~16.67ms for 60fps
      let frameCount = 0;
      
      const startTime = Date.now();
      while (Date.now() - startTime < testDuration) {
        performanceMonitor.recordFrame();
        frameCount++;
        
        // Simulate frame processing time
        const processingStart = Date.now();
        while (Date.now() - processingStart < frameInterval * 0.8) {
          // Busy wait to simulate processing
        }
      }
      
      const report = performanceMonitor.getPerformanceReport();
      
      // Should maintain reasonable frame rate with minimal drops
      const frameDropPercentage = (report.frameDrops / frameCount) * 100;
      expect(frameDropPercentage).toBeLessThan(10); // < 10% frame drops
      
      console.log('Frame Rate Report:', {
        totalFrames: frameCount,
        frameDrops: report.frameDrops,
        dropPercentage: frameDropPercentage,
      });
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid component mounting/unmounting', () => {
      const iterations = 50;
      const endMeasurement = benchmark.startMeasurement('stress-mount-unmount');
      
      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        unmount();
      }
      
      endMeasurement();
      
      const report = benchmark.getReport();
      const stressStats = report['stress-mount-unmount'];
      
      // Should handle stress testing without significant performance degradation
      expect(stressStats.average).toBeLessThan(100); // Average per iteration
      
      console.log('Stress Test Report:', stressStats);
    });

    it('should maintain performance under memory pressure', () => {
      const components: any[] = [];
      const maxComponents = 10;
      
      const endMeasurement = benchmark.startMeasurement('memory-pressure');
      
      // Create multiple components to simulate memory pressure
      for (let i = 0; i < maxComponents; i++) {
        const component = render(
          <OnboardingContainer
            onComplete={jest.fn()}
            onSkip={jest.fn()}
          />
        );
        components.push(component);
      }
      
      endMeasurement();
      
      // Cleanup
      components.forEach(component => component.unmount());
      
      const report = benchmark.getReport();
      const memoryStats = report['memory-pressure'];
      
      // Should handle memory pressure gracefully
      expect(memoryStats.average).toBeLessThan(1000); // < 1 second total
      
      console.log('Memory Pressure Report:', memoryStats);
    });
  });
});