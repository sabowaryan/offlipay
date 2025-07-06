import React from 'react';
import { Image, ImageStyle } from 'react-native';
import { LOGOS } from '@/utils/logo';
import { useThemeColors } from '@/hooks/useThemeColors';

interface LogoProps {
  compact?: boolean;
  size?: number;
  style?: ImageStyle;
}

export default function Logo({ compact = false, size = 64, style }: LogoProps) {
  const { theme } = useThemeColors();
  const logo = compact
    ? (theme === 'dark' ? LOGOS.compact_dark : LOGOS.compact_light)
    : (theme === 'dark' ? LOGOS.dark : LOGOS.light);

  return (
    <Image
      source={logo}
      style={[
        {
          width: size,
          height: size,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
} 