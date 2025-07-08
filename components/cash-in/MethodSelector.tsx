import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { User, CreditCard, QrCode } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import SelectionCard from '@/components/ui/SelectionCard';
import { CashInMethod } from '@/types';

interface MethodSelectorProps {
  selectedMethod: CashInMethod | null;
  onMethodSelect: (method: CashInMethod) => void;
  style?: ViewStyle;
}

const METHODS = [
  {
    id: 'agent' as CashInMethod,
    icon: User,
    title: 'Agents',
    subtitle: 'Dépôt en espèces',
    description: "Retirez de l'argent auprès d'un agent partenaire",
    iconColor: '#FF6B35',
  },
  {
    id: 'voucher' as CashInMethod,
    icon: QrCode,
    title: 'Vouchers Prépayés',
    subtitle: 'Code QR ou numéro',
    description: 'Utilisez un voucher prépayé pour recharger votre compte',
    iconColor: '#4ECDC4',
  },
  {
    id: 'banking' as CashInMethod,
    icon: CreditCard,
    title: 'Intégration Bancaire',
    subtitle: 'Virement bancaire',
    description: 'Effectuez un virement depuis votre compte bancaire',
    iconColor: '#45B7D1',
  },
];

export default function MethodSelector({
  selectedMethod,
  onMethodSelect,
  style,
}: MethodSelectorProps) {
  const { colors: COLORS } = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: COLORS.TEXT }]}>Choisissez votre méthode</Text>
      <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}>Sélectionnez comment vous souhaitez ajouter des fonds</Text>
      <View style={styles.methodsContainer}>
        {METHODS.map((method, idx) => (
          <SelectionCard
            key={method.id}
            icon={method.icon}
            iconColor={method.iconColor}
            title={method.title}
            subtitle={method.subtitle}
            description={method.description}
            selected={selectedMethod === method.id}
            onPress={() => onMethodSelect(method.id)}
            style={idx !== METHODS.length - 1 ? { marginBottom: 12 } : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    ...TYPO.h2,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  methodsContainer: {
    width: '100%',
  },
}); 