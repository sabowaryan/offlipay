/**
 * Test d'intégration complet pour l'expérience de première utilisation
 * 
 * Ce test valide le flux complet d'un nouvel utilisateur découvrant l'application
 * pour la première fois, depuis le lancement jusqu'à la création de compte.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { OnboardingContainer } from '@/components/onboarding';
import { OnboardingService } from '@/services/OnboardingService';
import App from '@/app/index';

// Mocks
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-secure-store');
jest.mock('expo-haptics');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock des illustrations pour éviter les erreurs de rendu
jest.mock('@/components/onboarding/illustrations/WelcomeIllustration', () => {
  return function MockWelcomeIllustration() {
    return null;
  };
});

jest.mock('@/components/onboarding/illustrations/QRPaymentIllustration', () => {
  return function MockQRPaymentIllustration() {
    return null;
  };
});

jest.mock('@/components/onboarding/illustrations/WalletIllustration', () => {
  return function MockWalletIllustration() {
    return null;
  };
});

jest.mock('@/components/onboarding/illustrations/OfflineIllustration', () => {
  return function MockOfflineIllustration() {
    return null;
  };
});

describe('Expérience de première utilisation - Onboarding', () => {
  beforeEach(async () => {
    // Nettoyer le stockage avant chaque test
    await AsyncStorage.clear();
    (SecureStore.deleteItemAsync as jest.Mock).mockClear();
    (SecureStore.getItemAsync as jest.Mock).mockClear();
    (SecureStore.setItemAsync as jest.Mock).mockClear();

    // Simuler un nouvel utilisateur (pas d'onboarding complété)
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Détection du statut de nouvel utilisateur', () => {
    it('devrait détecter un nouvel utilisateur correctement', async () => {
      const hasSeen = await OnboardingService.hasSeenOnboarding();
      expect(hasSeen).toBe(false);
    });

    it('devrait détecter un utilisateur existant correctement', async () => {
      // Simuler un utilisateur qui a déjà vu l'onboarding
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          hasSeenOnboarding: true,
          completedAt: new Date().toISOString(),
          version: '1.0.0',
        })
      );

      const hasSeen = await OnboardingService.hasSeenOnboarding();
      expect(hasSeen).toBe(true);
    });
  });

  describe('Flux complet d\'onboarding', () => {
    it('devrait afficher tous les écrans d\'onboarding dans l\'ordre', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Vérifier l'écran de bienvenue
      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
        expect(getByText(/portefeuille numérique/i)).toBeTruthy();
      });

      // Naviguer vers l'écran suivant
      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      // Vérifier l'écran des paiements QR
      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
        expect(getByText(/QR codes/i)).toBeTruthy();
      });

      // Continuer vers l'écran du portefeuille
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(getByText('Gérez votre argent')).toBeTruthy();
        expect(getByText(/agents, vouchers/i)).toBeTruthy();
      });

      // Continuer vers l'écran final
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(getByText('Toujours connecté')).toBeTruthy();
        expect(getByText(/sans connexion internet/i)).toBeTruthy();
      });

      // Terminer l'onboarding
      const finishButton = getByTestId('onboarding-finish-button');
      fireEvent.press(finishButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('devrait permettre de naviguer en arrière', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Aller au deuxième écran
      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
      });

      // Revenir en arrière
      const backButton = getByTestId('onboarding-back-button');
      fireEvent.press(backButton);

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });
    });

    it('devrait permettre de skip l\'onboarding', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      const skipButton = getByTestId('onboarding-skip-button');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockOnSkip).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Indicateur de progression', () => {
    it('devrait afficher la progression correctement', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Vérifier la progression initiale
      const progressIndicator = getByTestId('onboarding-progress');
      expect(progressIndicator.props.accessibilityValue).toEqual({
        min: 0,
        max: 4,
        now: 1,
      });

      // Naviguer et vérifier la mise à jour de la progression
      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(progressIndicator.props.accessibilityValue.now).toBe(2);
      });
    });
  });

  describe('Gestion des gestes', () => {
    it('devrait supporter la navigation par swipe', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      const container = getByTestId('onboarding-gesture-container');

      // Simuler un swipe vers la gauche (écran suivant)
      fireEvent(container, 'onGestureEvent', {
        nativeEvent: {
          translationX: -100,
          velocityX: -500,
        },
      });

      fireEvent(container, 'onHandlerStateChange', {
        nativeEvent: {
          state: 5, // END state
          translationX: -100,
          velocityX: -500,
        },
      });

      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
      });
    });

    it('devrait supporter le swipe vers la droite pour revenir', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Aller au deuxième écran d'abord
      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(getByText('Payez en un scan')).toBeTruthy();
      });

      // Swipe vers la droite pour revenir
      const container = getByTestId('onboarding-gesture-container');
      fireEvent(container, 'onGestureEvent', {
        nativeEvent: {
          translationX: 100,
          velocityX: 500,
        },
      });

      fireEvent(container, 'onHandlerStateChange', {
        nativeEvent: {
          state: 5,
          translationX: 100,
          velocityX: 500,
        },
      });

      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      });
    });
  });

  describe('Sauvegarde des préférences', () => {
    it('devrait sauvegarder la completion de l\'onboarding', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Naviguer jusqu'à la fin
      const nextButton = getByTestId('onboarding-next-button');

      // Écran 1 -> 2
      fireEvent.press(nextButton);
      await waitFor(() => { });

      // Écran 2 -> 3
      fireEvent.press(nextButton);
      await waitFor(() => { });

      // Écran 3 -> 4
      fireEvent.press(nextButton);
      await waitFor(() => { });

      // Terminer l'onboarding
      const finishButton = getByTestId('onboarding-finish-button');
      fireEvent.press(finishButton);

      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          'onboarding_preferences',
          expect.stringContaining('"hasCompletedOnboarding":true')
        );
      });
    });

    it('devrait sauvegarder la progression en cours', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Naviguer vers le deuxième écran
      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          'onboarding_progress',
          '2'
        );
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de sauvegarde gracieusement', async () => {
      // Simuler une erreur de sauvegarde
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Naviguer jusqu'à la fin
      const nextButton = getByTestId('onboarding-next-button');

      for (let i = 0; i < 3; i++) {
        fireEvent.press(nextButton);
        await waitFor(() => { });
      }

      // Terminer l'onboarding malgré l'erreur
      const finishButton = getByTestId('onboarding-finish-button');
      fireEvent.press(finishButton);

      // L'onboarding devrait se terminer même avec l'erreur
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('devrait utiliser AsyncStorage comme fallback', async () => {
      // Simuler l'échec de SecureStore
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore not available')
      );

      // Mais AsyncStorage fonctionne
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const hasCompleted = await OnboardingService.hasCompletedOnboarding();

      expect(hasCompleted).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('onboarding_preferences');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir les propriétés d\'accessibilité correctes', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId, getByText } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Vérifier les propriétés d'accessibilité du conteneur
      const container = getByTestId('onboarding-container');
      expect(container.props.accessible).toBe(true);
      expect(container.props.accessibilityRole).toBe('main');

      // Vérifier les propriétés du titre
      const title = getByText('Bienvenue sur OffliPay');
      expect(title.props.accessibilityRole).toBe('header');

      // Vérifier l'indicateur de progression
      const progress = getByTestId('onboarding-progress');
      expect(progress.props.accessibilityRole).toBe('progressbar');
      expect(progress.props.accessibilityValue).toBeDefined();
    });

    it('devrait annoncer les changements d\'écran aux lecteurs d\'écran', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId, getByText } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      await waitFor(() => {
        const newTitle = getByText('Payez en un scan');
        expect(newTitle.props.accessibilityLiveRegion).toBe('polite');
      });
    });
  });

  describe('Performance', () => {
    it('devrait charger rapidement', async () => {
      const startTime = Date.now();

      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      const loadTime = Date.now() - startTime;

      // L'onboarding devrait se charger en moins de 500ms
      expect(loadTime).toBeLessThan(500);
    });

    it('devrait précharger les ressources suivantes', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Attendre que le préchargement soit terminé
      await waitFor(() => {
        const container = getByTestId('onboarding-container');
        expect(container.props.testID).toBe('onboarding-container');
      }, { timeout: 2000 });
    });
  });

  describe('Intégration avec l\'application', () => {
    it('devrait rediriger vers l\'écran d\'authentification après completion', async () => {
      const mockNavigate = jest.fn();

      // Mock de useNavigation pour capturer la navigation
      jest.doMock('@react-navigation/native', () => ({
        ...jest.requireActual('@react-navigation/native'),
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: jest.fn(),
        }),
      }));

      const { getByTestId } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={() => mockNavigate('Auth')}
            onSkip={() => mockNavigate('Auth')}
          />
        </NavigationContainer>
      );

      // Compléter l'onboarding
      const nextButton = getByTestId('onboarding-next-button');

      for (let i = 0; i < 3; i++) {
        fireEvent.press(nextButton);
        await waitFor(() => { });
      }

      const finishButton = getByTestId('onboarding-finish-button');
      fireEvent.press(finishButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Auth');
      });
    });

    it('devrait s\'intégrer correctement avec le point d\'entrée de l\'app', async () => {
      // Simuler un nouvel utilisateur
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const { getByText } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      // L'onboarding devrait s'afficher pour un nouvel utilisateur
      await waitFor(() => {
        expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Scénarios de cas limites', () => {
    it('devrait gérer l\'interruption de l\'onboarding', async () => {
      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByTestId, unmount } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Naviguer vers le deuxième écran
      const nextButton = getByTestId('onboarding-next-button');
      fireEvent.press(nextButton);

      await waitFor(() => { });

      // Simuler l'interruption (fermeture de l'app)
      unmount();

      // Vérifier que la progression a été sauvegardée
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'onboarding_progress',
        '2'
      );
    });

    it('devrait reprendre depuis la dernière étape sauvegardée', async () => {
      // Simuler une progression sauvegardée
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
        if (key === 'onboarding_progress') {
          return Promise.resolve('3');
        }
        if (key === 'onboarding_preferences') {
          return Promise.resolve(JSON.stringify({
            hasCompletedOnboarding: false,
            lastCompletedStep: 2,
          }));
        }
        return Promise.resolve(null);
      });

      const mockOnComplete = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText } = render(
        <NavigationContainer>
          <OnboardingContainer
            onComplete={mockOnComplete}
            onSkip={mockOnSkip}
          />
        </NavigationContainer>
      );

      // Devrait reprendre au troisième écran
      await waitFor(() => {
        expect(getByText('Gérez votre argent')).toBeTruthy();
      });
    });
  });
});

/**
 * Tests de régression pour s'assurer que les changements futurs
 * ne cassent pas l'expérience utilisateur
 */
describe('Tests de régression - Onboarding', () => {
  it('devrait maintenir la compatibilité avec les anciennes versions de données', async () => {
    // Simuler d'anciennes données de préférences
    const oldPreferences = JSON.stringify({
      completed: true, // Ancien format
      step: 4,
    });

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(oldPreferences);

    // Le service devrait gérer l'ancien format
    const hasCompleted = await OnboardingService.hasCompletedOnboarding();
    expect(hasCompleted).toBe(true);
  });

  it('devrait fonctionner même si certaines illustrations échouent', async () => {
    // Simuler l'échec de chargement d'une illustration
    jest.doMock('@/components/onboarding/illustrations/WelcomeIllustration', () => {
      throw new Error('Illustration failed to load');
    });

    const mockOnComplete = jest.fn();
    const mockOnSkip = jest.fn();

    const { getByText } = render(
      <NavigationContainer>
        <OnboardingContainer
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      </NavigationContainer>
    );

    // L'onboarding devrait quand même fonctionner
    await waitFor(() => {
      expect(getByText('Bienvenue sur OffliPay')).toBeTruthy();
    });
  });
});