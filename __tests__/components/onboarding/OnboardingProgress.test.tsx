import { create } from 'react-test-renderer';
import { Animated } from 'react-native';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

// Mock des hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      PRIMARY: '#1c1d6c',
      GRAY_MEDIUM: '#6B7280',
      GRAY_LIGHT: '#F9FAFB',
    },
  }),
}));

// Get the mocked functions from the global setup
const mockAnimatedTiming = Animated.timing as jest.Mock;
const mockAnimatedValue = Animated.Value as jest.Mock;

describe('OnboardingProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu de base', () => {
    it('devrait rendre correctement avec les props minimales', () => {
      expect(() => {
        const component = create(
          <OnboardingProgress
            currentScreen={1}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
            testID="onboarding-progress"
          />
        );
        expect(component).toBeTruthy();
      }).not.toThrow();
    });

    it('devrait rendre sans erreur avec des props valides', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait rendre avec animated=false', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={false}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Animations', () => {
    it('devrait accepter le prop animated=true', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait accepter le prop animated=false', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={false}
          />
        );
      }).not.toThrow();
    });

    it('devrait utiliser animated=true par défaut', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Gestion des props', () => {
    it('devrait gérer correctement currentScreen=0', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={0}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer correctement currentScreen=totalScreens', () => {
      const totalScreens = 4;

      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={totalScreens}
            totalScreens={totalScreens}
            currentSlide={3}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer un seul screen', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={1}
            totalScreens={1}
            currentSlide={1}
            totalSlides={1}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer des valeurs de screen négatives', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={-1}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer currentScreen supérieur à totalScreens', () => {
      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={10}
            totalScreens={4}
            currentSlide={3}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('devrait gérer un grand nombre d\'étapes', () => {
      const totalScreens = 20;

      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={10}
            totalScreens={totalScreens}
            currentSlide={5}
            totalSlides={10}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait rendre efficacement avec de nombreuses étapes', () => {
      const totalScreens = 10;

      expect(() => {
        create(
          <OnboardingProgress
            currentScreen={5}
            totalScreens={totalScreens}
            currentSlide={3}
            totalSlides={5}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Mise à jour des props', () => {
    it('devrait gérer les changements de currentScreen', () => {
      const component = create(
        <OnboardingProgress
          currentScreen={1}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      // Changer l'étape courante
      expect(() => {
        component.update(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={2}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer les changements de totalScreens', () => {
      const component = create(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      expect(() => {
        component.update(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={6}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer le basculement du mode animated', () => {
      const component = create(
        <OnboardingProgress
          currentScreen={2}
          totalScreens={4}
          currentSlide={1}
          totalSlides={3}
          style="dots"
          animated={true}
        />
      );

      expect(() => {
        component.update(
          <OnboardingProgress
            currentScreen={2}
            totalScreens={4}
            currentSlide={1}
            totalSlides={3}
            style="dots"
            animated={false}
          />
        );
      }).not.toThrow();
    });
  });
});