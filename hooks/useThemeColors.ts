import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { LIGHT_COLORS, DARK_COLORS } from '@/utils/theme';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'offlipay_theme_mode';

// État global pour forcer les re-renders
let globalThemeListeners: (() => void)[] = [];
let globalManualTheme: ThemeMode = 'auto';
let isInitialized = false;

const notifyThemeChange = () => {
  globalThemeListeners.forEach(listener => listener());
};

export function useThemeColors() {
  const systemTheme = useColorScheme();
  const [, forceUpdate] = useState({});

  // Charger le thème sauvegardé au démarrage (une seule fois)
  useEffect(() => {
    if (!isInitialized) {
      loadSavedTheme();
    }
  }, []);

  // S'inscrire aux notifications de changement de thème
  useEffect(() => {
    const handleThemeChange = () => {
      forceUpdate({});
    };
    
    globalThemeListeners.push(handleThemeChange);
    return () => {
      const index = globalThemeListeners.indexOf(handleThemeChange);
      if (index > -1) {
        globalThemeListeners.splice(index, 1);
      }
    };
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        globalManualTheme = savedTheme as ThemeMode;
        notifyThemeChange();
      }
      isInitialized = true;
    } catch (error) {
      console.warn('Erreur lors du chargement du thème:', error);
      isInitialized = true;
    }
  };

  const setTheme = async (theme: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, theme);
      globalManualTheme = theme;
      notifyThemeChange();
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  // Déterminer le thème final avec fallback
  const finalTheme = globalManualTheme === 'auto' ? (systemTheme || 'light') : globalManualTheme;
  
  // Toujours retourner des couleurs valides, même pendant le chargement
  const colors = finalTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  
  // Retourner les couleurs et les fonctions de gestion
  return {
    colors: {
      ...colors,
      SHADOW: colors.SHADOW,
    },
    theme: finalTheme,
    manualTheme: globalManualTheme,
    setTheme,
    isLoading: !isInitialized,
    isAuto: globalManualTheme === 'auto',
    systemTheme,
  };
} 