import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  RefreshControl,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { User, Transaction, UserMode } from '@/types';
import { 
  Wallet, 
  QrCode, 
  Scan, 
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Copy
} from 'lucide-react-native';
import TransactionItem from '@/components/TransactionItem';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userMode, setUserMode] = useState<UserMode>('buyer');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = WalletService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const history = await WalletService.getTransactionHistory(5);
        setTransactions(history);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleAddMoney = () => {
    Alert.alert(
      'Add Money',
      'How much would you like to add to your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '$10', onPress: () => addMoney(10) },
        { text: '$50', onPress: () => addMoney(50) },
        { text: '$100', onPress: () => addMoney(100) },
      ]
    );
  };

  const addMoney = async (amount: number) => {
    try {
      await WalletService.addMoney(amount);
      await loadUserData();
      Alert.alert('Success', `$${amount} added to your wallet!`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add money');
    }
  };

  const formatBalance = (balance: number) => {
    if (!balanceVisible) return '••••••';
    return balance.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const toggleUserMode = () => {
    setUserMode(userMode === 'buyer' ? 'seller' : 'buyer');
  };

  const copyWalletId = () => {
    if (user) {
      // In a real app, you'd use Clipboard API
      Alert.alert('Copied', 'Wallet ID copied to clipboard');
    }
  };

  const getTransactionStats = () => {
    const sent = transactions.filter(t => t.type === 'sent' && t.status === 'completed');
    const received = transactions.filter(t => t.type === 'received' && t.status === 'completed');
    
    return {
      totalSent: sent.reduce((sum, t) => sum + t.amount, 0),
      totalReceived: received.reduce((sum, t) => sum + t.amount, 0),
      sentCount: sent.length,
      receivedCount: received.length
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={32} color="#00E676" />
          <Text style={styles.loadingText}>Loading your wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No user data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getTransactionStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.modeToggle}
            onPress={toggleUserMode}
          >
            <Text style={styles.modeText}>
              {userMode === 'buyer' ? 'Buyer' : 'Seller'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card with Gradient */}
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? (
                <Eye size={20} color="#666" />
              ) : (
                <EyeOff size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{formatBalance(user.balance)}</Text>
          <View style={styles.walletInfo}>
            <View style={styles.walletIdContainer}>
              <Wallet size={16} color="#666" />
              <Text style={styles.walletId}>
                ID: {user.walletId.substring(0, 12)}...
              </Text>
              <TouchableOpacity onPress={copyWalletId} style={styles.copyButton}>
                <Copy size={14} color="#00E676" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color="#00E676" />
            </View>
            <Text style={styles.statValue}>${stats.totalReceived.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Received</Text>
            <Text style={styles.statCount}>{stats.receivedCount} transactions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingDown size={20} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>${stats.totalSent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Sent</Text>
            <Text style={styles.statCount}>{stats.sentCount} transactions</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => router.push('/pay')}
          >
            <LinearGradient
              colors={['#00E676', '#00C853']}
              style={styles.actionGradient}
            >
              <QrCode size={24} color="#000" />
              <Text style={styles.primaryActionText}>Generate QR</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/pay')}
          >
            <Scan size={24} color="#00E676" />
            <Text style={styles.actionText}>Scan QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddMoney}
          >
            <Plus size={24} color="#00E676" />
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onRefresh}
          >
            <RefreshCw size={24} color="#00E676" />
            <Text style={styles.actionText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactions}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Activity size={48} color="#666" />
              </View>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Start by generating a QR code or scanning one to make your first payment
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 3).map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => {
                    Alert.alert(
                      'Transaction Details',
                      `Amount: $${transaction.amount}\nDescription: ${transaction.description}\nStatus: ${transaction.status}`
                    );
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  modeToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  modeText: {
    fontSize: 12,
    color: '#00E676',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'Inter-Regular',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#00E676',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletId: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  statCount: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minHeight: 80,
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: 'transparent',
    borderColor: '#00E676',
  },
  actionGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  primaryActionText: {
    fontSize: 12,
    color: '#000000',
    marginTop: 8,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  recentTransactions: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  seeAll: {
    fontSize: 14,
    color: '#00E676',
    fontFamily: 'Inter-Regular',
  },
  transactionsList: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyText: {
    fontSize: 18,
    color: '#CCCCCC',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});