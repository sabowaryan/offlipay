import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LucideIcon, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
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

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={disabled ? [COLORS.GRAY_MEDIUM, COLORS.GRAY_LIGHT] : colors}
        style={[styles.gradient, sizeStyles]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Activity size={20} color={COLORS.WHITE} />
            <Text style={styles.buttonText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {Icon && <Icon size={20} color={COLORS.WHITE} />}
            <Text style={styles.buttonText}>{title}</Text>
          </>
        )}
      </LinearGradient>
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
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    ...TYPO.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 