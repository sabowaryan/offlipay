import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

// Import du modal refactorisé
import CashInModalRefactored from '@/components/CashInModalRefactored';

export default function CashInModalExample() {
  const { colors: COLORS } = useThemeColors();
  const [showModal, setShowModal] = useState(false);
  const [lastCashInAmount, setLastCashInAmount] = useState<number | null>(null);

  const handleCashInSuccess = (amount: number) => {
    setLastCashInAmount(amount);
    setShowModal(false);
    // Ici vous pouvez ajouter une notification ou une action supplémentaire
    console.log(`Cash-in réussi: ${amount}€`);
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>
          Exemple d'utilisation du CashInModal
        </Text>
        
        <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]}>
          Ce composant démontre l'utilisation du CashInModal refactorisé avec les nouveaux composants réutilisables.
        </Text>

        <View style={[styles.featuresCard, { 
          backgroundColor: COLORS.CARD, 
          borderColor: COLORS.GRAY_LIGHT 
        }]}>
          <Text style={[styles.featuresTitle, { color: COLORS.TEXT }]}>
            Fonctionnalités disponibles :
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={[styles.featureItem, { color: COLORS.GRAY_MEDIUM }]}>
              • Sélection de méthode (Agents, Vouchers, Bancaire)
            </Text>
            <Text style={[styles.featureItem, { color: COLORS.GRAY_MEDIUM }]}>
              • Saisie de montant avec validation
            </Text>
            <Text style={[styles.featureItem, { color: COLORS.GRAY_MEDIUM }]}>
              • Calcul automatique des frais
            </Text>
            <Text style={[styles.featureItem, { color: COLORS.GRAY_MEDIUM }]}>
              • Scanner QR pour les vouchers
            </Text>
            <Text style={[styles.featureItem, { color: COLORS.GRAY_MEDIUM }]}>
              • Sélection d'agent ou de compte bancaire
            </Text>
            <Text style={[styles.featureItem, { color: COLORS.GRAY_MEDIUM }]}>
              • Validation en temps réel
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cashInButton, { backgroundColor: COLORS.PRIMARY }]}
          onPress={() => setShowModal(true)}
        >
          <Plus size={24} color={COLORS.WHITE} />
          <Text style={[styles.buttonText, { color: COLORS.WHITE }]}>
            Ajouter des fonds
          </Text>
        </TouchableOpacity>

        {lastCashInAmount && (
          <View style={[styles.successCard, { 
            backgroundColor: COLORS.SUCCESS + '15', 
            borderColor: COLORS.SUCCESS 
          }]}>
            <Text style={[styles.successTitle, { color: COLORS.SUCCESS }]}>
              Dernier cash-in réussi !
            </Text>
            <Text style={[styles.successAmount, { color: COLORS.SUCCESS }]}>
              {lastCashInAmount}€ ont été ajoutés à votre portefeuille
            </Text>
          </View>
        )}
      </View>

      {/* Modal refactorisé */}
      <CashInModalRefactored
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleCashInSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
  },
  featuresCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  featuresTitle: {
    ...TYPO.h3,
    marginBottom: 8,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    ...TYPO.body,
    lineHeight: 20,
  },
  cashInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    ...TYPO.body,
    fontWeight: '600',
  },
  successCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    ...TYPO.h3,
    fontWeight: '600',
  },
  successAmount: {
    ...TYPO.body,
    textAlign: 'center',
  },
}); 