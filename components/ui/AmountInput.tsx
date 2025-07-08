import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  currency?: string;
  quickAmounts?: number[];
  onQuickAmountPress?: (amount: number) => void;
  style?: ViewStyle;
}

export default function AmountInput({
  value,
  onChangeText,
  error,
  placeholder = '0.00',
  currency = '€',
  quickAmounts = [10, 25, 50, 100],
  onQuickAmountPress,
  style,
}: AmountInputProps) {
  const { colors: COLORS } = useThemeColors();

  const handleQuickAmountPress = (amount: number) => {
    onChangeText(amount.toString());
    onQuickAmountPress?.(amount);
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: COLORS.BACKGROUND,
            borderColor: error ? COLORS.ERROR : COLORS.GRAY_LIGHT,
          },
        ]}
      >
        <Text style={[styles.currencySymbol, { color: COLORS.GRAY_MEDIUM }]}>{currency}</Text>
        <TextInput
          style={[styles.input, { color: COLORS.TEXT }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_MEDIUM}
          keyboardType="numeric"
          textAlign="center"
          accessible
          accessibilityLabel="Montant à ajouter"
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
        </View>
      )}

      {quickAmounts.length > 0 && (
        <View style={styles.quickAmountsContainer}>
          {quickAmounts.map((amount, idx) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.quickAmountButton,
                {
                  backgroundColor:
                    value === amount.toString()
                      ? COLORS.PRIMARY
                      : COLORS.PRIMARY + '15',
                  borderColor: COLORS.PRIMARY,
                  marginRight: idx !== quickAmounts.length - 1 ? 8 : 0,
                },
              ]}
              onPress={() => handleQuickAmountPress(amount)}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Ajouter ${amount}${currency}`}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  {
                    color:
                      value === amount.toString() ? COLORS.WHITE : COLORS.PRIMARY,
                  },
                ]}
              >
                {amount}{currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  currencySymbol: {
    ...TYPO.h2,
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...TYPO.h1,
    textAlign: 'center',
  },
  errorContainer: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  errorText: {
    ...TYPO.caption,
    fontStyle: 'italic',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAmountText: {
    ...TYPO.caption,
    fontWeight: '600',
  },
}); 