# Exemples d'Usage - Onboarding Premium OffliPay

## Exemples de Configuration

### Configuration Minimale

```typescript
import { PremiumOnboardingConfig } from './types/PremiumOnboardingConfig';

const minimalConfig: PremiumOnboardingConfig = {
  screens: [
    {
      id: 'welcome',
      title: 'Bienvenue',
      slides: [
        {
          id: 'intro',
          illustration: 'welcome_intro',
          title: 'Bienvenue dans OffliPay',
          subtitle: 'Votre nouvelle application de paiement',
          animationType: 'fadeIn',
          duration: 3000,
        }
      ],
      transitionType: 'fade',
    }
  ],
  transitions: {
    screenTransitionDuration: 300,
    slideTransitionDuration: 250,
    easing: 'easeInOut',
    parallaxIntensity: 0.3,
  },
  gestures: {
    horizontalThreshold: 50,
    verticalThreshold: 30,
    velocityThreshold: 500,
    simultaneousGestures: false,
  },
  performance: {
    lazyLoadingEnabled: true,
    adaptiveAnimationsEnabled: true,
    memoryMonitoringEnabled: false,
  },
  accessibility: {
    screenReaderSupport: true,
    reduceMotionSupport: true,
    audioDescriptionsEnabled: false,
  },
};
```

### Configuration Complète

```typescript
const fullConfig: PremiumOnboardingConfig = {
  screens: [
    {
      id: 'welcome',
      title: 'Bienvenue',
      slides: [
        {
          id: 'intro',
          illustration: 'welcome_intro',
          title: 'Bienvenue dans l\'avenir des paiements',
          subtitle: 'Découvrez une nouvelle façon de payer',
          animationType: 'fadeIn',
          duration: 4000,
          interactionHint: 'Appuyez pour continuer',
        },
        {
          id: 'features',
          illustration: 'welcome_features',
          title: 'Paiements, portefeuille, et bien plus',
          subtitle: 'Toutes vos transactions en un seul endroit',
          animationType: 'slideUp',
          duration: 4000,
        },
        {
          id: 'promise',
          illustration: 'welcome_promise',
          title: 'Sécurisé, simple, toujours disponible',
          subtitle: 'Votre confiance est notre priorité',
          animationType: 'scale',
          duration: 4000,
        }
      ],
      transitionType: 'slide',
      backgroundColor: '#F8F9FA',
      backgroundGradient: {
        colors: ['#667eea', '#764ba2'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      duration: 12000,
    },
    {
      id: 'payments',
      title: 'Paiements QR',
      slides: [
        {
          id: 'scan',
          illustration: 'qr_scan_demo',
          title: 'Scannez pour payer',
          subtitle: 'Pointez votre caméra vers un QR code',
          animationType: 'morphing',
          duration: 4000,
        },
        {
          id: 'generate',
          illustration: 'qr_generate_demo',
          title: 'Générez votre QR',
          subtitle: 'Recevez des paiements instantanément',
          animationType: 'parallax',
          duration: 4000,
        },
        {
          id: 'success',
          illustration: 'payment_success',
          title: 'Paiement réussi !',
          subtitle: 'Transaction sécurisée et confirmée',
          animationType: 'fadeIn',
          duration: 3000,
        }
      ],
      transitionType: 'cube',
      backgroundColor: '#E3F2FD',
    },
    // ... autres écrans
  ],
  transitions: {
    screenTransitionDuration: 400,
    slideTransitionDuration: 300,
    easing: 'spring',
    parallaxIntensity: 0.7,
  },
  gestures: {
    horizontalThreshold: 40,
    verticalThreshold: 25,
    velocityThreshold: 400,
    simultaneousGestures: true,
  },
  performance: {
    lazyLoadingEnabled: true,
    adaptiveAnimationsEnabled: true,
    memoryMonitoringEnabled: true,
  },
  accessibility: {
    screenReaderSupport: true,
    reduceMotionSupport: true,
    audioDescriptionsEnabled: true,
  },
  responsive: {
    breakpoints: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1024, height: 768 },
    },
    adaptations: {
      illustrationSize: (screenSize) => Math.min(screenSize.width, screenSize.height) * 0.6,
      animationComplexity: (deviceCapability) => deviceCapability.deviceTier,
      gestureThresholds: (screenSize) => ({
        horizontalThreshold: screenSize.width * 0.1,
        verticalThreshold: screenSize.height * 0.05,
        velocityThreshold: 500,
        simultaneousGestures: true,
      }),
    },
  },
};
```

