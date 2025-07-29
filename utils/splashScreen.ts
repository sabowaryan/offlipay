import * as SplashScreen from 'expo-splash-screen';

/**
 * Safely prevent auto-hide of splash screen
 * Handles cases where splash screen methods might not be available
 */
export async function preventAutoHideAsync(): Promise<void> {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (error) {
    // Silently handle cases where splash screen is not available
    // This prevents the "internalPreventAutoHideAsync is not a function" warning
    console.warn('Could not prevent splash screen auto-hide:', error);
  }
}

/**
 * Safely hide splash screen
 * Handles cases where splash screen methods might not be available
 */
export async function hideAsync(): Promise<void> {
  try {
    await SplashScreen.hideAsync();
  } catch (error) {
    // Silently handle cases where splash screen is not available
    // This prevents the "internalMaybeHideAsync is not a function" warning
    console.warn('Could not hide splash screen:', error);
  }
}

/**
 * Check if splash screen is available
 */
export function isAvailable(): boolean {
  try {
    return typeof SplashScreen.preventAutoHideAsync === 'function' &&
           typeof SplashScreen.hideAsync === 'function';
  } catch {
    return false;
  }
}