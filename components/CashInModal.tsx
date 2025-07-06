import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  User,
  CreditCard,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { CashInMethod, Agent, Voucher, BankAccount, CashInTransaction } from '@/types';
import { StorageService } from '@/utils/storage';
import { WalletService } from '@/services/WalletService';
import QRScanner from './QRScanner';
import * as Clipboard from 'expo-clipboard';

// Nouveaux composants réutilisables
import ModalContainer from './ui/ModalContainer';
import SectionCard from './ui/SectionCard';
import AmountInput from './ui/AmountInput';
import ActionButton from './ui/ActionButton';
import MethodSelector from './cash-in/MethodSelector';
import AgentList from './cash-in/AgentList';
import VoucherInput from './cash-in/VoucherInput';
import BankAccountList from './cash-in/BankAccountList';

// Hooks personnalisés
import { useCashInValidation } from '@/hooks/useCashInValidation';
import { useCashInFees } from '@/hooks/useCashInFees';




const { width: screenWidth } = Dimensions.get('window');

interface CashInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function CashInModal({ visible, onClose, onSuccess }: CashInModalProps) {
  const { colors: COLORS, theme } = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  
  // États principaux
  const [selectedMethod, setSelectedMethod] = useState<CashInMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(undefined);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // États des données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [voucherInfo, setVoucherInfo] = useState<{
    amount: number;
    currency: string;
    isValid: boolean;
  } | undefined>(undefined);

  const isTablet = windowWidth > 768;
  const user = WalletService.getCurrentUser();

  // Hooks personnalisés
  const validation = useCashInValidation({
    minAmount: 1,
    maxAmount: 10000,
    requireAgent: selectedMethod === 'agent',
    requireVoucher: selectedMethod === 'voucher',
    requireBankAccount: selectedMethod === 'banking',
  });

  const { calculateFees, getFeeDescription, getProcessingTime } = useCashInFees();

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [agentsData, bankAccountsData] = await Promise.all([
        StorageService.getActiveAgents(),
        StorageService.getBankAccounts(user?.walletId || '')
      ]);
      setAgents(agentsData);
      setBankAccounts(bankAccountsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleMethodSelect = (method: CashInMethod) => {
    setSelectedMethod(method);
    setSelectedAgent(undefined);
    setSelectedBankAccount(undefined);
    setVoucherCode('');
    setVoucherInfo(undefined);
    validation.clearErrors();
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleBankAccountSelect = (account: BankAccount) => {
    setSelectedBankAccount(account);
  };

  const handleVoucherCodeChange = async (code: string) => {
    setVoucherCode(code);
    if (code.length >= 6) {
      try {
        const voucher = await StorageService.getVoucherByCode(code);
        if (voucher && !voucher.isUsed && new Date() < voucher.expiresAt) {
          setVoucherInfo({
            amount: voucher.amount,
            currency: voucher.currency,
            isValid: true,
          });
          setAmount(voucher.amount.toString());
        } else {
          setVoucherInfo(undefined);
        }
      } catch (error) {
        setVoucherInfo(undefined);
      }
    } else {
      setVoucherInfo(undefined);
    }
  };

  const handleScanVoucher = () => {
    setShowScanner(true);
  };

  const handleScanResult = async (scannedData: string) => {
    try {
      const voucher = await StorageService.getVoucherByCode(scannedData);
      if (voucher && !voucher.isUsed && new Date() < voucher.expiresAt) {
        setVoucherCode(scannedData);
        setAmount(voucher.amount.toString());
        setVoucherInfo({
          amount: voucher.amount,
          currency: voucher.currency,
          isValid: true,
        });
      } else {
        Alert.alert('Voucher invalide', 'Ce voucher n\'est pas valide ou a déjà été utilisé');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider le voucher');
    }
    setShowScanner(false);
  };

  const handleCashIn = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    const isValid = validation.validateForm({
      amount,
      method: selectedMethod,
      agentId: selectedAgent?.id,
      voucherCode,
      bankAccountId: selectedBankAccount?.id,
    });

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      const amountValue = parseFloat(amount);
      
      // Calculer les frais
      const feeCalculation = calculateFees(amountValue, selectedMethod!, selectedAgent, selectedBankAccount);
      
      // Créer la transaction d'alimentation
      const cashInTransaction: CashInTransaction = {
        id: `cash_in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletId: user.walletId,
        amount: amountValue,
        method: selectedMethod!,
        status: 'pending',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        signature: 'signature_placeholder', // À implémenter avec cryptographie
        agentId: selectedAgent?.id,
        voucherCode: selectedMethod === 'voucher' ? voucherCode : undefined,
        bankAccountId: selectedBankAccount?.id,
        fees: feeCalculation.fees,
        syncStatus: 'local'
      };

      // Sauvegarder la transaction
      await StorageService.saveCashInTransaction(cashInTransaction);

      // Traiter selon la méthode
      await processCashInTransaction(cashInTransaction);

    } catch (error) {
      console.error('Erreur lors du cash-in:', error);
      Alert.alert('Erreur', 'Impossible de traiter la demande de cash-in');
    } finally {
      setLoading(false);
    }
  };

  const processCashInTransaction = async (transaction: CashInTransaction) => {
    try {
      switch (transaction.method) {
        case 'agent':
          await simulateAgentValidation(transaction);
          break;
        case 'voucher':
          await StorageService.markVoucherAsUsed(transaction.voucherCode!, user!.walletId);
          await processCashIn(transaction);
          break;
        case 'banking':
          await simulateBankingTransfer(transaction);
          break;
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      throw error;
    }
  };

  const simulateAgentValidation = async (transaction: CashInTransaction) => {
    // Simuler la validation par l'agent
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await StorageService.updateCashInTransactionStatus(transaction.id, 'validated');
    await processCashIn(transaction);
  };

  const simulateBankingTransfer = async (transaction: CashInTransaction) => {
    // Simuler le virement bancaire
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await StorageService.updateCashInTransactionStatus(transaction.id, 'completed');
    await processCashIn(transaction);
  };

  const processCashIn = async (transaction: CashInTransaction) => {
    // Mettre à jour le solde utilisateur
    if (user) {
      user.balance += transaction.amount;
      await StorageService.updateUser(user);
    }

    // Mettre à jour le statut de la transaction
    await StorageService.updateCashInTransactionStatus(transaction.id, 'completed');

    Alert.alert(
      'Cash-in réussi !',
      `${transaction.amount}€ ont été ajoutés à votre portefeuille`,
      [
        {
          text: 'OK',
          onPress: () => {
            onSuccess(transaction.amount);
            resetForm();
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setAmount('');
    setVoucherCode('');
    setSelectedAgent(undefined);
    setSelectedBankAccount(undefined);
    setVoucherInfo(undefined);
    setShowScanner(false);
    validation.clearErrors();
  };

  const copyWalletId = async () => {
    if (user) {
      try {
        await Clipboard.setStringAsync(user.walletId);
        Alert.alert('Copié', 'ID du portefeuille copié dans le presse-papiers');
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de copier l\'ID du portefeuille');
      }
    }
  };

  const formatBalance = (balance: number) => {
    if (balanceVisible) {
      return balance.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return '••••••••';
  };

  const renderContent = () => {
    if (!selectedMethod) {
      return (
        <MethodSelector
          selectedMethod={selectedMethod}
          onMethodSelect={handleMethodSelect}
        />
      );
    }

    const feeCalculation = amount ? calculateFees(parseFloat(amount), selectedMethod, selectedAgent, selectedBankAccount) : null;

    return (
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Sélecteur de méthode */}
        <View style={styles.methodSection}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Méthode sélectionnée
          </Text>
          <MethodSelector
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelect}
          />
        </View>

        {/* Saisie du montant */}
        <SectionCard
          icon={DollarSign}
          iconColor={COLORS.PRIMARY}
          title="Montant à ajouter"
        >
          <AmountInput
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              validation.clearFieldError('amount');
            }}
            error={validation.errors.amount}
            quickAmounts={[10, 25, 50, 100]}
          />
        </SectionCard>

        {/* Sélection spécifique selon la méthode */}
        {selectedMethod === 'agent' && (
          <SectionCard
            icon={User}
            iconColor={COLORS.ERROR}
            title="Sélectionner un agent"
          >
            <AgentList
              agents={agents}
              selectedAgent={selectedAgent}
              onAgentSelect={handleAgentSelect}
            />
          </SectionCard>
        )}

        {selectedMethod === 'voucher' && (
          <VoucherInput
            voucherCode={voucherCode}
            onVoucherCodeChange={handleVoucherCodeChange}
            onScanVoucher={handleScanVoucher}
            error={validation.errors.voucherCode}
            voucherInfo={voucherInfo}
          />
        )}

        {selectedMethod === 'banking' && (
          <SectionCard
            icon={CreditCard}
            iconColor={COLORS.SUCCESS}
            title="Compte bancaire"
          >
            <BankAccountList
              bankAccounts={bankAccounts}
              selectedAccount={selectedBankAccount}
              onAccountSelect={handleBankAccountSelect}
            />
          </SectionCard>
        )}

        {/* Résumé et frais */}
        {amount && feeCalculation && (
          <View style={[styles.summaryCard, { 
            backgroundColor: COLORS.CARD, 
            borderColor: COLORS.GRAY_LIGHT 
          }]}>
            <Text style={[styles.summaryTitle, { color: COLORS.TEXT }]}>
              Résumé de la transaction
            </Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.GRAY_MEDIUM }]}>
                Montant
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.TEXT }]}>
                {feeCalculation.amount}€
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.GRAY_MEDIUM }]}>
                Frais
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.ERROR }]}>
                {feeCalculation.fees.toFixed(2)}€
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, { color: COLORS.TEXT }]}>
                Total reçu
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.SUCCESS }]}>
                {feeCalculation.totalAmount.toFixed(2)}€
              </Text>
            </View>
            
            <Text style={[styles.feeDescription, { color: COLORS.GRAY_MEDIUM }]}>
              {getFeeDescription(selectedMethod, selectedAgent)}
            </Text>
            
            <Text style={[styles.processingTime, { color: COLORS.GRAY_MEDIUM }]}>
              Délai de traitement: {getProcessingTime(selectedMethod)}
            </Text>
          </View>
        )}

        {/* Bouton de validation */}
        <ActionButton
          title="Confirmer le cash-in"
          onPress={handleCashIn}
          loading={loading}
          disabled={!amount || !selectedMethod}
          variant="success"
          fullWidth
        />
      </ScrollView>
    );
  };

  return (
    <>
      <ModalContainer
        visible={visible}
        onClose={onClose}
        title="Ajouter des fonds"
        subtitle="Choisissez votre méthode de recharge"
        maxHeight={Dimensions.get('window').height * 0.9}
      >
        {/* Header avec solde */}
        {user && (
          <View style={[styles.balanceHeader, { 
            backgroundColor: COLORS.CARD, 
            borderColor: COLORS.GRAY_LIGHT 
          }]}>
            <View style={styles.balanceInfo}>
              <Text style={[styles.balanceLabel, { color: COLORS.GRAY_MEDIUM }]}>
                Solde actuel
              </Text>
              <View style={styles.balanceRow}>
                <Text style={[styles.balanceAmount, { color: COLORS.TEXT }]}>
                  {formatBalance(user.balance)}
                </Text>
                <TouchableOpacity 
                  onPress={() => setBalanceVisible(!balanceVisible)}
                  style={styles.eyeButton}
                >
                  {balanceVisible ? (
                    <Eye size={16} color={COLORS.GRAY_MEDIUM} />
                  ) : (
                    <EyeOff size={16} color={COLORS.GRAY_MEDIUM} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.walletInfo}>
              <Text style={[styles.walletLabel, { color: COLORS.GRAY_MEDIUM }]}>
                ID Portefeuille
              </Text>
              <View style={styles.walletRow}>
                <Text style={[styles.walletId, { color: COLORS.TEXT }]}>
                  {user.walletId.slice(0, 8)}...{user.walletId.slice(-8)}
                </Text>
                <TouchableOpacity 
                  onPress={copyWalletId}
                  style={[styles.copyButton, { backgroundColor: COLORS.PRIMARY + '15' }]}
                >
                  <Copy size={14} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {renderContent()}
      </ModalContainer>

      {/* Scanner QR pour vouchers */}
      {showScanner && (
        <QRScanner
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  methodSection: {
    gap: 12,
  },
  sectionTitle: {
    ...TYPO.h3,
    marginBottom: 8,
  },
  balanceHeader: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    ...TYPO.caption,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    ...TYPO.h2,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 4,
  },
  walletInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  walletLabel: {
    ...TYPO.caption,
    marginBottom: 4,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletId: {
    ...TYPO.caption,
    fontFamily: 'monospace',
  },
  copyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  summaryTitle: {
    ...TYPO.h3,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...TYPO.body,
  },
  summaryValue: {
    ...TYPO.body,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  feeDescription: {
    ...TYPO.caption,
    fontStyle: 'italic',
    marginTop: 8,
  },
  processingTime: {
    ...TYPO.caption,
    marginTop: 4,
  },
}); 