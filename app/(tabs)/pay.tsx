import React, { useState } from 'react';
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
import { WalletService } from '@/services/WalletService';
import { User } from '@/types';
import QRGenerator from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import { QrCode, Scan, X, DollarSign, MessageSquare, User as UserIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PayScreen() {
  const [user, setUser] = useState<User | null>(WalletService.getCurrentUser());
  const [mode, setMode] = useState<'generate' | 'scan' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverWalletId, setReceiverWalletId] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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
      setMode(null);
      
      const isReceived = transaction.type === 'received';
      Alert.alert(
        'Payment Successful!',
        `You ${isReceived ? 'received' : 'sent'} $${transaction.amount}\n\nDescription: ${transaction.description}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setUser(WalletService.getCurrentUser());
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
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <LinearGradient
          colors={['rgba(0, 230, 118, 0.2)', 'rgba(0, 230, 118, 0.1)']}
          style={styles.balanceChip}
        >
          <Text style={styles.balance}>
            ${user.balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </LinearGradient>
      </View>

      {!mode && (
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => setMode('generate')}
          >
            <LinearGradient
              colors={['#1A1A1A', '#2A2A2A']}
              style={styles.modeButtonGradient}
            >
              <View style={styles.modeIconContainer}>
                <QrCode size={32} color="#00E676" />
              </View>
              <Text style={styles.modeButtonText}>Generate QR</Text>
              <Text style={styles.modeButtonSubtext}>Create payment request</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => setMode('scan')}
          >
            <LinearGradient
              colors={['#1A1A1A', '#2A2A2A']}
              style={styles.modeButtonGradient}
            >
              <View style={styles.modeIconContainer}>
                <Scan size={32} color="#00E676" />
              </View>
              <Text style={styles.modeButtonText}>Scan QR</Text>
              <Text style={styles.modeButtonSubtext}>Pay with QR code</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

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
                    <DollarSign size={16} color="#00E676" /> Amount
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
                        style={styles.quickAmountButton}
                        onPress={() => setAmount(quickAmount.toString())}
                      >
                        <Text style={styles.quickAmountText}>${quickAmount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <UserIcon size={16} color="#00E676" /> Receiver Wallet ID
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
                    <MessageSquare size={16} color="#00E676" /> Description (Optional)
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
                    colors={generating ? ['#666', '#555'] : ['#00E676', '#00C853']}
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
                <Text style={styles.qrAmount}>${amount}</Text>
                <Text style={styles.qrDescription}>{description || 'Payment'}</Text>
                
                <View style={styles.qrCodeWrapper}>
                  <QRGenerator data={qrData} />
                </View>
                
                <Text style={styles.qrInstructions}>
                  Show this QR code to the payer to complete the transaction
                </Text>
                
                <TouchableOpacity style={styles.newQrButton} onPress={resetForm}>
                  <Text style={styles.newQrButtonText}>Generate New QR</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {mode === 'scan' && (
        <Modal visible={true} animationType="slide">
          <QRScanner
            onScan={handleScan}
            onClose={() => setMode(null)}
          />
        </Modal>
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
  modeSelector: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  modeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modeButtonGradient: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 20,
  },
  modeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  modeButtonSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'Inter-Regular',
  },
  generateContainer: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 8,
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
});