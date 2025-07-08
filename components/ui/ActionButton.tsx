import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function ActionButton({
  title,
  onPress,
  icon: Icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
}: ActionButtonProps) {
  const { colors: COLORS } = useThemeColors();

  const getVariantColors = (): [string, string] => {
    switch (variant) {
      case 'secondary':
        return [COLORS.GRAY_MEDIUM, COLORS.GRAY_LIGHT];
      case 'success':
        return [COLORS.SUCCESS, COLORS.SUCCESS + 'DD'];
      case 'error':
        return [COLORS.ERROR, COLORS.ERROR + 'DD'];
      default:
        return [COLORS.PRIMARY, COLORS.PRIMARY + 'DD'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 12, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 20, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 16, paddingHorizontal: 24 };
    }
  };

  const [bgColor, bgColor2] = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: disabled ? COLORS.GRAY_LIGHT : bgColor },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.content, sizeStyles]}>
        {loading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.WHITE} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Chargement...</Text>
          </>
        ) : (
          <>
            {Icon && (
              <View style={{ marginRight: 8 }}>
                <Icon size={20} color={COLORS.WHITE} />
              </View>
            )}
            <Text style={styles.buttonText}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    ...TYPO.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 