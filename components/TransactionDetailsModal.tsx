import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Dimensions,
  Animated,
  StatusBar,
  ScrollView
} from 'react-native';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CircleCheck as CheckCircle, 
  Circle as XCircle, 
  Banknote,
  Calendar,
  User,
  Hash,
  MessageSquare,
  Copy
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { Transaction } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

const { width, height } = Dimensions.get('window');

interface TransactionDetailsModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({
  visible,
  transaction,
  onClose
}: TransactionDetailsModalProps) {
  const { colors: COLORS, theme } = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [copiedId, setCopiedId] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacityAnim, scaleAnim, slideAnim]);

  if (!transaction) return null;

  const isReceived = transaction.type === 'received';
  const isSystem = transaction.fromWalletId === 'SYSTEM';

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle size={20} color={COLORS.SUCCESS} />;
      case 'pending':
        return <Clock size={20} color={COLORS.WARNING} />;
      case 'failed':
        return <XCircle size={20} color={COLORS.ERROR} />;
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

  const getTransactionIcon = () => {
    if (isSystem) {
      return <Banknote size={32} color={COLORS.SUCCESS} />;
    }
    return isReceived ? (
      <ArrowDownLeft size={32} color={COLORS.SUCCESS} />
    ) : (
      <ArrowUpRight size={32} color={COLORS.ERROR} />
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

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En cours';
      case 'failed':
        return 'Échoué';
      default:
        return transaction.status;
    }
  };

  const getTypeText = () => {
    if (isSystem) return 'Fonds ajoutés';
    return isReceived ? 'Paiement reçu' : 'Paiement envoyé';
  };

  const copyToClipboard = async (text: string, type: 'id' | 'wallet') => {
    try {
      await Clipboard.setStringAsync(text);
      
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else if (type === 'wallet') {
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.overlay,
          { 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: opacityAnim 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.container,
            { 
              backgroundColor: COLORS.CARD,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: COLORS.TEXT }]}>
              Détails de la transaction
            </Text>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: COLORS.GRAY_LIGHT }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color={COLORS.GRAY_MEDIUM} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={[styles.content, { minHeight: 300 }]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          >
            {/* Transaction Icon and Amount */}
            <View style={styles.amountSection}>
              <LinearGradient
                colors={getIconBackground()}
                style={styles.iconContainer}
              >
                {getTransactionIcon()}
              </LinearGradient>
              
              <Text style={[styles.amount, { color: isReceived ? COLORS.SUCCESS : COLORS.ERROR }]}>
                {isReceived ? '+' : '-'}{formatAmount(transaction.amount)}
              </Text>
              
              <Text style={[styles.typeText, { color: COLORS.GRAY_MEDIUM }]}>
                {getTypeText()}
              </Text>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              {/* Date */}
              <View style={[styles.detailItem, { backgroundColor: COLORS.BACKGROUND }]}>
                <View style={styles.detailHeader}>
                  <Calendar size={16} color={COLORS.PRIMARY} />
                  <Text style={[styles.detailLabel, { color: COLORS.GRAY_MEDIUM }]}>
                    Date
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: COLORS.TEXT }]}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </View>

              {/* Transaction ID */}
              <View style={[styles.detailItem, { backgroundColor: COLORS.BACKGROUND }]}>
                <View style={styles.detailHeader}>
                  <Hash size={16} color={COLORS.PRIMARY} />
                  <Text style={[styles.detailLabel, { color: COLORS.GRAY_MEDIUM }]}>
                    ID Transaction
                  </Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transaction.id, 'id')}
                    style={styles.copyButton}
                  >
                    {copiedId ? (
                      <CheckCircle size={14} color={COLORS.SUCCESS} />
                    ) : (
                      <Copy size={14} color={COLORS.PRIMARY} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={[styles.detailValue, { color: COLORS.TEXT }]}>
                  {transaction.id}
                </Text>
              </View>

              {/* From/To */}
              <View style={[styles.detailItem, { backgroundColor: COLORS.BACKGROUND }]}>
                <View style={styles.detailHeader}>
                  <User size={16} color={COLORS.PRIMARY} />
                  <Text style={[styles.detailLabel, { color: COLORS.GRAY_MEDIUM }]}>
                    {isSystem ? 'Source' : isReceived ? 'De' : 'À'}
                  </Text>
                  {!isSystem && (
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(
                        isReceived ? transaction.fromWalletId : transaction.toWalletId, 
                        'wallet'
                      )}
                      style={styles.copyButton}
                    >
                      {copiedWallet ? (
                        <CheckCircle size={14} color={COLORS.SUCCESS} />
                      ) : (
                        <Copy size={14} color={COLORS.PRIMARY} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.detailValue, { color: COLORS.TEXT }]}>
                  {isSystem ? 'Système' : 
                   isReceived ? transaction.fromWalletId : transaction.toWalletId}
                </Text>
              </View>

              {/* Description */}
              {transaction.description && (
                <View style={[styles.detailItem, { backgroundColor: COLORS.BACKGROUND }]}>
                  <View style={styles.detailHeader}>
                    <MessageSquare size={16} color={COLORS.PRIMARY} />
                    <Text style={[styles.detailLabel, { color: COLORS.GRAY_MEDIUM }]}>
                      Description
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: COLORS.TEXT }]}>
                    {transaction.description}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    height: height * 0.7,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    ...TYPO.h2,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amount: {
    ...TYPO.h1,
    marginBottom: 8,
  },
  typeText: {
    ...TYPO.body,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 24,
    gap: 8,
  },
  statusText: {
    ...TYPO.caption,
    fontWeight: '600',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailLabel: {
    ...TYPO.caption,
    flex: 1,
  },
  detailValue: {
    ...TYPO.body,
    lineHeight: 20,
  },
  copyButton: {
    padding: 4,
  },
}); 