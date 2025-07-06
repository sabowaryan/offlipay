import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
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
}

export default function VoucherInput({
  voucherCode,
  onVoucherCodeChange,
  onScanVoucher,
  error,
  voucherInfo,
}: VoucherInputProps) {
  const { colors: COLORS } = useThemeColors();

  return (
    <SectionCard
      icon={QrCode}
      iconColor={COLORS.SUCCESS}
      title="Voucher Prépayé"
    >
      <View style={styles.container}>
        <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]}>
          Entrez le code du voucher ou scannez le QR code
        </Text>

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
            />
          </View>

          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: COLORS.SUCCESS + '15' }]}
            onPress={onScanVoucher}
          >
            <Scan size={20} color={COLORS.SUCCESS} />
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            {error}
          </Text>
        )}

        {voucherInfo && (
          <View
            style={[
              styles.voucherInfo,
              {
                backgroundColor: voucherInfo.isValid
                  ? COLORS.SUCCESS + '15'
                  : COLORS.ERROR + '15',
                borderColor: voucherInfo.isValid ? COLORS.SUCCESS : COLORS.ERROR,
              },
            ]}
          >
            <Text
              style={[
                styles.voucherAmount,
                {
                  color: voucherInfo.isValid ? COLORS.SUCCESS : COLORS.ERROR,
                },
              ]}
            >
              {voucherInfo.amount} {voucherInfo.currency}
            </Text>
            <Text
              style={[
                styles.voucherStatus,
                {
                  color: voucherInfo.isValid ? COLORS.SUCCESS : COLORS.ERROR,
                },
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
    gap: 16,
  },
  description: {
    ...TYPO.body,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
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
  },
  voucherInfo: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  voucherAmount: {
    ...TYPO.h2,
    fontWeight: '600',
  },
  voucherStatus: {
    ...TYPO.caption,
    fontWeight: '500',
  },
}); 