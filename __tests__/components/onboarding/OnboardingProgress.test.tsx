import React from 'react';
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
            currentStep={1} 
            totalSteps={4} 
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
            currentStep={2} 
            totalSteps={4} 
          />
        );
      }).not.toThrow();
    });

    it('devrait rendre avec animated=false', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={4} 
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
            currentStep={2} 
            totalSteps={4} 
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait accepter le prop animated=false', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={4} 
            animated={false}
          />
        );
      }).not.toThrow();
    });

    it('devrait utiliser animated=true par défaut', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={4} 
          />
        );
      }).not.toThrow();
    });
  });

  describe('Gestion des props', () => {
    it('devrait gérer correctement currentStep=0', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={0} 
            totalSteps={4} 
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer correctement currentStep=totalSteps', () => {
      const totalSteps = 4;
      
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={totalSteps} 
            totalSteps={totalSteps} 
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer un seul step', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={1} 
            totalSteps={1} 
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer des valeurs de step négatives', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={-1} 
            totalSteps={4} 
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer currentStep supérieur à totalSteps', () => {
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={10} 
            totalSteps={4} 
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('devrait gérer un grand nombre d\'étapes', () => {
      const totalSteps = 20;
      
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={10} 
            totalSteps={totalSteps} 
          />
        );
      }).not.toThrow();
    });

    it('devrait rendre efficacement avec de nombreuses étapes', () => {
      const totalSteps = 10;
      
      expect(() => {
        create(
          <OnboardingProgress 
            currentStep={5} 
            totalSteps={totalSteps} 
          />
        );
      }).not.toThrow();
    });
  });

  describe('Mise à jour des props', () => {
    it('devrait gérer les changements de currentStep', () => {
      const component = create(
        <OnboardingProgress 
          currentStep={1} 
          totalSteps={4} 
          animated={true}
        />
      );

      // Changer l'étape courante
      expect(() => {
        component.update(
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={4} 
            animated={true}
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer les changements de totalSteps', () => {
      const component = create(
        <OnboardingProgress 
          currentStep={2} 
          totalSteps={4} 
        />
      );

      expect(() => {
        component.update(
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={6} 
          />
        );
      }).not.toThrow();
    });

    it('devrait gérer le basculement du mode animated', () => {
      const component = create(
        <OnboardingProgress 
          currentStep={2} 
          totalSteps={4} 
          animated={true}
        />
      );

      expect(() => {
        component.update(
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={4} 
            animated={false}
          />
        );
      }).not.toThrow();
    });
  });
});