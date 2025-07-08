import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Dimensions,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  DollarSign,
  Copy,
  Eye,
  EyeOff,
  User as UserIcon,
  CreditCard,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { CashInMethod, Agent, BankAccount, CashInTransaction, User } from '@/types';
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
import { useQRScanner } from './QRScannerProvider';

const { width: screenWidth } = Dimensions.get('window');

interface CashInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function CashInModal({ visible, onClose, onSuccess }: CashInModalProps) {
  const { colors: COLORS } = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth > 600;
  const isMobile = windowWidth < 400;
  const { openScanner } = useQRScanner();

  // États principaux
  const [selectedMethod, setSelectedMethod] = useState<CashInMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(undefined);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [user, setUser] = useState<User | null>(WalletService.getCurrentUser());

  // États des données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [voucherInfo, setVoucherInfo] = useState<{
    amount: number;
    currency: string;
    isValid: boolean;
  } | undefined>(undefined);

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
      setUser(WalletService.getCurrentUser());
      loadData();
    }
  }, [visible]);

  // Chargement des agents et comptes bancaires
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

  // Gestion du choix de méthode
  const handleMethodSelect = (method: CashInMethod) => {
    setSelectedMethod(method);
    setSelectedAgent(undefined);
    setSelectedBankAccount(undefined);
    setVoucherCode('');
    setVoucherInfo(undefined);
    validation.clearErrors();
  };

  // Gestion de la sélection d'agent
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  // Gestion de la sélection de compte bancaire
  const handleBankAccountSelect = (account: BankAccount) => {
    setSelectedBankAccount(account);
  };

  // Gestion du code voucher
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

  // Gestion du scan QR via le scanner global
  const handleScanVoucher = () => {
    onClose();
    setTimeout(() => {
      openScanner({
        onScan: (scannedData: string) => {
          setVoucherCode(scannedData);
        },
        title: 'Scanner un voucher',
        description: 'Scannez le QR code du voucher',
      });
    }, 350);
  };

  // Validation et traitement du cash-in
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
    if (!isValid) return;
    try {
      setLoading(true);
      const amountValue = parseFloat(amount);
      const feeCalculation = calculateFees(amountValue, selectedMethod!, selectedAgent, selectedBankAccount);
      const cashInTransaction: CashInTransaction = {
        id: `cash_in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletId: user.walletId,
        amount: amountValue,
        method: selectedMethod!,
        status: 'pending',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signature: 'signature_placeholder',
        agentId: selectedAgent?.id,
        voucherCode: selectedMethod === 'voucher' ? voucherCode : undefined,
        bankAccountId: selectedBankAccount?.id,
        fees: feeCalculation.fees,
        syncStatus: 'local'
      };
      await StorageService.saveCashInTransaction(cashInTransaction);
      await processCashInTransaction(cashInTransaction);
    } catch (error) {
      console.error('Erreur lors du cash-in:', error);
      Alert.alert('Erreur', 'Impossible de traiter la demande de cash-in');
    } finally {
      setLoading(false);
    }
  };

  // Orchestration du traitement selon la méthode
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    await StorageService.updateCashInTransactionStatus(transaction.id, 'validated');
    await processCashIn(transaction);
  };
  const simulateBankingTransfer = async (transaction: CashInTransaction) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await StorageService.updateCashInTransactionStatus(transaction.id, 'completed');
    await processCashIn(transaction);
  };
  const processCashIn = async (transaction: CashInTransaction) => {
    if (user) {
      user.balance += transaction.amount;
      await StorageService.updateUser(user);
    }
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
  // Reset du formulaire
  const resetForm = () => {
    setSelectedMethod(null);
    setAmount('');
    setVoucherCode('');
    setSelectedAgent(undefined);
    setSelectedBankAccount(undefined);
    setVoucherInfo(undefined);
    validation.clearErrors();
  };
  // Copier l'ID portefeuille
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
  // Formatage du solde
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

  // Rendu du contenu principal du modal
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
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 24, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sélecteur de méthode */}
        <View style={{ gap: 12 }}>
          <Text style={[TYPO.h3, { color: COLORS.TEXT, marginBottom: 8 }]}>Méthode sélectionnée</Text>
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
            icon={UserIcon}
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
          <View style={{
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: COLORS.CARD,
            borderColor: COLORS.GRAY_LIGHT,
            gap: 12,
          }}>
            <Text style={[TYPO.h3, { color: COLORS.TEXT, marginBottom: 8 }]}>Résumé de la transaction</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[TYPO.body, { color: COLORS.GRAY_MEDIUM }]}>Montant</Text>
              <Text style={[TYPO.body, { color: COLORS.TEXT, fontWeight: '600' }]}>{feeCalculation.amount}€</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[TYPO.body, { color: COLORS.GRAY_MEDIUM }]}>Frais</Text>
              <Text style={[TYPO.body, { color: COLORS.ERROR, fontWeight: '600' }]}>{feeCalculation.fees.toFixed(2)}€</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 12, marginTop: 4 }}>
              <Text style={[TYPO.body, { color: COLORS.TEXT }]}>Total reçu</Text>
              <Text style={[TYPO.body, { color: COLORS.SUCCESS, fontWeight: '600' }]}>{feeCalculation.totalAmount.toFixed(2)}€</Text>
            </View>
            <Text style={[TYPO.caption, { color: COLORS.GRAY_MEDIUM, fontStyle: 'italic', marginTop: 8 }]}>{getFeeDescription(selectedMethod, selectedAgent)}</Text>
            <Text style={[TYPO.caption, { color: COLORS.GRAY_MEDIUM, marginTop: 4 }]}>Délai de traitement: {getProcessingTime(selectedMethod)}</Text>
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

  // Rendu principal du modal
  return (
    <>
      <ModalContainer
        visible={visible}
        onClose={onClose}
        title="Ajouter des fonds"
        subtitle="Choisissez votre méthode de recharge"
        maxWidth={isTablet ? 500 : '98%'}
        maxHeight={Dimensions.get('window').height * 0.8}
      >
        {/* Header avec solde et ID portefeuille */}
        {user && (
          <View
            style={{
              margin: isMobile ? 8 : 20,
              padding: isMobile ? 12 : 24,
              borderRadius: 28,
              // Dégradé ou glassmorphism
              backgroundColor: COLORS.CARD + 'F2',
              shadowColor: COLORS.SHADOW,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 16 : 32,
              borderWidth: 0,
            }}
          >
            {/* Bloc solde */}
            <View style={{ flex: 1, alignItems: isMobile ? 'center' : 'flex-start', justifyContent: 'center' }}>
              <Text style={[TYPO.caption, { color: COLORS.GRAY_MEDIUM, marginBottom: 2, textAlign: isMobile ? 'center' : 'left' }]}>Solde actuel</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: 10 }}>
                <Text style={[TYPO.h1, { color: COLORS.PRIMARY, fontWeight: '700', fontSize: isMobile ? 28 : 32, textAlign: isMobile ? 'center' : 'left', letterSpacing: 0.2 }]}>{formatBalance(user.balance)}</Text>
                <TouchableOpacity
                  onPress={() => setBalanceVisible(!balanceVisible)}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.PRIMARY + '15', alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={balanceVisible ? 'Masquer le solde' : 'Afficher le solde'}
                >
                  {balanceVisible ? (
                    <Eye size={20} color={COLORS.PRIMARY} />
                  ) : (
                    <EyeOff size={20} color={COLORS.PRIMARY} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {/* Bloc ID portefeuille */}
            <View style={{ flex: 1, alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'center', marginTop: isMobile ? 16 : 0 }}>
              <Text style={[TYPO.caption, { color: COLORS.GRAY_MEDIUM, marginBottom: 2, textAlign: isMobile ? 'center' : 'right' }]}>ID Portefeuille</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-end', gap: 8 }}>
                <View style={{
                  backgroundColor: COLORS.PRIMARY + '10',
                  borderRadius: 12,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minWidth: 90,
                }}>
                  <Text style={[TYPO.caption, { color: COLORS.PRIMARY, fontFamily: 'monospace', fontWeight: '600', fontSize: 13 }]}> {user.walletId.slice(0, 8)}...{user.walletId.slice(-8)} </Text>
                </View>
                <TouchableOpacity
                  onPress={copyWalletId}
                  style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.PRIMARY + '15' }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Copier l'ID portefeuille"
                >
                  <Copy size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <View style={{ paddingHorizontal: isMobile ? 8 : 24 }}>
          {renderContent()}
        </View>
      </ModalContainer>
    </>
  );
} 