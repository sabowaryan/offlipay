import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
}

export default function AmountInput({
  value,
  onChangeText,
  error,
  placeholder = '0.00',
  currency = '€',
  quickAmounts = [10, 25, 50, 100],
  onQuickAmountPress,
}: AmountInputProps) {
  const { colors: COLORS } = useThemeColors();

  const handleQuickAmountPress = (amount: number) => {
    onChangeText(amount.toString());
    onQuickAmountPress?.(amount);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: COLORS.BACKGROUND,
            borderColor: error ? COLORS.ERROR : COLORS.GRAY_LIGHT,
          },
        ]}
      >
        <Text style={[styles.currencySymbol, { color: COLORS.GRAY_MEDIUM }]}>
          {currency}
        </Text>
        <TextInput
          style={[styles.input, { color: COLORS.TEXT }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_MEDIUM}
          keyboardType="numeric"
          textAlign="center"
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            {error}
          </Text>
        </View>
      )}

      {quickAmounts.length > 0 && (
        <View style={styles.quickAmountsContainer}>
          {quickAmounts.map((amount) => (
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
                },
              ]}
              onPress={() => handleQuickAmountPress(amount)}
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
                {amount}€
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
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
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
  },
  errorText: {
    ...TYPO.caption,
    fontStyle: 'italic',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    gap: 8,
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