import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, Banknote } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isReceived = transaction.type === 'received';
  const isSystem = transaction.fromWalletId === 'SYSTEM';
  
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle size={16} color="#00E676" />;
      case 'pending':
        return <Clock size={16} color="#FFC107" />;
      case 'failed':
        return <XCircle size={16} color="#F44336" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return '#00E676';
      case 'pending':
        return '#FFC107';
      case 'failed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTransactionIcon = () => {
    if (isSystem) {
      return <Banknote size={24} color="#00E676" />;
    }
    return isReceived ? (
      <ArrowDownLeft size={24} color="#00E676" />
    ) : (
      <ArrowUpRight size={24} color="#FF6B6B" />
    );
  };

  const getIconBackground = () => {
    if (isSystem) {
      return ['rgba(0, 230, 118, 0.2)', 'rgba(0, 230, 118, 0.1)'];
    }
    return isReceived ? 
      ['rgba(0, 230, 118, 0.2)', 'rgba(0, 230, 118, 0.1)'] : 
      ['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)'];
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={getIconBackground()}
        style={styles.iconContainer}
      >
        {getTransactionIcon()}
      </LinearGradient>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isSystem ? 'Money Added' : 
             isReceived ? 'Payment Received' : 'Payment Sent'}
          </Text>
          <Text style={[styles.amount, { color: isReceived ? '#00E676' : '#FF6B6B' }]}>
            {isReceived ? '+' : '-'}${formatAmount(transaction.amount)}
          </Text>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description || 'No description'}
          </Text>
          <View style={styles.statusRow}>
            {getStatusIcon()}
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {transaction.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(transaction.timestamp)}</Text>
          <Text style={styles.walletId}>
            {isSystem ? 'System' : 
             isReceived ? 
               `From: ${transaction.fromWalletId.substring(0, 8)}...` : 
               `To: ${transaction.toWalletId.substring(0, 8)}...`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Inter-Regular',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
    fontFamily: 'Inter-Medium',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  walletId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});