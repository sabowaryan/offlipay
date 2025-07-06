// Configuration des logos pour l'application
export const LOGO_CONFIG = {
  // Logo principal
  main: require('@/assets/images/logo.png'),
  // Logo pour fonds sombres
  white: require('@/assets/images/logo-white.png'),
  // Logo pour fonds clairs
  dark: require('@/assets/images/logo-dark.png'),
  // Logo compact pour headers
  compact: require('@/assets/images/logo-compact.png'),
  // Icône pour petits espaces
  icon: require('@/assets/images/logo-icon.png'),
};

// Tailles recommandées pour différents usages
export const LOGO_SIZES = {
  header: 32,
  compact: 48,
  medium: 64,
  large: 128,
  xlarge: 256,
};

// Fonction pour obtenir le bon logo selon le contexte
export const getLogo = (type: 'main' | 'white' | 'dark' | 'compact' | 'icon' = 'main') => {
  return LOGO_CONFIG[type];
};

// Fonction pour obtenir la taille recommandée selon l'usage
export const getLogoSize = (usage: keyof typeof LOGO_SIZES) => {
  return LOGO_SIZES[usage];
};

export const LOGOS = {
  // Logo principal (clair)
  light: require('@/assets/images/logo.png'),
  // Logo principal blanc (pour fond sombre)
  dark: require('@/assets/images/logo-white.png'),
  // Logo compact (clair)
  compact_light: require('@/assets/images/logo-compact.png'),
  // Logo compact blanc (pour fond sombre)
  compact_dark: require('@/assets/images/logo-compact-white.png'),
}; 