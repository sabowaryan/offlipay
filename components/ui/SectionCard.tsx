import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface SectionCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  title: string;
  children: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
}

export default function SectionCard({
  icon: Icon,
  iconColor,
  title,
  children,
  backgroundColor,
  borderColor,
  style,
}: SectionCardProps) {
  const { colors: COLORS } = useThemeColors();
  const defaultIconColor = iconColor || COLORS.PRIMARY;
  const defaultBackgroundColor = backgroundColor || COLORS.CARD;
  const defaultBorderColor = borderColor || COLORS.GRAY_LIGHT;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: defaultBackgroundColor, borderColor: defaultBorderColor },
        style,
      ]}
      accessible
      accessibilityRole="summary"
    >
      <View style={styles.header}>
        <Icon size={20} color={defaultIconColor} />
        <Text style={[styles.title, { color: COLORS.TEXT }]}>{title}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...TYPO.h3,
    marginLeft: 12,
    flex: 1,
  },
  content: {
    // marges internes gérées par les enfants
  },
}); 