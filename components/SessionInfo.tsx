import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { User as UserIcon, Database, Shield, Clock, Smartphone, CreditCard } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { WalletService } from '@/services/WalletService';
import { User } from '@/types';

interface SessionInfoProps {
  user: User;
}

export default function SessionInfo({ user }: SessionInfoProps) {
  const { colors: COLORS } = useThemeColors();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(balance);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Session Status */}
      <View style={[styles.section, { backgroundColor: COLORS.CARD }]}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={COLORS.PRIMARY} />
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginLeft: 8 }]}>
            Statut de Session
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Connecté :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            {WalletService.isLoggedIn() ? 'Oui' : 'Non'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Mode :</Text>
          <Text style={[styles.value, { color: COLORS.TEXT }]}>
            {WalletService.getCurrentUserMode() === 'buyer' ? 'Acheteur' : 'Vendeur'}
          </Text>
        </View>
      </View>

      {/* User Information */}
      <View style={[styles.section, { backgroundColor: COLORS.CARD }]}>
        <View style={styles.sectionHeader}>
          <UserIcon size={20} color={COLORS.PRIMARY} />
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginLeft: 8 }]}>
            Informations Utilisateur
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Nom :</Text>
          <Text style={[styles.value, { color: COLORS.TEXT }]}>{user.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Téléphone :</Text>
          <Text style={[styles.value, { color: COLORS.TEXT }]}>{user.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Solde :</Text>
          <Text style={[styles.value, { color: COLORS.PRIMARY, fontWeight: 'bold' }]}>
            {formatBalance(user.balance)}
          </Text>
        </View>
      </View>

      {/* Wallet Information */}
      <View style={[styles.section, { backgroundColor: COLORS.CARD }]}>
        <View style={styles.sectionHeader}>
          <CreditCard size={20} color={COLORS.PRIMARY} />
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginLeft: 8 }]}>
            Informations Wallet
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>ID Wallet :</Text>
          <Text style={[styles.value, { color: COLORS.TEXT, fontFamily: 'monospace' }]}>
            {user.walletId}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Clé publique :</Text>
          <Text style={[styles.value, { color: COLORS.TEXT, fontFamily: 'monospace', fontSize: 12 }]}>
            {user.publicKey.substring(0, 20)}...
          </Text>
        </View>
      </View>

      {/* Database Information */}
      <View style={[styles.section, { backgroundColor: COLORS.CARD }]}>
        <View style={styles.sectionHeader}>
          <Database size={20} color={COLORS.PRIMARY} />
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginLeft: 8 }]}>
            Persistance des Données
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Stockage :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            SQLite Local
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Chiffrement :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            PIN Hashé
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Clés :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            Cryptographiques
          </Text>
        </View>
      </View>

      {/* Timestamps */}
      <View style={[styles.section, { backgroundColor: COLORS.CARD }]}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={COLORS.PRIMARY} />
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginLeft: 8 }]}>
            Horodatage
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Créé le :</Text>
          <Text style={[styles.value, { color: COLORS.TEXT }]}>
            {formatDate(user.createdAt)}
          </Text>
        </View>

        {user.lastSyncAt && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Dernière sync :</Text>
            <Text style={[styles.value, { color: COLORS.TEXT }]}>
              {formatDate(user.lastSyncAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Validation Info */}
      <View style={[styles.section, { backgroundColor: COLORS.CARD }]}>
        <View style={styles.sectionHeader}>
          <Smartphone size={20} color={COLORS.PRIMARY} />
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginLeft: 8 }]}>
            Validation des Données
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>Téléphone unique :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            Vérifié
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>ID Wallet unique :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            Généré automatiquement
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: COLORS.GRAY_MEDIUM }]}>PIN sécurisé :</Text>
          <Text style={[styles.value, { color: COLORS.SUCCESS }]}>
            Hashé avec salt
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
    flex: 1,
  },
}); 