import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, Banknote } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { colors: COLORS } = useThemeColors();
  const isReceived = transaction.type === 'received';
  const isSystem = transaction.fromWalletId === 'SYSTEM';
  
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle size={16} color={COLORS.SUCCESS} />;
      case 'pending':
        return <Clock size={16} color={COLORS.WARNING} />;
      case 'failed':
        return <XCircle size={16} color={COLORS.ERROR} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return COLORS.SUCCESS;
      case 'pending':
        return COLORS.WARNING;
      case 'failed':
        return COLORS.ERROR;
      default:
        return COLORS.GRAY_MEDIUM;
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTransactionIcon = () => {
    if (isSystem) {
      return <Banknote size={24} color={COLORS.SUCCESS} />;
    }
    return isReceived ? (
      <ArrowDownLeft size={24} color={COLORS.SUCCESS} />
    ) : (
      <ArrowUpRight size={24} color={COLORS.ERROR} />
    );
  };

  const getIconBackground = () => {
    if (isSystem) {
      return [COLORS.SUCCESS + '20', COLORS.SUCCESS + '10'] as const;
    }
    return isReceived ? 
      [COLORS.SUCCESS + '20', COLORS.SUCCESS + '10'] as const : 
      [COLORS.ERROR + '20', COLORS.ERROR + '10'] as const;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: COLORS.CARD,
          borderColor: COLORS.GRAY_LIGHT,
          shadowColor: COLORS.TEXT
        }
      ]} 
      onPress={onPress}
    >
      <LinearGradient
        colors={getIconBackground()}
        style={styles.iconContainer}
      >
        {getTransactionIcon()}
      </LinearGradient>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: COLORS.TEXT }]}>
            {isSystem ? 'Fonds ajoutés' : 
             isReceived ? 'Paiement reçu' : 'Paiement envoyé'}
          </Text>
          <Text style={[styles.amount, { color: isReceived ? COLORS.SUCCESS : COLORS.ERROR }]}>
            {isReceived ? '+' : '-'}{formatAmount(transaction.amount)}€
          </Text>
        </View>
        
        <View style={styles.details}>
          <Text style={[styles.description, { color: COLORS.GRAY_MEDIUM }]} numberOfLines={1}>
            {transaction.description || 'Aucune description'}
          </Text>
          <View style={styles.statusRow}>
            {getStatusIcon()}
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {transaction.status === 'completed' ? 'Terminé' :
               transaction.status === 'pending' ? 'En cours' :
               transaction.status === 'failed' ? 'Échoué' : transaction.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.date, { color: COLORS.GRAY_MEDIUM }]}>{formatDate(transaction.timestamp)}</Text>
          <Text style={[styles.walletId, { color: COLORS.GRAY_MEDIUM }]}>
            {isSystem ? 'Système' : 
             isReceived ? 
               `De: ${transaction.fromWalletId.substring(0, 8)}...` : 
               `À: ${transaction.toWalletId.substring(0, 8)}...`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...TYPO.h3,
  },
  amount: {
    ...TYPO.h3,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    ...TYPO.body,
    flex: 1,
    marginRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    ...TYPO.caption,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...TYPO.caption,
  },
  walletId: {
    ...TYPO.caption,
  },
});