import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  useWindowDimensions,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { User, UserMode } from '@/types';
import QRGenerator from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import { 
  QrCode, 
  Scan, 
  X, 
  DollarSign, 
  MessageSquare, 
  User as UserIcon, 
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  CreditCard,
  Settings,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserMode } from '@/hooks/useUserMode';
import Logo from '@/components/Logo';

const { width: screenWidth } = Dimensions.get('window');

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors: COLORS, theme } = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(WalletService.getCurrentUser());
  const { userMode, toggleUserMode } = useUserMode();
  const [mode, setMode] = useState<'generate' | 'scan' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverWalletId, setReceiverWalletId] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    receiverWalletId?: string;
  }>({});

  const isTablet = windowWidth > 768;
  const isSmallScreen = windowWidth < 375;

  useEffect(() => {
    // Réinitialiser le mode si le userMode change
    setMode(null);
  }, [userMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    setUser(WalletService.getCurrentUser());
    setRefreshing(false);
  };

  const validateForm = () => {
    const newErrors: { amount?: string; receiverWalletId?: string } = {};

    // Validation du montant
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Le montant est requis';
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    } else if (parseFloat(amount) > 10000) {
      newErrors.amount = 'Le montant ne peut pas dépasser 10 000€';
    }

    // Validation de l'ID destinataire
    if (!receiverWalletId || receiverWalletId.trim() === '') {
      newErrors.receiverWalletId = 'L\'ID du destinataire est requis';
    } else if (receiverWalletId.length < 10) {
      newErrors.receiverWalletId = 'L\'ID du destinataire doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateQR = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setGenerating(true);
      const qrString = await WalletService.generatePaymentQR(
        parseFloat(amount),
        description || 'Paiement',
        receiverWalletId
      );
      setQrData(qrString);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la génération du QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleScan = async (scannedData: string) => {
    try {
      const transaction = await WalletService.processQRPayment(scannedData);
      
      const isReceived = transaction.type === 'received';
      Alert.alert(
        'Paiement réussi !',
        `Vous avez ${isReceived ? 'reçu' : 'envoyé'} ${transaction.amount.toFixed(2)}€\n\nDescription: ${transaction.description}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setUser(WalletService.getCurrentUser());
              router.push('/(tabs)');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec du traitement du paiement');
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setReceiverWalletId('');
    setQrData(null);
    setMode(null);
    setErrors({});
  };

  const copyWalletId = async () => {
    if (user) {
      try {
        // Implémenter la copie du wallet ID
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

  const quickAmounts = [10, 25, 50, 100];

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Logo size={64} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            Veuillez vous connecter d'abord
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.headerTitle}>Paiement</Text>
              <Text style={styles.headerSubtitle}>
                {userMode === 'buyer' ? 'Mode Acheteur' : 'Mode Vendeur'}
              </Text>
              <View style={styles.balanceContainer}>
                <Text style={[styles.balanceText, { color: COLORS.WHITE + 'CC' }]}>
                  Solde: {formatBalance(user.balance)}
                </Text>
                <TouchableOpacity 
                  onPress={() => setBalanceVisible(!balanceVisible)}
                  style={styles.eyeButton}
                >
                  {balanceVisible ? (
                    <Eye size={14} color={COLORS.WHITE + 'CC'} />
                  ) : (
                    <EyeOff size={14} color={COLORS.WHITE + 'CC'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <Settings size={20} color={COLORS.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={toggleUserMode}
              >
                <Zap size={20} color={COLORS.WHITE} />
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
        {/* Sélecteur de mode adaptatif */}
        {!mode && (
          <View style={styles.modeSelector}>
            {userMode === 'buyer' ? (
              <TouchableOpacity
                style={[styles.modeButton, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}
                onPress={() => setMode('scan')}
              >
                <LinearGradient
                  colors={[COLORS.ERROR + '15', COLORS.ERROR + '05']}
                  style={styles.modeIconContainer}
                >
                  <Scan size={32} color={COLORS.ERROR} />
                </LinearGradient>
                <Text style={[styles.modeButtonText, { color: COLORS.TEXT }]}>
                  Scanner QR pour Payer
                </Text>
                <Text style={[styles.modeButtonSubtext, { color: COLORS.GRAY_MEDIUM }]}>
                  Scannez un QR code pour effectuer un paiement
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.modeButton, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}
                onPress={() => setMode('generate')}
              >
                <LinearGradient
                  colors={[COLORS.SUCCESS + '15', COLORS.SUCCESS + '05']}
                  style={styles.modeIconContainer}
                >
                  <QrCode size={32} color={COLORS.SUCCESS} />
                </LinearGradient>
                <Text style={[styles.modeButtonText, { color: COLORS.TEXT }]}>
                  Générer QR pour Recevoir
                </Text>
                <Text style={[styles.modeButtonSubtext, { color: COLORS.GRAY_MEDIUM }]}>
                  Créez un QR code pour recevoir un paiement
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Mode Scan (Buyer) */}
        {mode === 'scan' && (
          <Modal visible={true} animationType="slide">
            <QRScanner
              onScan={handleScan}
              onClose={() => setMode(null)}
            />
          </Modal>
        )}

        {/* Mode Generate (Seller) */}
        {mode === 'generate' && (
          <View style={styles.generateContainer}>
            <ScrollView 
              style={styles.form} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              {/* Header du formulaire */}
              <View style={styles.formHeader}>
                <View style={styles.formHeaderContent}>
                  <View style={styles.formHeaderLeft}>
                    <View style={[styles.formIcon, { backgroundColor: COLORS.SUCCESS + '15' }]}>
                      <QrCode size={24} color={COLORS.SUCCESS} />
                    </View>
                    <View style={styles.formHeaderText}>
                      <Text style={[styles.formTitle, { color: COLORS.TEXT }]}>
                        Générer QR de Paiement
                      </Text>
                      <Text style={[styles.formSubtitle, { color: COLORS.GRAY_MEDIUM }]}>
                        Créez un QR code pour recevoir un paiement
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={resetForm} 
                    style={[styles.closeButton, { backgroundColor: COLORS.GRAY_LIGHT }]}
                  >
                    <X size={20} color={COLORS.GRAY_MEDIUM} />
                  </TouchableOpacity>
                </View>
              </View>

              {!qrData ? (
                <View style={styles.formBody}>
                  {/* Section Montant */}
                  <View style={[styles.formSection, { 
                    backgroundColor: COLORS.CARD, 
                    borderColor: COLORS.GRAY_LIGHT 
                  }]}>
                    <View style={styles.sectionHeader}>
                      <DollarSign size={20} color={COLORS.SUCCESS} />
                      <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
                        Montant du Paiement
                      </Text>
                    </View>
                    
                    <View style={[styles.amountInputContainer, { 
                      backgroundColor: COLORS.BACKGROUND, 
                      borderColor: errors.amount ? COLORS.ERROR : COLORS.GRAY_LIGHT 
                    }]}>
                      <Text style={[styles.currencySymbol, { color: COLORS.GRAY_MEDIUM }]}>
                        €
                      </Text>
                      <TextInput
                        style={[styles.amountInput, { color: COLORS.TEXT }]}
                        value={amount}
                        onChangeText={(text) => {
                          setAmount(text);
                          if (errors.amount) {
                            setErrors(prev => ({ ...prev, amount: undefined }));
                          }
                        }}
                        placeholder="0.00"
                        placeholderTextColor={COLORS.GRAY_MEDIUM}
                        keyboardType="numeric"
                        textAlign="center"
                      />
                    </View>

                    {errors.amount && (
                      <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
                          {errors.amount}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.quickAmounts, { 
                      flexDirection: isTablet ? 'row' : 'column',
                      gap: isTablet ? 8 : 8 
                    }]}>
                      {quickAmounts.map((quickAmount) => (
                        <TouchableOpacity
                          key={quickAmount}
                          style={[styles.quickAmountButton, {
                            backgroundColor: amount === quickAmount.toString() 
                              ? COLORS.SUCCESS 
                              : COLORS.SUCCESS + '15',
                            borderColor: COLORS.SUCCESS,
                            width: isTablet ? undefined : '100%'
                          }]}
                          onPress={() => {
                            setAmount(quickAmount.toString());
                            if (errors.amount) {
                              setErrors(prev => ({ ...prev, amount: undefined }));
                            }
                          }}
                        >
                          <Text style={[styles.quickAmountText, { 
                            color: amount === quickAmount.toString() 
                              ? COLORS.WHITE 
                              : COLORS.SUCCESS 
                          }]}>
                            {quickAmount}€
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Section Destinataire */}
                  <View style={[styles.formSection, { 
                    backgroundColor: COLORS.CARD, 
                    borderColor: COLORS.GRAY_LIGHT 
                  }]}>
                    <View style={styles.sectionHeader}>
                      <UserIcon size={20} color={COLORS.SUCCESS} />
                      <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
                        Destinataire
                      </Text>
                    </View>
                    
                    <View style={[styles.inputContainer, { 
                      backgroundColor: COLORS.BACKGROUND, 
                      borderColor: errors.receiverWalletId ? COLORS.ERROR : COLORS.GRAY_LIGHT 
                    }]}>
                      <TextInput
                        style={[styles.input, { color: COLORS.TEXT }]}
                        value={receiverWalletId}
                        onChangeText={(text) => {
                          setReceiverWalletId(text);
                          if (errors.receiverWalletId) {
                            setErrors(prev => ({ ...prev, receiverWalletId: undefined }));
                          }
                        }}
                        placeholder="Entrez l'ID du portefeuille destinataire"
                        placeholderTextColor={COLORS.GRAY_MEDIUM}
                        autoCapitalize="none"
                      />
                    </View>

                    {errors.receiverWalletId && (
                      <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
                          {errors.receiverWalletId}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Section Description */}
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                      <MessageSquare size={20} color={COLORS.SUCCESS} />
                      <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
                        Description (Optionnel)
                      </Text>
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.textArea, { color: COLORS.TEXT }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Description du paiement..."
                        placeholderTextColor={COLORS.GRAY_MEDIUM}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  {/* Bouton de génération */}
                  <TouchableOpacity
                    style={[styles.generateButton, generating && styles.buttonDisabled]}
                    onPress={generateQR}
                    disabled={generating}
                  >
                    <LinearGradient
                      colors={generating 
                        ? [COLORS.GRAY_MEDIUM, COLORS.GRAY_LIGHT] 
                        : [COLORS.SUCCESS, COLORS.SUCCESS + 'DD']
                      }
                      style={styles.buttonGradient}
                    >
                      {generating ? (
                        <View style={styles.loadingContainer}>
                          <Activity size={20} color={COLORS.WHITE} />
                          <Text style={styles.generateButtonText}>
                            Génération...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <QrCode size={24} color={COLORS.WHITE} />
                          <Text style={styles.generateButtonText}>
                            Générer QR Code
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.qrContainer}>
                  <View style={styles.qrHeader}>
                    <View style={[styles.qrIcon, { backgroundColor: COLORS.SUCCESS + '15' }]}>
                      <QrCode size={32} color={COLORS.SUCCESS} />
                    </View>
                    <Text style={[styles.qrTitle, { color: COLORS.TEXT }]}>
                      QR Code de Paiement
                    </Text>
                  </View>
                  
                  <View style={styles.qrDetails}>
                    <Text style={[styles.qrAmount, { color: COLORS.SUCCESS }]}>
                      {amount}€
                    </Text>
                    <Text style={[styles.qrDescription, { color: COLORS.GRAY_MEDIUM }]}>
                      {description || 'Paiement'}
                    </Text>
                  </View>
                  
                  <View style={styles.qrCodeWrapper}>
                    <QRGenerator data={qrData} />
                  </View>
                  
                  <View style={styles.qrInstructions}>
                    <Text style={[styles.qrInstructionsText, { color: COLORS.GRAY_MEDIUM }]}>
                      Montrez ce QR code au payeur pour compléter la transaction
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.newQrButton, {
                      backgroundColor: COLORS.SUCCESS + '15',
                      borderColor: COLORS.SUCCESS
                    }]} 
                    onPress={resetForm}
                  >
                    <QrCode size={16} color={COLORS.SUCCESS} />
                    <Text style={[styles.newQrButtonText, { color: COLORS.SUCCESS }]}>
                      Générer Nouveau QR
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}
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
    paddingBottom: 100,
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
    marginBottom: 16,
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
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  balanceText: {
    ...TYPO.caption,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 4,
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
  modeSelector: {
    marginTop: 24,
    marginBottom: 32,
  },
  modeButton: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  modeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modeButtonText: {
    ...TYPO.h3,
    marginBottom: 8,
    textAlign: 'center',
  },
  modeButtonSubtext: {
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  generateContainer: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  formHeader: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  formHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  formIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  formHeaderText: {
    flex: 1,
  },
  formTitle: {
    ...TYPO.h2,
    marginBottom: 4,
  },
  formSubtitle: {
    ...TYPO.caption,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBody: {
    gap: 16,
  },
  formSection: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
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
    gap: 12,
  },
  sectionTitle: {
    ...TYPO.h3,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  currencySymbol: {
    ...TYPO.h2,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    ...TYPO.h1,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAmountText: {
    ...TYPO.caption,
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  input: {
    ...TYPO.body,
  },
  textArea: {
    ...TYPO.body,
    height: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    ...TYPO.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  qrContainer: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrTitle: {
    ...TYPO.h2,
    textAlign: 'center',
  },
  qrDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrAmount: {
    ...TYPO.h1,
    marginBottom: 8,
  },
  qrDescription: {
    ...TYPO.body,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    alignSelf: 'center',
  },
  qrInstructions: {
    marginVertical: 20,
  },
  qrInstructionsText: {
    ...TYPO.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  newQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 8,
  },
  newQrButtonText: {
    ...TYPO.caption,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    ...TYPO.caption,
    fontStyle: 'italic',
  },
});