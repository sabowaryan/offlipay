import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

// Import des hooks personnalisés
import { useCashInValidation } from '@/hooks/useCashInValidation';
import { useCashInFees } from '@/hooks/useCashInFees';
import { useCustomAlert } from '@/hooks/useCustomAlert';

export default function HookExamples() {
  const { colors: COLORS } = useThemeColors();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | undefined>();
  const [voucherCode, setVoucherCode] = useState('');
  const [bankAccountId, setBankAccountId] = useState<string | undefined>();

  // Utilisation des hooks personnalisés
  const validation = useCashInValidation({
    minAmount: 1,
    maxAmount: 10000,
    requireAgent: true,
    requireVoucher: true,
    requireBankAccount: true,
  });

  const fees = useCashInFees({
    amount: parseFloat(amount) || 0,
    method: method as any,
    agentId,
  });

  const alert = useCustomAlert();

  const handleAmountChange = (text: string) => {
    setAmount(text);
    validation.clearFieldError('amount');
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    validation.clearFieldError('method');
  };

  const handleSubmit = () => {
    const formData = {
      amount,
      method,
      agentId,
      voucherCode,
      bankAccountId,
    };

    if (validation.validateForm(formData)) {
      alert.showSuccess('Validation réussie', `Montant: ${amount}€, Méthode: ${method}`);
    } else {
      alert.showError('Erreur de validation', 'Veuillez corriger les erreurs ci-dessus');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>
          Exemples d'utilisation des hooks
        </Text>
        
        <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]}>
          Cette page démontre l'utilisation des hooks personnalisés créés lors de la refactorisation.
        </Text>

        {/* Section Validation */}
        <View style={[styles.section, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            useCashInValidation
          </Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
            Validation en temps réel des formulaires
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.TEXT }]}>Montant:</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: COLORS.BACKGROUND, 
                borderColor: validation.errors.amount ? COLORS.ERROR : COLORS.GRAY_LIGHT,
                color: COLORS.TEXT 
              }]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="Entrez un montant"
              placeholderTextColor={COLORS.GRAY_MEDIUM}
              keyboardType="numeric"
            />
            {validation.errors.amount && (
              <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
                {validation.errors.amount}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.TEXT }]}>Méthode:</Text>
            <View style={styles.methodButtons}>
              {['agent', 'voucher', 'banking'].map((methodOption) => (
                <TouchableOpacity
                  key={methodOption}
                  style={[styles.methodButton, {
                    backgroundColor: method === methodOption ? COLORS.PRIMARY : COLORS.BACKGROUND,
                    borderColor: COLORS.GRAY_LIGHT,
                  }]}
                  onPress={() => handleMethodChange(methodOption)}
                >
                  <Text style={[styles.methodButtonText, {
                    color: method === methodOption ? COLORS.WHITE : COLORS.TEXT,
                  }]}>
                    {methodOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validation.errors.method && (
              <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
                {validation.errors.method}
              </Text>
            )}
          </View>
        </View>

        {/* Section Frais */}
        <View style={[styles.section, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            useCashInFees
          </Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
            Calcul automatique des frais
          </Text>

          <View style={styles.feesInfo}>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: COLORS.GRAY_MEDIUM }]}>Montant:</Text>
              <Text style={[styles.feeValue, { color: COLORS.TEXT }]}>
                {amount || '0'}€
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: COLORS.GRAY_MEDIUM }]}>Frais:</Text>
              <Text style={[styles.feeValue, { color: COLORS.ERROR }]}>
                {fees.feeAmount.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: COLORS.GRAY_MEDIUM }]}>Total:</Text>
              <Text style={[styles.feeValue, { color: COLORS.SUCCESS, fontWeight: 'bold' }]}>
                {fees.totalAmount.toFixed(2)}€
              </Text>
            </View>
          </View>
        </View>

        {/* Section Alert */}
        <View style={[styles.section, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            useCustomAlert
          </Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
            Gestion des alertes personnalisées
          </Text>

          <View style={styles.alertButtons}>
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: COLORS.SUCCESS }]}
              onPress={() => alert.showSuccess('Succès', 'Opération réussie !')}
            >
              <Text style={[styles.alertButtonText, { color: COLORS.WHITE }]}>
                Alert Succès
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: COLORS.ERROR }]}
              onPress={() => alert.showError('Erreur', 'Une erreur est survenue')}
            >
              <Text style={[styles.alertButtonText, { color: COLORS.WHITE }]}>
                Alert Erreur
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: COLORS.WARNING }]}
              onPress={() => alert.showWarning('Attention', 'Action requise')}
            >
              <Text style={[styles.alertButtonText, { color: COLORS.WHITE }]}>
                Alert Attention
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: COLORS.INFO }]}
              onPress={() => alert.showInfo('Information', 'Informations importantes')}
            >
              <Text style={[styles.alertButtonText, { color: COLORS.WHITE }]}>
                Alert Info
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton de test */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: COLORS.PRIMARY }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { color: COLORS.WHITE }]}>
            Tester la validation
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  title: {
    ...TYPO.h1,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  sectionTitle: {
    ...TYPO.h3,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...TYPO.caption,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    ...TYPO.body,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    ...TYPO.body,
  },
  errorText: {
    ...TYPO.caption,
    fontStyle: 'italic',
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  methodButtonText: {
    ...TYPO.caption,
    fontWeight: '500',
  },
  feesInfo: {
    gap: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    ...TYPO.body,
  },
  feeValue: {
    ...TYPO.body,
    fontWeight: '500',
  },
  alertButtons: {
    gap: 12,
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    ...TYPO.caption,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    ...TYPO.body,
    fontWeight: '600',
  },
}); 