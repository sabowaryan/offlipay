import { ComponentType } from 'react';

// Animation types are defined in types/index.ts
export type InteractionType = 'tap' | 'swipe' | 'none';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type ProgressIndicatorStyle = 'dots' | 'bar' | 'steps';
export type ThemeType = 'light' | 'dark' | 'auto';

// Slide configuration is defined as SlideConfig in types/index.ts

// Error codes for onboarding
export enum OnboardingErrorCode {
  ANIMATION_LOAD_FAILED = 'ANIM_001',
  STORAGE_SAVE_FAILED = 'STOR_001',
  PERFORMANCE_DEGRADED = 'PERF_001',
  NAVIGATION_ERROR = 'NAV_001',
}

// Screen configuration - now imported from service to avoid conflicts
// export interface OnboardingScreenConfig is now defined in services/OnboardingService.ts

// Global onboarding settings
export interface OnboardingSettings {
  screens: OnboardingScreenConfig[];
  theme: ThemeType;
  animationSpeed: AnimationSpeed;
  skipEnabled: boolean;
  progressIndicatorStyle: ProgressIndicatorStyle;
}

// Component Props Interfaces

// OnboardingContainer props
export interface OnboardingContainerProps {
  onComplete: () => void;
  onSkip: () => void;
}

// OnboardingContainer state
export interface OnboardingContainerState {
  currentScreen: number;
  totalScreens: number;
  isAnimating: boolean;
  hasSeenOnboarding: boolean;
  currentSlide?: number;
  completedAt?: Date;
  skippedAt?: Date;
  version: string;
}

// OnboardingScreen props
export interface OnboardingScreenProps {
  title: string;
  subtitle: string;
  illustration: ComponentType<IllustrationProps>;
  animationDelay?: number;
  onInteraction?: () => void;
  interactionHint?: string;
}

// OnboardingProgress props are defined in types/index.ts

// OnboardingButton props
export interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

// Service interfaces
export interface OnboardingPreferences {
  hasCompletedOnboarding: boolean;
  lastCompletedStep: number;
  theme: ThemeType;
  skipEnabled: boolean;
  completedAt?: Date;
}

// Animation and illustration interfaces
export interface IllustrationProps {
  animated?: boolean;
  theme: ThemeType;
  size?: number;
  onAnimationComplete?: () => void;
}

// Navigation and gesture interfaces
export interface OnboardingGestureConfig {
  swipeEnabled: boolean;
  tapToAdvance: boolean;
  swipeThreshold: number;
  animationDuration: number;
}

// Error handling
export interface OnboardingError {
  code: OnboardingErrorCode;
  message: string;
  recoverable: boolean;
  fallbackAction?: () => void;
}