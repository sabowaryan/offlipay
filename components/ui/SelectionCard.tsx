import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface SelectionCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  title: string;
  subtitle?: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
}

export default function SelectionCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  description,
  selected = false,
  onPress,
  disabled = false,
  showChevron = true,
  style,
}: SelectionCardProps) {
  const { colors: COLORS } = useThemeColors();
  const defaultIconColor = iconColor || COLORS.PRIMARY;
  const backgroundColor = selected ? COLORS.PRIMARY + '15' : COLORS.CARD;
  const borderColor = selected ? COLORS.PRIMARY : COLORS.GRAY_LIGHT;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor, borderColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={title}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: defaultIconColor + '15' }]}> 
          <Icon size={24} color={defaultIconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: COLORS.TEXT }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}>{subtitle}</Text>
          )}
          {description && (
            <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]}>{description}</Text>
          )}
        </View>
        {showChevron && (
          <ChevronRight size={20} color={COLORS.GRAY_MEDIUM} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TYPO.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    ...TYPO.caption,
    marginBottom: 2,
  },
  description: {
    ...TYPO.caption,
    fontStyle: 'italic',
  },
}); 