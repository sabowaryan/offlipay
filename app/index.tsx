import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { OnboardingService } from '@/services/OnboardingService';
import { useThemeColors } from '@/hooks/useThemeColors';
import Logo from '@/components/Logo';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';

export default function IndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { colors } = useThemeColors();

  useEffect(() => {
    // Use InteractionManager to defer heavy operations until after render
    const task = InteractionManager.runAfterInteractions(() => {
      checkInitialFlow();
    });
    
    return () => task.cancel();
  }, []);

  const checkInitialFlow = async () => {
    try {
      // FOR TESTING: Reset onboarding state to always show it
      // await OnboardingService.resetOnboardingStateForTesting();

      // Batch async operations to reduce sequential delays
      const [hasSeenOnboarding, user] = await Promise.allSettled([
        OnboardingService.hasSeenOnboarding(),
        WalletService.loadCurrentUser()
      ]);
      
      // Handle onboarding check
      if (hasSeenOnboarding.status === 'fulfilled' && !hasSeenOnboarding.value) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }
      
      // Handle auth check
      if (user.status === 'fulfilled' && user.value) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error during initial app flow check:', error);
      router.replace('/auth');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const user = await WalletService.loadCurrentUser();
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/auth');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOnboardingComplete = () => {
    // When onboarding is completed, proceed to auth flow
    setShowOnboarding(false);
    checkAuthStatus();
  };
  
  const handleOnboardingSkip = () => {
    // When onboarding is skipped, proceed to auth flow
    setShowOnboarding(false);
    checkAuthStatus();
  };

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <OnboardingContainer
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Otherwise show loading screen
  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Logo size={120} style={styles.logo} />
     
      <Text style={[styles.subtitle, { color: colors.TEXT }]}>Offline Payment System</Text>
      {loading && (
        <ActivityIndicator 
          size="large" 
          color={colors.PRIMARY} 
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  loader: {
    marginTop: 20,
  },
});

