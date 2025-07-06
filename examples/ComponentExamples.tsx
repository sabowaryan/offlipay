import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

// Import des composants UI réutilisables
import ModalContainer from '@/components/ui/ModalContainer';
import SectionCard from '@/components/ui/SectionCard';
import AmountInput from '@/components/ui/AmountInput';
import SelectionCard from '@/components/ui/SelectionCard';
import ActionButton from '@/components/ui/ActionButton';

export default function ComponentExamples() {
  const { colors: COLORS } = useThemeColors();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>();

  const handleAmountChange = (text: string) => {
    setAmount(text);
    if (amountError) setAmountError(undefined);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    if (amountError) setAmountError(undefined);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const validateAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Le montant doit être supérieur à 0');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateAmount()) {
      console.log('Montant validé:', amount);
      console.log('Méthode sélectionnée:', selectedMethod);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>
          Exemples de composants UI
        </Text>
        
        <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]}>
          Cette page démontre l'utilisation des composants UI réutilisables créés lors de la refactorisation.
        </Text>

        {/* Exemple SectionCard */}
        <SectionCard
          title="Section Card"
          subtitle="Composant pour organiser le contenu en sections"
          icon="💳"
        >
          <Text style={[styles.cardContent, { color: COLORS.GRAY_MEDIUM }]}>
            Ce composant permet d'organiser le contenu en sections avec un titre, un sous-titre et une icône optionnelle.
          </Text>
        </SectionCard>

        {/* Exemple AmountInput */}
        <SectionCard
          title="Amount Input"
          subtitle="Saisie de montant avec validation"
          icon="💰"
        >
          <AmountInput
            value={amount}
            onChangeText={handleAmountChange}
            error={amountError}
            quickAmounts={[10, 25, 50, 100]}
            onQuickAmountPress={handleQuickAmount}
            currency="€"
          />
        </SectionCard>

        {/* Exemple SelectionCard */}
        <SectionCard
          title="Selection Card"
          subtitle="Sélection d'options avec icônes"
          icon="✅"
        >
          <View style={styles.selectionGrid}>
            <SelectionCard
              title="Agent"
              subtitle="Paiement via agent"
              icon="👤"
              selected={selectedMethod === 'agent'}
              onPress={() => handleMethodSelect('agent')}
            />
            <SelectionCard
              title="Voucher"
              subtitle="Code prépayé"
              icon="🎫"
              selected={selectedMethod === 'voucher'}
              onPress={() => handleMethodSelect('voucher')}
            />
            <SelectionCard
              title="Bancaire"
              subtitle="Transfert bancaire"
              icon="🏦"
              selected={selectedMethod === 'banking'}
              onPress={() => handleMethodSelect('banking')}
            />
          </View>
        </SectionCard>

        {/* Exemple ActionButton */}
        <SectionCard
          title="Action Button"
          subtitle="Boutons d'action avec différents états"
          icon="🔘"
        >
          <View style={styles.buttonGrid}>
            <ActionButton
              title="Bouton Principal"
              onPress={handleSubmit}
              variant="primary"
              icon="check"
            />
            <ActionButton
              title="Bouton Secondaire"
              onPress={() => console.log('Action secondaire')}
              variant="secondary"
              icon="arrow-right"
            />
            <ActionButton
              title="Bouton Désactivé"
              onPress={() => {}}
              variant="primary"
              disabled={true}
              icon="lock"
            />
          </View>
        </SectionCard>

        {/* Bouton pour ouvrir le modal */}
        <ActionButton
          title="Ouvrir Modal"
          onPress={() => setShowModal(true)}
          variant="primary"
          icon="external-link"
        />
      </View>

      {/* Exemple ModalContainer */}
      <ModalContainer
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Exemple de Modal"
        subtitle="Ce modal utilise le composant ModalContainer réutilisable"
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalText, { color: COLORS.TEXT }]}>
            Ce modal démontre l'utilisation du composant ModalContainer qui gère automatiquement :
          </Text>
          
          <View style={styles.modalFeatures}>
            <Text style={[styles.modalFeature, { color: COLORS.GRAY_MEDIUM }]}>
              • L'affichage/masquage du modal
            </Text>
            <Text style={[styles.modalFeature, { color: COLORS.GRAY_MEDIUM }]}>
              • Le bouton de fermeture
            </Text>
            <Text style={[styles.modalFeature, { color: COLORS.GRAY_MEDIUM }]}>
              • La gestion du clavier
            </Text>
            <Text style={[styles.modalFeature, { color: COLORS.GRAY_MEDIUM }]}>
              • Le style et les animations
            </Text>
          </View>

          <ActionButton
            title="Fermer"
            onPress={() => setShowModal(false)}
            variant="secondary"
            icon="x"
          />
        </View>
      </ModalContainer>
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
  cardContent: {
    ...TYPO.body,
    lineHeight: 20,
  },
  selectionGrid: {
    gap: 12,
  },
  buttonGrid: {
    gap: 12,
  },
  modalContent: {
    padding: 20,
    gap: 20,
  },
  modalText: {
    ...TYPO.body,
    lineHeight: 20,
  },
  modalFeatures: {
    gap: 8,
  },
  modalFeature: {
    ...TYPO.body,
    lineHeight: 20,
  },
}); 