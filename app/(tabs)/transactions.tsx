import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { WalletService } from '@/services/WalletService';
import { Transaction } from '@/types';
import TransactionItem from '@/components/TransactionItem';
import { Filter, Search } from 'lucide-react-native';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const history = await WalletService.getTransactionHistory(100);
      setTransactions(history);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const getTotalAmount = (type: 'sent' | 'received') => {
    return transactions
      .filter(t => t.type === type && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    Alert.alert(
      'Transaction Details',
      `ID: ${transaction.id}\n\nAmount: $${transaction.amount.toFixed(2)}\nDescription: ${transaction.description || 'No description'}\nStatus: ${transaction.status}\nType: ${transaction.type}\nDate: ${transaction.timestamp.toLocaleString()}\n\nFrom: ${transaction.fromWalletId}\nTo: ${transaction.toWalletId}`,
      [{ text: 'Close' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#00E676" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Sent</Text>
          <Text style={styles.summaryAmount}>
            ${getTotalAmount('sent').toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Received</Text>
          <Text style={styles.summaryAmount}>
            ${getTotalAmount('received').toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
            All ({transactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'sent' && styles.activeFilterTab]}
          onPress={() => setFilter('sent')}
        >
          <Text style={[styles.filterTabText, filter === 'sent' && styles.activeFilterTabText]}>
            Sent ({transactions.filter(t => t.type === 'sent').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'received' && styles.activeFilterTab]}
          onPress={() => setFilter('received')}
        >
          <Text style={[styles.filterTabText, filter === 'received' && styles.activeFilterTabText]}>
            Received ({transactions.filter(t => t.type === 'received').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              Your transactions will appear here
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  filterButton: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00E676',
    fontFamily: 'Inter-Bold',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  activeFilterTab: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  filterTabText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontFamily: 'Inter-Medium',
  },
  activeFilterTabText: {
    color: '#000000',
  },
  transactionsList: {
    flex: 1,
    backgroundColor: '#111111',
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#CCCCCC',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});