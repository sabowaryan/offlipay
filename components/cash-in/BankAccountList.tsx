import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { CreditCard, Shield, AlertCircle } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import SelectionCard from '@/components/ui/SelectionCard';
import { BankAccount } from '@/types';

interface BankAccountListProps {
  bankAccounts: BankAccount[];
  selectedAccount: BankAccount | undefined;
  onAccountSelect: (account: BankAccount) => void;
  style?: ViewStyle;
}

export default function BankAccountList({ bankAccounts, selectedAccount, onAccountSelect, style }: BankAccountListProps) {
  const { colors: COLORS } = useThemeColors();

  const getAccountIcon = (account: BankAccount) => {
    if (!account.isVerified) return AlertCircle;
    return account.lastUsed ? CreditCard : Shield;
  };

  const getAccountIconColor = (account: BankAccount) => {
    if (!account.isVerified) return COLORS.ERROR;
    return COLORS.SUCCESS;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>Comptes Bancaires</Text>
        <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}> {bankAccounts.length} compte{bankAccounts.length > 1 ? 's' : ''} configuré{bankAccounts.length > 1 ? 's' : ''}</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bankAccounts.length === 0 ? (
          <Text style={[styles.emptyText, { color: COLORS.GRAY_MEDIUM }]}>Aucun compte bancaire</Text>
        ) : (
          bankAccounts.map((account, idx) => {
            const info = {
              title: `${account.bankName} - ${account.accountNumber.slice(-4)}`,
              subtitle: account.accountHolder,
              description: `Limite: ${account.dailyLimit}€/jour • ${account.isVerified ? 'Vérifié' : 'Non vérifié'}`,
            };
            const Icon = getAccountIcon(account);
            const iconColor = getAccountIconColor(account);
            return (
              <SelectionCard
                key={account.id}
                icon={Icon}
                iconColor={iconColor}
                title={info.title}
                subtitle={info.subtitle}
                description={info.description}
                selected={selectedAccount?.id === account.id}
                onPress={() => onAccountSelect(account)}
                disabled={!account.isVerified}
                style={idx !== bankAccounts.length - 1 ? { marginBottom: 12 } : undefined}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    ...TYPO.h3,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPO.caption,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyText: {
    ...TYPO.caption,
    textAlign: 'center',
    marginTop: 16,
  },
}); 