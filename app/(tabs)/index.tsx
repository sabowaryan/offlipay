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
  Dimensions,
  useWindowDimensions,
  Platform,
  StatusBar,
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
  Copy,
  Bell,
  Settings,
  CreditCard,
  Smartphone,
  Zap
} from 'lucide-react-native';
import TransactionItem from '@/components/TransactionItem';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserMode } from '@/hooks/useUserMode';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import Logo from '@/components/Logo';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors: COLORS, theme } = useThemeColors();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { userMode, toggleUserMode } = useUserMode();
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
      'Ajouter des fonds',
      'Combien souhaitez-vous ajouter à votre wallet ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: '10€', onPress: () => addMoney(10) },
        { text: '50€', onPress: () => addMoney(50) },
        { text: '100€', onPress: () => addMoney(100) },
      ]
    );
  };

  const addMoney = async (amount: number) => {
    try {
      await WalletService.addMoney(amount);
      await loadUserData();
      Alert.alert('Succès', `${amount}€ ajoutés à votre wallet !`);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de l\'ajout de fonds');
    }
  };

  const formatBalance = (balance: number) => {
    if (!balanceVisible) return '••••••';
    return balance.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const copyWalletId = async () => {
    if (user) {
      try {
        await Clipboard.setStringAsync(user.walletId);
        Alert.alert('Copié', 'ID Wallet copié dans le presse-papiers');
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de copier l\'ID wallet');
      }
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

  const handleScanToPay = () => {
    router.push({
      pathname: '/(tabs)/pay',
      params: { mode: 'buyer' }
    });
  };

  const handleShowReceiveQR = () => {
    router.push({
      pathname: '/(tabs)/pay',
      params: { mode: 'seller' }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <Logo size={80} />
          <Text style={[styles.loadingText, { color: COLORS.TEXT }]}>
            Chargement de votre wallet...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Logo size={64} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            Aucune donnée utilisateur trouvée
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getTransactionStats();
  const filteredTransactions = userMode === 'buyer'
    ? transactions.filter(t => t.type === 'sent')
    : transactions.filter(t => t.type === 'received');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header moderne avec gradient */}
      <LinearGradient
        colors={[COLORS.PRIMARY, COLORS.PRIMARY_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={[styles.avatarContainer, { backgroundColor: COLORS.WHITE + '20' }]}>
                <Logo compact size={32} />
              </View>
              <View style={styles.userText}>
                <Text style={[styles.userName, { color: COLORS.WHITE }]} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={[styles.userStatus, { color: COLORS.WHITE + 'CC' }]}>
                  {userMode === 'buyer' ? 'Mode Acheteur' : 'Mode Vendeur'}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: COLORS.WHITE + '20' }]}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <Settings size={20} color={COLORS.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: COLORS.WHITE + '20' }]}
                onPress={toggleUserMode}
              >
                <Zap size={20} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Card intégrée */}
          <View style={[styles.balanceCard, { backgroundColor: COLORS.WHITE + '15' }]}>
            <View style={styles.balanceHeader}>
              <Text style={[styles.balanceLabel, { color: COLORS.WHITE + 'CC' }]}>
                Solde Total
              </Text>
              <TouchableOpacity 
                onPress={() => setBalanceVisible(!balanceVisible)}
                style={[styles.eyeButton, { backgroundColor: COLORS.WHITE + '20' }]}
              >
                {balanceVisible ? (
                  <Eye size={18} color={COLORS.WHITE} />
                ) : (
                  <EyeOff size={18} color={COLORS.WHITE} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.balanceAmount, { color: COLORS.WHITE }]}>
              {formatBalance(user.balance)}
            </Text>
            <View style={styles.walletInfo}>
              <View style={styles.walletIdContainer}>
                <CreditCard size={14} color={COLORS.WHITE + 'CC'} />
                <Text style={[styles.walletId, { color: COLORS.WHITE + 'CC' }]}>
                  {user.walletId.substring(0, 16)}...
                </Text>
                <TouchableOpacity onPress={copyWalletId} style={styles.copyButton}>
                  <Copy size={14} color={COLORS.WHITE} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.PRIMARY}
            colors={[COLORS.PRIMARY]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.SUCCESS + '15' }]}>
              <TrendingUp size={20} color={COLORS.SUCCESS} />
            </View>
            <Text style={[styles.statValue, { color: COLORS.TEXT }]}>
              {stats.totalReceived.toFixed(2)}€
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.GRAY_MEDIUM }]}>
              Reçus
            </Text>
            <Text style={[styles.statCount, { color: COLORS.GRAY_MEDIUM }]}>
              {stats.receivedCount} transactions
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.ERROR + '15' }]}>
              <TrendingDown size={20} color={COLORS.ERROR} />
            </View>
            <Text style={[styles.statValue, { color: COLORS.TEXT }]}>
              {stats.totalSent.toFixed(2)}€
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.GRAY_MEDIUM }]}>
              Envoyés
            </Text>
            <Text style={[styles.statCount, { color: COLORS.GRAY_MEDIUM }]}>
              {stats.sentCount} transactions
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Actions Rapides
          </Text>
          
          <View style={styles.actionsGrid}>
            {userMode === 'buyer' ? (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}
                onPress={handleScanToPay}
              >
                <LinearGradient
                  colors={[COLORS.PRIMARY, COLORS.PRIMARY_LIGHT]}
                  style={styles.actionGradient}
                >
                  <Scan size={28} color={COLORS.WHITE} />
                </LinearGradient>
                <Text style={[styles.actionTitle, { color: COLORS.TEXT }]}>
                  Scanner QR
                </Text>
                <Text style={[styles.actionSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
                  Payer avec un code QR
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}
                onPress={handleShowReceiveQR}
              >
                <LinearGradient
                  colors={[COLORS.SUCCESS, COLORS.SUCCESS + 'DD']}
                  style={styles.actionGradient}
                >
                  <QrCode size={28} color={COLORS.WHITE} />
                </LinearGradient>
                <Text style={[styles.actionTitle, { color: COLORS.TEXT }]}>
                  Générer QR
                </Text>
                <Text style={[styles.actionSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
                  Recevoir un paiement
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}
              onPress={handleAddMoney}
            >
              <View style={[styles.actionGradient, { backgroundColor: COLORS.INFO + '15' }]}>
                <Plus size={28} color={COLORS.INFO} />
              </View>
              <Text style={[styles.actionTitle, { color: COLORS.TEXT }]}>
                Ajouter des fonds
              </Text>
              <Text style={[styles.actionSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
                Recharger votre wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactions}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
              Activité Récente
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.seeAll, { color: COLORS.PRIMARY }]}>
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>
          
          {filteredTransactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
              <View style={[styles.emptyIcon, { backgroundColor: COLORS.GRAY_LIGHT }]}>
                <Activity size={32} color={COLORS.GRAY_MEDIUM} />
              </View>
              <Text style={[styles.emptyText, { color: COLORS.TEXT }]}>
                Aucune transaction
              </Text>
              <Text style={[styles.emptySubtext, { color: COLORS.GRAY_MEDIUM }]}>
                Commencez par générer un QR code ou scanner un code pour effectuer votre premier paiement
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.slice(0, 3).map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => {
                    Alert.alert(
                      'Détails de la transaction',
                      `Montant: ${transaction.amount}€\nDescription: ${transaction.description}\nStatut: ${transaction.status}`
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TYPO.body,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    ...TYPO.body,
    marginTop: 16,
    textAlign: 'center',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  headerContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userText: {
    flex: 1,
  },
  userName: {
    ...TYPO.h3,
    marginBottom: 2,
  },
  userStatus: {
    ...TYPO.caption,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabel: {
    ...TYPO.caption,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  walletInfo: {
    marginTop: 8,
  },
  walletIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletId: {
    ...TYPO.caption,
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...TYPO.caption,
    marginBottom: 2,
  },
  statCount: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPO.h3,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    lineHeight: 14,
  },
  recentTransactions: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    ...TYPO.h3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    ...TYPO.caption,
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionsList: {
    gap: 8,
  },
});