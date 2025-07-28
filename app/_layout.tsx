import { useEffect } from 'react';
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
import * as SplashScreen from 'expo-splash-screen';
import { StorageService } from '@/utils/storage';
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
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  useFrameworkReady();

  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // Initialize database asynchronously without blocking render
    const initDB = async () => {
      try {
        await StorageService.initializeDatabase();
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };
    
    // Use InteractionManager to defer heavy operations
    const task = InteractionManager.runAfterInteractions(initDB);
    return () => task.cancel();
  }, []);

  // Show loading state immediately instead of null
  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        {/* Minimal loading indicator */}
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