## Exemples d'Illustrations Personnalisées

### Illustration avec Glassmorphism

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  useSharedValue,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface GlassmorphismIllustrationProps {
  theme: 'light' | 'dark';
  animationProgress: Animated.SharedValue<number>;
}

const GlassmorphismIllustration: React.FC<GlassmorphismIllustrationProps> = ({
  theme,
  animationProgress,
}) => {
  const floatingAnimation = useSharedValue(0);

  React.useEffect(() => {
    floatingAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(animationProgress.value),
    transform: [
      { scale: withTiming(0.8 + animationProgress.value * 0.2) },
      { 
        translateY: interpolate(
          floatingAnimation.value,
          [0, 1],
          [0, -10]
        )
      }
    ],
  }));

  const glassStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        rotateY: `${interpolate(
          animationProgress.value,
          [0, 1],
          [0, 360]
        )}deg`
      }
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.glassContainer, glassStyle]}>
        <BlurView intensity={20} style={styles.blurView}>
          <View style={[
            styles.glassCard,
            { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
          ]}>
            {/* Contenu de la carte glassmorphism */}
          </View>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContainer: {
    width: 200,
    height: 300,
  },
  blurView: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 20,
  },
});

export default GlassmorphismIllustration;
```

### Illustration avec Particules

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleIllustrationProps {
  theme: 'light' | 'dark';
  animationProgress: Animated.SharedValue<number>;
}

const Particle: React.FC<{ delay: number; theme: 'light' | 'dark' }> = ({ delay, theme }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      translateX.value = withDelay(
        delay,
        withRepeat(
          withTiming(Math.random() * 100 - 50, { duration: 3000 }),
          -1,
          true
        )
      );
      translateY.value = withDelay(
        delay,
        withRepeat(
          withTiming(Math.random() * 100 - 50, { duration: 2500 }),
          -1,
          true
        )
      );
      opacity.value = withDelay(
        delay,
        withRepeat(
          withTiming(0.8, { duration: 2000 }),
          -1,
          true
        )
      );
      scale.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration: 1500 }),
          -1,
          true
        )
      );
    };

    startAnimation();
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
        },
        animatedStyle,
      ]}
    />
  );
};

const ParticleIllustration: React.FC<ParticleIllustrationProps> = ({
  theme,
  animationProgress,
}) => {
  const containerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(animationProgress.value),
  }));

  const particles = Array.from({ length: 20 }, (_, index) => (
    <Particle key={index} delay={index * 100} theme={theme} />
  ));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {particles}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default ParticleIllustration;
```

## Exemples de Gestion d'État

### Hook Personnalisé pour l'Onboarding

```typescript
import { useState, useCallback, useEffect } from 'react';
import { OnboardingService } from '@/services/OnboardingService';

interface UseOnboardingState {
  currentScreen: number;
  currentSlide: number;
  isCompleted: boolean;
  isSkipped: boolean;
  progress: number;
}

export const useOnboarding = (totalScreens: number) => {
  const [state, setState] = useState<UseOnboardingState>({
    currentScreen: 0,
    currentSlide: 0,
    isCompleted: false,
    isSkipped: false,
    progress: 0,
  });

  const updateProgress = useCallback((screen: number, slide: number) => {
    const totalProgress = (screen + slide / 3) / totalScreens; // Assuming 3 slides per screen
    setState(prev => ({
      ...prev,
      currentScreen: screen,
      currentSlide: slide,
      progress: totalProgress,
    }));
  }, [totalScreens]);

  const markCompleted = useCallback(async () => {
    await OnboardingService.markOnboardingCompleted();
    setState(prev => ({ ...prev, isCompleted: true }));
  }, []);

  const markSkipped = useCallback(async () => {
    await OnboardingService.markOnboardingSkipped();
    setState(prev => ({ ...prev, isSkipped: true }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentScreen: 0,
      currentSlide: 0,
      isCompleted: false,
      isSkipped: false,
      progress: 0,
    });
  }, []);

  // Restore state on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = await OnboardingService.getOnboardingState();
        if (savedState) {
          setState(prev => ({
            ...prev,
            currentScreen: savedState.currentScreen,
            currentSlide: savedState.currentSlide || 0,
          }));
        }
      } catch (error) {
        console.warn('Failed to restore onboarding state:', error);
      }
    };

    restoreState();
  }, []);

  return {
    state,
    updateProgress,
    markCompleted,
    markSkipped,
    reset,
  };
};
```

