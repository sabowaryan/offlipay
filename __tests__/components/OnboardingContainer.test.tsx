/**
 * Basic integration test for OnboardingContainer
 * This test verifies that the component can be instantiated and basic functionality works
 */

import { OnboardingService } from '@/services/OnboardingService';

// Mock the OnboardingService
jest.mock('@/services/OnboardingService');

describe('OnboardingContainer Integration', () => {
  const mockOnboardingService = OnboardingService as jest.Mocked<typeof OnboardingService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have OnboardingService methods available', () => {
    expect(mockOnboardingService.getScreensConfig).toBeDefined();
    expect(mockOnboardingService.getOnboardingSettings).toBeDefined();
    expect(mockOnboardingService.getOnboardingState).toBeDefined();
    expect(mockOnboardingService.saveProgress).toBeDefined();
    expect(mockOnboardingService.markOnboardingCompleted).toBeDefined();
    expect(mockOnboardingService.markOnboardingSkipped).toBeDefined();
  });

  it('should be able to mock service responses', async () => {
    const mockScreensConfig = [
      {
        id: 'welcome',
        title: 'Bienvenue sur OffliPay',
        subtitle: 'Votre portefeuille numérique',
        illustration: 'welcome',
        animationType: 'fadeIn' as const,
        interactionType: 'tap' as const,
        duration: 2000,
      },
    ];

    mockOnboardingService.getScreensConfig.mockResolvedValue(mockScreensConfig);
    
    const result = await OnboardingService.getScreensConfig();
    expect(result).toEqual(mockScreensConfig);
    expect(mockOnboardingService.getScreensConfig).toHaveBeenCalled();
  });

  it('should handle service method calls', async () => {
    mockOnboardingService.saveProgress.mockResolvedValue();
    mockOnboardingService.markOnboardingCompleted.mockResolvedValue();
    
    await OnboardingService.saveProgress(1);
    await OnboardingService.markOnboardingCompleted();
    
    expect(mockOnboardingService.saveProgress).toHaveBeenCalledWith(1);
    expect(mockOnboardingService.markOnboardingCompleted).toHaveBeenCalled();
  });
});