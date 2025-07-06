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
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { User, UserMode } from '@/types';
import QRGenerator from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import { QrCode, Scan, X, DollarSign, MessageSquare, User as UserIcon, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/utils/colors';
import { useUserMode } from '@/hooks/useUserMode';

const { width } = Dimensions.get('window');

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(WalletService.getCurrentUser());
  const { userMode } = useUserMode();
  const [mode, setMode] = useState<'generate' | 'scan' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverWalletId, setReceiverWalletId] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Réinitialiser le mode si le userMode change
    setMode(null);
  }, [userMode]);

  const generateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!receiverWalletId) {
      Alert.alert('Error', 'Please enter receiver wallet ID');
      return;
    }

    try {
      setGenerating(true);
      const qrString = await WalletService.generatePaymentQR(
        parseFloat(amount),
        description || 'Payment',
        receiverWalletId
      );
      setQrData(qrString);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleScan = async (scannedData: string) => {
    try {
      const transaction = await WalletService.processQRPayment(scannedData);
      
      const isReceived = transaction.type === 'received';
      Alert.alert(
        'Payment Successful!',
        `You ${isReceived ? 'received' : 'sent'} $${transaction.amount}\n\nDescription: ${transaction.description}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setUser(WalletService.getCurrentUser());
              router.push('/(tabs)/index');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process payment');
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setReceiverWalletId('');
    setQrData(null);
    setMode(null);
  };

  const quickAmounts = [10, 25, 50, 100];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please login first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header adaptatif selon le mode */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {userMode === 'buyer' ? 'Buyer Mode' : 'Seller Mode'}
        </Text>
        <LinearGradient
          colors={userMode === 'buyer' 
            ? ['rgba(255, 78, 69, 0.2)', 'rgba(255, 78, 69, 0.1)'] 
            : ['rgba(0, 230, 118, 0.2)', 'rgba(0, 230, 118, 0.1)']
          }
          style={[styles.balanceChip, {
            borderColor: userMode === 'buyer' ? COLORS.WARM_RED : COLORS.SUCCESS
          }]}
        >
          <Text style={[styles.balance, {
            color: userMode === 'buyer' ? COLORS.WARM_RED : COLORS.SUCCESS
          }]}>
            ${user.balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </LinearGradient>
      </View>

      {/* Sélecteur de mode adaptatif */}
      {!mode && (
        <View style={styles.modeSelector}>
          {userMode === 'buyer' ? (
            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => setMode('scan')}
            >
              <LinearGradient
                colors={['#1A1A1A', '#2A2A2A']}
                style={styles.modeButtonGradient}
              >
                <View style={[styles.modeIconContainer, { backgroundColor: 'rgba(255, 78, 69, 0.1)' }]}>
                  <Scan size={32} color={COLORS.WARM_RED} />
                </View>
                <Text style={styles.modeButtonText}>Scan QR to Pay</Text>
                <Text style={styles.modeButtonSubtext}>Scan a QR code to make payment</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => setMode('generate')}
            >
              <LinearGradient
                colors={['#1A1A1A', '#2A2A2A']}
                style={styles.modeButtonGradient}
              >
                <View style={[styles.modeIconContainer, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
                  <QrCode size={32} color={COLORS.SUCCESS} />
                </View>
                <Text style={styles.modeButtonText}>Generate QR to Receive</Text>
                <Text style={styles.modeButtonSubtext}>Create a QR code to receive payment</Text>
              </LinearGradient>
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
        <KeyboardAvoidingView 
          style={styles.generateContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Generate Payment QR</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {!qrData ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <DollarSign size={16} color={COLORS.SUCCESS} /> Amount
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                  <View style={styles.quickAmounts}>
                    {quickAmounts.map((quickAmount) => (
                      <TouchableOpacity
                        key={quickAmount}
                        style={[styles.quickAmountButton, {
                          backgroundColor: 'rgba(0, 230, 118, 0.1)',
                          borderColor: COLORS.SUCCESS
                        }]}
                        onPress={() => setAmount(quickAmount.toString())}
                      >
                        <Text style={[styles.quickAmountText, { color: COLORS.SUCCESS }]}>
                          ${quickAmount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <UserIcon size={16} color={COLORS.SUCCESS} /> Receiver Wallet ID
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={receiverWalletId}
                    onChangeText={setReceiverWalletId}
                    placeholder="Enter receiver's wallet ID"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <MessageSquare size={16} color={COLORS.SUCCESS} /> Description (Optional)
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Payment description"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.generateButton, generating && styles.buttonDisabled]}
                  onPress={generateQR}
                  disabled={generating}
                >
                  <LinearGradient
                    colors={generating ? ['#666', '#555'] : [COLORS.SUCCESS, '#00C853']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.generateButtonText}>
                      {generating ? 'Generating...' : 'Generate QR Code'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>Payment QR Code</Text>
                <Text style={[styles.qrAmount, { color: COLORS.SUCCESS }]}>${amount}</Text>
                <Text style={styles.qrDescription}>{description || 'Payment'}</Text>
                
                <View style={styles.qrCodeWrapper}>
                  <QRGenerator data={qrData} />
                </View>
                
                <Text style={styles.qrInstructions}>
                  Show this QR code to the payer to complete the transaction
                </Text>
                
                <TouchableOpacity 
                  style={[styles.newQrButton, {
                    backgroundColor: 'rgba(0, 230, 118, 0.1)',
                    borderColor: COLORS.SUCCESS
                  }]} 
                  onPress={resetForm}
                >
                  <Text style={[styles.newQrButtonText, { color: COLORS.SUCCESS }]}>
                    Generate New QR
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  balanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  balance: {
    fontSize: 16,
    color: '#00E676',
    fontFamily: 'Inter-SemiBold',
  },
  generateContainer: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quickAmounts: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E676',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 12,
    color: '#00E676',
    fontFamily: 'Inter-Medium',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  qrAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00E676',
    fontFamily: 'Inter-Bold',
  },
  qrDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  qrCodeWrapper: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  newQrButton: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  newQrButtonText: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
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
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  modeButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  modeButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  modeIconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'Inter-SemiBold',
  },
  modeButtonSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    fontFamily: 'Inter-Regular',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 8,
  },
});