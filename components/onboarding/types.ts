import { ComponentType } from 'react';

// Animation types
export type AnimationType = 'fadeIn' | 'slideUp' | 'scale' | 'custom';
export type InteractionType = 'tap' | 'swipe' | 'none';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type ProgressIndicatorStyle = 'dots' | 'bar' | 'steps';
export type ThemeType = 'light' | 'dark' | 'auto';

// Error codes for onboarding
export enum OnboardingErrorCode {
  ANIMATION_LOAD_FAILED = 'ANIM_001',
  STORAGE_SAVE_FAILED = 'STOR_001',
  PERFORMANCE_DEGRADED = 'PERF_001',
  NAVIGATION_ERROR = 'NAV_001',
}

// Screen configuration
export interface OnboardingScreenConfig {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  animationType: AnimationType;
  interactionType?: InteractionType;
  duration: number;
}

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
export interface OnboardingState {
  currentScreen: number;
  totalScreens: number;
  isAnimating: boolean;
  hasSeenOnboarding: boolean;
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

// OnboardingProgress props
export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  animated?: boolean;
}

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