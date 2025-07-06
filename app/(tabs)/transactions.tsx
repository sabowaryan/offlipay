import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  useWindowDimensions,
  TextInput,
  Share
} from 'react-native';
import { WalletService } from '@/services/WalletService';
import { Transaction } from '@/types';
import TransactionItem from '@/components/TransactionItem';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import { 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowLeft,
  Calendar,
  Download,
  Share2
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function TransactionsScreen() {
  const { colors: COLORS, theme } = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isTablet = windowWidth > 768;
  const isSmallScreen = windowWidth < 375;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const history = await WalletService.getTransactionHistory(100);
      setTransactions(history);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Erreur', 'Impossible de charger les transactions');
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
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = !searchQuery || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTotalAmount = (type: 'sent' | 'received') => {
    return transactions
      .filter(t => t.type === type && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTransactionStats = () => {
    const sent = transactions.filter(t => t.type === 'sent' && t.status === 'completed');
    const received = transactions.filter(t => t.type === 'received' && t.status === 'completed');
    
    return {
      totalSent: sent.reduce((sum, t) => sum + t.amount, 0),
      totalReceived: received.reduce((sum, t) => sum + t.amount, 0),
      sentCount: sent.length,
      receivedCount: received.length,
      totalCount: transactions.length
    };
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleExportTransactions = () => {
    // TODO: Implémenter l'export des transactions
    Alert.alert('Export', 'Fonctionnalité d\'export à venir');
  };

  const handleShareTransactions = async () => {
    try {
      if (filteredTransactions.length === 0) {
        Alert.alert('Aucune transaction', 'Aucune transaction à partager');
        return;
      }

      // Formater les transactions pour le partage
      const formatTransaction = (transaction: Transaction) => {
        const isReceived = transaction.type === 'received';
        const amount = transaction.amount.toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        });
        const date = transaction.timestamp.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return `${isReceived ? '✅' : '❌'} ${amount} - ${transaction.description || 'Aucune description'} (${date})`;
      };

      // Créer le contenu à partager
      const filterText = filter === 'all' ? 'Toutes les transactions' :
                        filter === 'sent' ? 'Transactions envoyées' :
                        'Transactions reçues';
      
      const searchText = searchQuery ? `\nRecherche: "${searchQuery}"` : '';
      
      const transactionsText = filteredTransactions
        .slice(0, 10) // Limiter à 10 transactions pour éviter un message trop long
        .map(formatTransaction)
        .join('\n');

      let shareContent = `📊 ${filterText} - OffliPay${searchText}\n\n${transactionsText}`;

      if (filteredTransactions.length > 10) {
        shareContent += `\n\n... et ${filteredTransactions.length - 10} autres transactions`;
      }

      // Ajouter les statistiques
      const stats = getTransactionStats();
      shareContent += `\n\n📈 Statistiques:`;
      shareContent += `\n• Total envoyé: ${stats.totalSent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
      shareContent += `\n• Total reçu: ${stats.totalReceived.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
      shareContent += `\n• Nombre total: ${stats.totalCount} transaction${stats.totalCount > 1 ? 's' : ''}`;

      await Share.share({
        message: shareContent,
        title: `Historique des transactions - OffliPay`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager les transactions');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <Activity size={48} color={COLORS.PRIMARY} />
          <Text style={[styles.loadingText, { color: COLORS.TEXT }]}>
            Chargement des transactions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getTransactionStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header moderne avec gradient */}
      <LinearGradient
        colors={[COLORS.PRIMARY, COLORS.PRIMARY_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top - 8 }]}
      >
        <View style={[styles.headerContent, { paddingTop: -16 }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={COLORS.WHITE} />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Historique</Text>
              <Text style={styles.headerSubtitle}>
                {stats.totalCount} transaction{stats.totalCount > 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={() => setShowSearch(!showSearch)}
              >
                <Search size={20} color={COLORS.WHITE} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={handleExportTransactions}
              >
                <Download size={20} color={COLORS.WHITE} />
              </TouchableOpacity>
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
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar - Position fixe en haut */}
        {showSearch && (
          <View style={[styles.searchContainer, { 
            backgroundColor: COLORS.CARD, 
            borderColor: COLORS.GRAY_LIGHT,
            marginTop: 16,
            marginBottom: 24,
            zIndex: 1000,
            elevation: 8
          }]}>
            <Search size={20} color={COLORS.GRAY_MEDIUM} />
            <TextInput
              style={[styles.searchInput, { color: COLORS.TEXT }]}
              placeholder="Rechercher une transaction..."
              placeholderTextColor={COLORS.GRAY_MEDIUM}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {/* Summary Cards */}
        <View style={[styles.summaryContainer, { 
          flexDirection: 'row',
          gap: 12,
          marginTop: showSearch ? 0 : 16
        }]}>
          <View style={[styles.summaryCard, { 
            backgroundColor: COLORS.CARD, 
            borderColor: COLORS.GRAY_LIGHT,
            flex: 1
          }]}>
            <LinearGradient
              colors={[COLORS.ERROR + '15', COLORS.ERROR + '05']}
              style={styles.summaryIconContainer}
            >
              <TrendingDown size={24} color={COLORS.ERROR} />
            </LinearGradient>
            <Text style={[styles.summaryLabel, { color: COLORS.GRAY_MEDIUM }]}>
              Total envoyé
            </Text>
            <Text style={[styles.summaryAmount, { color: COLORS.ERROR }]}>
              {stats.totalSent.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </Text>
            <Text style={[styles.summaryCount, { color: COLORS.GRAY_MEDIUM }]}>
              {stats.sentCount} transaction{stats.sentCount > 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { 
            backgroundColor: COLORS.CARD, 
            borderColor: COLORS.GRAY_LIGHT,
            flex: 1
          }]}>
            <LinearGradient
              colors={[COLORS.SUCCESS + '15', COLORS.SUCCESS + '05']}
              style={styles.summaryIconContainer}
            >
              <TrendingUp size={24} color={COLORS.SUCCESS} />
            </LinearGradient>
            <Text style={[styles.summaryLabel, { color: COLORS.GRAY_MEDIUM }]}>
              Total reçu
            </Text>
            <Text style={[styles.summaryAmount, { color: COLORS.SUCCESS }]}>
              {stats.totalReceived.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </Text>
            <Text style={[styles.summaryCount, { color: COLORS.GRAY_MEDIUM }]}>
              {stats.receivedCount} transaction{stats.receivedCount > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filterTabs, { 
          flexDirection: 'row',
          gap: 8 
        }]}>
          <TouchableOpacity
            style={[
              styles.filterTab, 
              { 
                backgroundColor: COLORS.CARD, 
                borderColor: COLORS.GRAY_LIGHT,
                flex: 1
              },
              filter === 'all' && { 
                backgroundColor: COLORS.PRIMARY, 
                borderColor: COLORS.PRIMARY 
              }
            ]}
            onPress={() => setFilter('all')}
          >
            <Activity size={16} color={filter === 'all' ? COLORS.WHITE : COLORS.GRAY_MEDIUM} />
            <Text style={[
              styles.filterTabText, 
              { color: COLORS.GRAY_MEDIUM },
              filter === 'all' && { color: COLORS.WHITE }
            ]}>
              Tout ({stats.totalCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab, 
              { 
                backgroundColor: COLORS.CARD, 
                borderColor: COLORS.GRAY_LIGHT,
                flex: 1
              },
              filter === 'sent' && { 
                backgroundColor: COLORS.ERROR, 
                borderColor: COLORS.ERROR 
              }
            ]}
            onPress={() => setFilter('sent')}
          >
            <TrendingDown size={16} color={filter === 'sent' ? COLORS.WHITE : COLORS.ERROR} />
            <Text style={[
              styles.filterTabText, 
              { color: COLORS.GRAY_MEDIUM },
              filter === 'sent' && { color: COLORS.WHITE }
            ]}>
              Envoyés ({stats.sentCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab, 
              { 
                backgroundColor: COLORS.CARD, 
                borderColor: COLORS.GRAY_LIGHT,
                flex: 1
              },
              filter === 'received' && { 
                backgroundColor: COLORS.SUCCESS, 
                borderColor: COLORS.SUCCESS 
              }
            ]}
            onPress={() => setFilter('received')}
          >
            <TrendingUp size={16} color={filter === 'received' ? COLORS.WHITE : COLORS.SUCCESS} />
            <Text style={[
              styles.filterTabText, 
              { color: COLORS.GRAY_MEDIUM },
              filter === 'received' && { color: COLORS.WHITE }
            ]}>
              Reçus ({stats.receivedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
              Transactions
            </Text>
            {filteredTransactions.length > 0 && (
              <TouchableOpacity onPress={handleShareTransactions}>
                <Share2 size={20} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
          
          {filteredTransactions.length === 0 ? (
            <View style={[styles.emptyContainer, { 
              backgroundColor: COLORS.CARD, 
              borderColor: COLORS.GRAY_LIGHT 
            }]}>
              <View style={[styles.emptyIcon, { backgroundColor: COLORS.GRAY_LIGHT }]}>
                <Activity size={48} color={COLORS.GRAY_MEDIUM} />
              </View>
              <Text style={[styles.emptyText, { color: COLORS.TEXT }]}>
                {searchQuery ? 'Aucune transaction trouvée' : 'Aucune transaction'}
              </Text>
              <Text style={[styles.emptySubtext, { color: COLORS.GRAY_MEDIUM }]}>
                {searchQuery 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Vos transactions apparaîtront ici'
                }
              </Text>
            </View>
          ) : (
            <View style={[styles.transactionsList, { 
              flexDirection: isTablet ? 'row' : 'column',
              flexWrap: isTablet ? 'wrap' : 'nowrap',
              gap: 12
            }]}>
              {filteredTransactions.map((transaction) => (
                <View key={transaction.id} style={isTablet ? { width: '48%' } : undefined}>
                  <TransactionItem
                    transaction={transaction}
                    onPress={() => handleTransactionPress(transaction)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        visible={showTransactionDetails}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionDetails(false)}
      />
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
    paddingBottom: 100,
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
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    ...TYPO.h1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TYPO.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    ...TYPO.body,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    ...TYPO.caption,
    marginBottom: 4,
  },
  summaryAmount: {
    ...TYPO.h2,
    marginBottom: 4,
  },
  summaryCount: {
    ...TYPO.caption,
  },
  filterTabs: {
    marginBottom: 24,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    ...TYPO.caption,
    fontWeight: '600',
  },
  transactionsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPO.h2,
  },
  transactionsList: {
    gap: 8,
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});