import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CreditCard, Shield, AlertCircle } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import SelectionCard from '@/components/ui/SelectionCard';
import { BankAccount } from '@/types';

interface BankAccountListProps {
  bankAccounts: BankAccount[];
  selectedAccount: BankAccount | undefined;
  onAccountSelect: (account: BankAccount) => void;
}

export default function BankAccountList({
  bankAccounts,
  selectedAccount,
  onAccountSelect,
}: BankAccountListProps) {
  const { colors: COLORS } = useThemeColors();

  const formatAccountInfo = (account: BankAccount) => ({
    title: `${account.bankName} - ${account.accountNumber.slice(-4)}`,
    subtitle: account.accountHolder,
    description: `Limite: ${account.dailyLimit}€/jour • ${account.isVerified ? 'Vérifié' : 'Non vérifié'}`,
  });

  const getAccountIcon = (account: BankAccount) => {
    if (!account.isVerified) {
      return AlertCircle;
    }
    return account.lastUsed ? CreditCard : Shield;
  };

  const getAccountIconColor = (account: BankAccount) => {
    if (!account.isVerified) {
      return COLORS.ERROR;
    }
    return COLORS.SUCCESS;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>
          Comptes Bancaires
        </Text>
        <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}>
          {bankAccounts.length} compte{bankAccounts.length > 1 ? 's' : ''} configuré{bankAccounts.length > 1 ? 's' : ''}
        </Text>
      </View>

      {bankAccounts.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
          <CreditCard size={48} color={COLORS.GRAY_MEDIUM} />
          <Text style={[styles.emptyText, { color: COLORS.TEXT }]}>
            Aucun compte bancaire
          </Text>
          <Text style={[styles.emptySubtext, { color: COLORS.GRAY_MEDIUM }]}>
            Ajoutez un compte bancaire pour effectuer des virements
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {bankAccounts.map((account) => {
            const info = formatAccountInfo(account);
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
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    ...TYPO.h3,
  },
  subtitle: {
    ...TYPO.caption,
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 16,
  },
  emptyText: {
    ...TYPO.h3,
    textAlign: 'center',
  },
  emptySubtext: {
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 20,
  },
}); 