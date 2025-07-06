import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { LIGHT_COLORS, DARK_COLORS } from '@/utils/theme';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'offlipay_theme_mode';

export function useThemeColors() {
  const systemTheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setManualTheme(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (theme: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, theme);
      setManualTheme(theme);
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  // Déterminer le thème final avec fallback
  const finalTheme = manualTheme === 'auto' ? (systemTheme || 'light') : manualTheme;
  
  // Toujours retourner des couleurs valides, même pendant le chargement
  const colors = finalTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  
  // Retourner les couleurs et les fonctions de gestion
  return {
    colors,
    theme: finalTheme,
    manualTheme,
    setTheme,
    isLoading,
    isAuto: manualTheme === 'auto',
    systemTheme,
  };
} 