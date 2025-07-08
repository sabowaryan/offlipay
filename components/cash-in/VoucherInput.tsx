import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { QrCode, Scan } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import SectionCard from '@/components/ui/SectionCard';

interface VoucherInputProps {
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onScanVoucher: () => void;
  error?: string;
  voucherInfo?: {
    amount: number;
    currency: string;
    isValid: boolean;
  };
  style?: ViewStyle;
}

export default function VoucherInput({
  voucherCode,
  onVoucherCodeChange,
  onScanVoucher,
  error,
  voucherInfo,
  style,
}: VoucherInputProps) {
  const { colors: COLORS } = useThemeColors();

  return (
    <SectionCard
      icon={QrCode}
      iconColor={COLORS.SUCCESS}
      title="Voucher Prépayé"
      style={style}
    >
      <View style={styles.container}>
        <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]}>Entrez le code du voucher ou scannez le QR code</Text>
        <View style={styles.inputContainer}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: COLORS.BACKGROUND,
                borderColor: error ? COLORS.ERROR : COLORS.GRAY_LIGHT,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: COLORS.TEXT }]}
              value={voucherCode}
              onChangeText={onVoucherCodeChange}
              placeholder="Code du voucher (ex: ABC123456)"
              placeholderTextColor={COLORS.GRAY_MEDIUM}
              autoCapitalize="characters"
              autoCorrect={false}
              accessible
              accessibilityLabel="Code du voucher"
            />
          </View>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: COLORS.SUCCESS + '15' }]}
            onPress={onScanVoucher}
            activeOpacity={0.85}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Scanner un voucher"
          >
            <Scan size={20} color={COLORS.SUCCESS} />
          </TouchableOpacity>
        </View>
        {error && (
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
        )}
        {voucherInfo && (
          <View
            style={[
              styles.voucherInfo,
              {
                backgroundColor: voucherInfo.isValid ? COLORS.SUCCESS + '15' : COLORS.ERROR + '15',
                borderColor: voucherInfo.isValid ? COLORS.SUCCESS : COLORS.ERROR,
              },
            ]}
          >
            <Text
              style={[
                styles.voucherAmount,
                { color: voucherInfo.isValid ? COLORS.SUCCESS : COLORS.ERROR },
              ]}
            >
              {voucherInfo.amount} {voucherInfo.currency}
            </Text>
            <Text
              style={[
                styles.voucherStatus,
                { color: voucherInfo.isValid ? COLORS.SUCCESS : COLORS.ERROR },
              ]}
            >
              {voucherInfo.isValid ? 'Voucher valide' : 'Voucher invalide'}
            </Text>
          </View>
        )}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  description: {
    ...TYPO.body,
    lineHeight: 20,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  input: {
    ...TYPO.body,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...TYPO.caption,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  voucherInfo: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  voucherAmount: {
    ...TYPO.h2,
    fontWeight: '600',
    marginBottom: 4,
  },
  voucherStatus: {
    ...TYPO.caption,
    fontWeight: '500',
  },
}); 