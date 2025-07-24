import { Dimensions } from 'react-native';

export interface SlideConfig {
  id: string;
  illustration: string; // Will be mapped to a React Component
  title: string;
  subtitle: string;
  animationType: 'fadeIn' | 'slideUp' | 'scale' | 'morphing' | 'parallax';
  duration: number; // Duration for auto-progress
  interactionHint?: string;
}

export interface GradientConfig {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface PremiumScreenConfig {
  id: string;
  title: string;
  slides: SlideConfig[];
  transitionType: 'slide' | 'fade' | 'scale' | 'flip' | 'cube';
  backgroundColor?: string;
  backgroundGradient?: GradientConfig;
  duration?: number; // Duration for auto-progress of the screen
}

export interface TransitionConfig {
  screenTransitionDuration: number;
  slideTransitionDuration: number;
  easing: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
  parallaxIntensity: number;
}

export interface GestureConfig {
  horizontalThreshold: number;
  verticalThreshold: number;
  velocityThreshold: number;
  simultaneousGestures: boolean;
}

export interface PerformanceConfig {
  lazyLoadingEnabled: boolean;
  adaptiveAnimationsEnabled: boolean;
  memoryMonitoringEnabled: boolean;
}

export interface AccessibilityConfig {
  screenReaderSupport: boolean;
  reduceMotionSupport: boolean;
  audioDescriptionsEnabled: boolean;
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: { width: number; height: number };
    tablet: { width: number; height: number };
    desktop: { width: number; height: number };
  };
  adaptations: {
    illustrationSize: (screenSize: Dimensions) => number;
    animationComplexity: (deviceCapability: any) => 'low' | 'medium' | 'high';
    gestureThresholds: (screenSize: Dimensions) => GestureConfig;
  };
}

export interface PremiumOnboardingConfig {
  screens: PremiumScreenConfig[];
  transitions: TransitionConfig;
  gestures: GestureConfig;
  performance: PerformanceConfig;
  accessibility: AccessibilityConfig;
  responsive: ResponsiveConfig;
}

export enum PremiumOnboardingErrorCode {
  SLIDE_LOAD_FAILED = 'SLIDE_001',
  GESTURE_CONFLICT = 'GESTURE_001',
  ANIMATION_PERFORMANCE = 'ANIM_002',
  ILLUSTRATION_RENDER = 'ILLUS_001',
  MEMORY_LIMIT = 'MEM_001',
}


