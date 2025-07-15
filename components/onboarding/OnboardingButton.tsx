import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { OnboardingButtonProps } from './types';

const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [
          styles.button,
          styles.primaryButton,
          (disabled || loading) && styles.disabledButton,
        ];
      case 'secondary':
        return [
          styles.button,
          styles.secondaryButton,
          (disabled || loading) && styles.disabledSecondaryButton,
        ];
      case 'ghost':
        return [
          styles.button,
          styles.ghostButton,
          (disabled || loading) && styles.disabledGhostButton,
        ];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [
          styles.buttonText,
          styles.primaryButtonText,
          (disabled || loading) && styles.disabledButtonText,
        ];
      case 'secondary':
        return [
          styles.buttonText,
          styles.secondaryButtonText,
          (disabled || loading) && styles.disabledSecondaryButtonText,
        ];
      case 'ghost':
        return [
          styles.buttonText,
          styles.ghostButtonText,
          (disabled || loading) && styles.disabledGhostButtonText,
        ];
      default:
        return [styles.buttonText, styles.primaryButtonText];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.WHITE : colors.PRIMARY}
            style={styles.loadingIndicator}
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: 44, // Accessibility minimum touch target
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...TYPO.button,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  
  // Primary button styles
  primaryButton: {
    backgroundColor: colors.PRIMARY,
    shadowColor: colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: colors.WHITE,
    fontWeight: '600',
  },
  
  // Secondary button styles
  secondaryButton: {
    backgroundColor: colors.BACKGROUND,
    borderWidth: 1,
    borderColor: colors.PRIMARY,
  },
  secondaryButtonText: {
    color: colors.PRIMARY,
    fontWeight: '500',
  },
  
  // Ghost button styles
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    color: colors.GRAY_MEDIUM,
    fontWeight: '400',
  },
  
  // Disabled states
  disabledButton: {
    backgroundColor: colors.GRAY_LIGHT,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: colors.GRAY_MEDIUM,
  },
  disabledSecondaryButton: {
    backgroundColor: colors.BACKGROUND,
    borderColor: colors.GRAY_LIGHT,
  },
  disabledSecondaryButtonText: {
    color: colors.GRAY_MEDIUM,
  },
  disabledGhostButton: {
    backgroundColor: 'transparent',
  },
  disabledGhostButtonText: {
    color: colors.GRAY_LIGHT,
  },
});

export default OnboardingButton;