### Contexte d'Onboarding

```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { PremiumOnboardingConfig } from './types/PremiumOnboardingConfig';

interface OnboardingContextType {
  config: PremiumOnboardingConfig;
  currentScreen: number;
  currentSlide: number;
  navigateToScreen: (screen: number) => void;
  navigateToSlide: (slide: number) => void;
  isAnimating: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
  config: PremiumOnboardingConfig;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  config,
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigateToScreen = useCallback((screen: number) => {
    if (screen >= 0 && screen < config.screens.length && !isAnimating) {
      setCurrentScreen(screen);
      setCurrentSlide(0);
    }
  }, [config.screens.length, isAnimating]);

  const navigateToSlide = useCallback((slide: number) => {
    const currentScreenConfig = config.screens[currentScreen];
    if (slide >= 0 && slide < currentScreenConfig.slides.length && !isAnimating) {
      setCurrentSlide(slide);
    }
  }, [config.screens, currentScreen, isAnimating]);

  const value = {
    config,
    currentScreen,
    currentSlide,
    navigateToScreen,
    navigateToSlide,
    isAnimating,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
```

## Exemples de Tests

### Test d'Illustration

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';
import WelcomeIntro from '../illustrations/welcome/WelcomeIntro';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
}));

describe('WelcomeIntro', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <WelcomeIntro theme="light" animationProgress={useSharedValue(1)} />
    );
    
    expect(getByText('Bienvenue dans l\'avenir des paiements')).toBeTruthy();
  });

  it('adapts to dark theme', () => {
    const { getByTestId } = render(
      <WelcomeIntro theme="dark" animationProgress={useSharedValue(1)} />
    );
    
    const container = getByTestId('welcome-intro-container');
    expect(container.props.style).toMatchObject({
      backgroundColor: expect.stringMatching(/dark/),
    });
  });
});
```

### Test de Navigation

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingContainer from '../OnboardingContainer';

const mockConfig = {
  screens: [
    {
      id: 'screen1',
      title: 'Screen 1',
      slides: [
        { id: 'slide1', title: 'Slide 1', /* ... */ },
        { id: 'slide2', title: 'Slide 2', /* ... */ },
      ],
      transitionType: 'slide',
    },
    {
      id: 'screen2',
      title: 'Screen 2',
      slides: [
        { id: 'slide3', title: 'Slide 3', /* ... */ },
      ],
      transitionType: 'fade',
    },
  ],
  // ... rest of config
};

describe('OnboardingContainer Navigation', () => {
  it('navigates to next slide on tap', () => {
    const { getByTestId } = render(
      <OnboardingContainer 
        config={mockConfig}
        onComplete={jest.fn()} 
        onSkip={jest.fn()} 
      />
    );
    
    const slideCarousel = getByTestId('slide-carousel');
    fireEvent.press(slideCarousel);
    
    // Assert that we moved to the next slide
    expect(getByTestId('current-slide-indicator')).toHaveTextContent('2');
  });

  it('navigates to next screen after last slide', () => {
    const { getByTestId } = render(
      <OnboardingContainer 
        config={mockConfig}
        onComplete={jest.fn()} 
        onSkip={jest.fn()} 
      />
    );
    
    // Navigate to last slide of first screen
    const slideCarousel = getByTestId('slide-carousel');
    fireEvent.press(slideCarousel); // slide 2
    fireEvent.press(slideCarousel); // should go to next screen
    
    expect(getByTestId('current-screen-indicator')).toHaveTextContent('2');
  });
});
```

Ces exemples montrent comment utiliser et personnaliser le système d'onboarding premium pour répondre à différents besoins et cas d'usage.

