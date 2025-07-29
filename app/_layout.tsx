import { useEffect, useState } from 'react';
import { View, InteractionManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { StorageService } from '@/utils/storage';
import * as SplashScreenUtil from '@/utils/splashScreen';
import * as Sentry from '@sentry/react-native';
import { QRScannerProvider } from '@/components/QRScannerProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Sentry.init({
  dsn: 'https://dc4cee654643a25ea8bbe4e063aa2883@o4509445026152448.ingest.us.sentry.io/4509623728013312',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Keep the splash screen visible while we load resources
SplashScreenUtil.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);

  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        await StorageService.initializeDatabase();
        
        // Wait for fonts to load
        if (loaded || error) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('App preparation failed:', e);
        setAppIsReady(true); // Continue anyway
      }
    }

    prepare();
  }, [loaded, error]);

  useEffect(() => {
    if (appIsReady) {
      // Hide splash screen once app is ready
      const hideSplash = () => {
        SplashScreenUtil.hideAsync();
      };
      
      // Use a small delay to ensure smooth transition
      const timer = setTimeout(hideSplash, 100);
      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

  // Show loading state while app is preparing
  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        {/* Minimal loading indicator - splash screen will be visible */}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QRScannerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QRScannerProvider>
    </SafeAreaProvider>
  );
});