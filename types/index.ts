export interface User {
  id: string;
  name: string;
  phone: string;
  walletId: string;
  pin: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  lastSyncAt?: Date;
}

export interface Transaction {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string;
  signature: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  type: 'sent' | 'received';
  qrData?: string;
  syncStatus: 'local' | 'synced' | 'pending_sync';
}

export interface QRPaymentData {
  amount: number;
  fromWalletId: string;
  toWalletId: string;
  description: string;
  timestamp: number;
  signature: string;
  nonce: string;
  publicKey: string; // Ajout de la clé publique pour la vérification
}

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
}

export type UserMode = 'buyer' | 'seller';

export interface SyncConfig {
  bluetoothEnabled: boolean;
  smsEnabled: boolean;
  wifiEnabled: boolean;
  autoSync: boolean;
  syncInterval: number;
}

// Types pour le système d'alimentation
export type CashInMethod = 'agent' | 'voucher' | 'banking';

export interface CashInTransaction {
  id: string;
  walletId: string;
  amount: number;
  method: CashInMethod;
  status: 'pending' | 'completed' | 'failed' | 'validated';
  timestamp: Date;
  expiresAt: Date;
  signature: string;
  agentId?: string;
  voucherCode?: string;
  bankAccountId?: string;
  fees: number;
  syncStatus: 'local' | 'synced' | 'pending_sync';
}

export interface Agent {
  id: string;
  name: string;
  location: string;
  phone: string;
  publicKey: string;
  isActive: boolean;
  maxAmount: number;
  dailyLimit: number;
  commission: number;
  createdAt: Date;
}

export interface Voucher {
  id: string;
  code: string;
  amount: number;
  currency: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  expiresAt: Date;
  signature: string;
  series: string;
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  walletId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isVerified: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  lastUsed: Date;
  createdAt: Date;
}

export interface CashInQRData {
  type: 'cash_in';
  amount: number;
  currency: string;
  agentId?: string;
  voucherId?: string;
  expiration: string;
  signature: string;
  publicKey: string;
  nonce: string;
}

// Types pour l'onboarding premium multi-slides
export type AnimationType = 'fadeIn' | 'slideUp' | 'scale' | 'morphing' | 'parallax' | 'custom';
export type TransitionType = 'slide' | 'fade' | 'scale' | 'flip' | 'cube';
export type EasingType = 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
export type ProgressStyle = 'dots' | 'bars' | 'circular' | 'minimal';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type GestureType = 'horizontal' | 'vertical';
export type DeviceCapability = 'low' | 'medium' | 'high';
export type AnimationLevel = 'minimal' | 'standard' | 'premium';

export interface SlideConfig {
  id: string;
  illustration: string; // Component name for dynamic import
  title: string;
  subtitle: string;
  animationType: AnimationType;
  duration: number;
  interactionHint?: string;
}

export interface PremiumScreenConfig {
  id: string;
  title: string;
  slides: SlideConfig[];
  transitionType: TransitionType;
  backgroundColor?: string;
  backgroundGradient?: GradientConfig;
}

export interface GradientConfig {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface TransitionConfig {
  screenTransitionDuration: number;
  slideTransitionDuration: number;
  easing: EasingType;
  parallaxIntensity: number;
}

export interface GestureConfig {
  horizontalThreshold: number;
  verticalThreshold: number;
  velocityThreshold: number;
  simultaneousGestures: boolean;
}

export interface PerformanceConfig {
  deviceCapability: DeviceCapability;
  animationLevel: AnimationLevel;
  enableLazyLoading: boolean;
  maxConcurrentAnimations: number;
  memoryThreshold: number;
}

export interface AccessibilityConfig {
  reduceMotion: boolean;
  enableAudioDescriptions: boolean;
  alternativeNavigation: boolean;
  highContrast: boolean;
}

export interface PremiumOnboardingConfig {
  screens: PremiumScreenConfig[];
  transitions: TransitionConfig;
  gestures: GestureConfig;
  performance: PerformanceConfig;
  accessibility: AccessibilityConfig;
}

export interface OnboardingSlideCarouselProps {
  slides: SlideConfig[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  autoProgress?: boolean;
  autoProgressDelay?: number;
  theme: 'light' | 'dark';
}

export interface OnboardingGestureHandlerProps {
  onHorizontalSwipe: (direction: SwipeDirection) => void;
  onVerticalSwipe: (direction: SwipeDirection) => void;
  onTap: () => void;
  enabled: boolean;
  children: React.ReactNode;
}

export interface OnboardingProgressProps {
  currentScreen: number;
  totalScreens: number;
  currentSlide: number;
  totalSlides: number;
  style: ProgressStyle;
  animated: boolean;
}

export interface GestureThresholds {
  horizontal: number;
  vertical: number;
  velocity: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: Dimensions;
    tablet: Dimensions;
    desktop: Dimensions;
  };
  adaptations: {
    illustrationSize: (screenSize: Dimensions) => number;
    animationComplexity: (deviceCapability: DeviceCapability) => AnimationLevel;
    gestureThresholds: (screenSize: Dimensions) => GestureThresholds;
  };
}

export interface IllustrationProps {
  theme: 'light' | 'dark';
  animated: boolean;
  size: number;
  onAnimationComplete?: () => void;
}

export interface OnboardingState {
  currentScreen: number;
  currentSlide: number;
  isCompleted: boolean;
  hasSeenBefore: boolean;
  lastPosition: {
    screen: number;
    slide: number;
  };
}

export enum PremiumOnboardingErrorCode {
  SLIDE_LOAD_FAILED = 'SLIDE_001',
  GESTURE_CONFLICT = 'GESTURE_001',
  ANIMATION_PERFORMANCE = 'ANIM_002',
  ILLUSTRATION_RENDER = 'ILLUS_001',
  MEMORY_LIMIT = 'MEM_001',
}