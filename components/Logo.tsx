import React from 'react';
import { Image, ImageStyle, useColorScheme } from 'react-native';
import { LOGOS } from '@/utils/logo';

interface LogoProps {
  compact?: boolean;
  size?: number;
  style?: ImageStyle;
}

export default function Logo({ compact = false, size = 64, style }: LogoProps) {
  const scheme = useColorScheme();
  const logo = compact
    ? (scheme === 'dark' ? LOGOS.compact_dark : LOGOS.compact_light)
    : (scheme === 'dark' ? LOGOS.dark : LOGOS.light);

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