import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { User, Eye, EyeOff, Lock, Smartphone, CreditCard, AlertCircle } from 'lucide-react-native';
import Logo from '@/components/Logo';
import { TYPO } from '@/utils/typography';
import { useThemeColors } from '@/hooks/useThemeColors';
import CustomAlert from '@/components/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import SuccessNotification from '@/components/SuccessNotification';

export default function AuthScreen() {
  const router = useRouter();
  const { colors: COLORS } = useThemeColors();
  const { showError, alertConfig, isVisible, hideAlert } = useCustomAlert();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  
  // Success notification state
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdWalletId, setCreatedWalletId] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [walletId, setWalletId] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation en temps réel pour le téléphone
  const [phoneValidationTimer, setPhoneValidationTimer] = useState<number | null>(null);

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (phoneValidationTimer) {
        clearTimeout(phoneValidationTimer);
      }
    };
  }, [phoneValidationTimer]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (isLogin) {
      if (!walletId.trim()) {
        newErrors.walletId = 'L\'ID Wallet est requis';
      }
      if (!pin.trim()) {
        newErrors.pin = 'Le PIN est requis';
      } else if (pin.length < 4) {
        newErrors.pin = 'Le PIN doit contenir au moins 4 chiffres';
      }
    } else {
      if (!name.trim()) {
        newErrors.name = 'Le nom complet est requis';
      }
      if (!phone.trim()) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else if (phone.length < 8) {
        newErrors.phone = 'Le numéro de téléphone doit contenir au moins 8 chiffres';
      }
      if (!pin.trim()) {
        newErrors.pin = 'Le PIN est requis';
      } else if (pin.length < 4) {
        newErrors.pin = 'Le PIN doit contenir au moins 4 chiffres';
      }
      if (!confirmPin.trim()) {
        newErrors.confirmPin = 'La confirmation du PIN est requise';
      } else if (pin !== confirmPin) {
        newErrors.confirmPin = 'Les PIN ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const handleAuth = async () => {
    if (loading) return;

    clearErrors();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        await WalletService.loginWallet(walletId, pin);
        router.replace('/(tabs)');
      } else {
        const user = await WalletService.createWallet(name, phone, pin);
        setCreatedWalletId(user.walletId);
        setSuccessVisible(true);
      }
    } catch (error: any) {
      // Pour les erreurs serveur, on utilise notre alerte personnalisée
      showError('Erreur', error.message || 'Échec de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setPhone('');
    setWalletId('');
    setPin('');
    setConfirmPin('');
    clearErrors();
  };

  const handleContinue = () => {
    setSuccessVisible(false);
    router.replace('/(tabs)');
  };

  const renderInput = (icon: React.ReactNode, placeholder: string, value: string, onChangeText: (text: string) => void, fieldName: string, options: any = {}) => (
    <View style={styles.inputGroup}>
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: COLORS.CARD, 
          borderColor: errors[fieldName] ? COLORS.ERROR : COLORS.GRAY_LIGHT 
        }
      ]}>
        <View style={styles.inputIcon}>
          {icon}
        </View>
        <TextInput
          style={[styles.input, { color: COLORS.TEXT }]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (errors[fieldName]) {
              setErrors(prev => ({ ...prev, [fieldName]: '' }));
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_MEDIUM}
          {...options}
        />
      </View>
      {errors[fieldName] && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={COLORS.ERROR} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            {errors[fieldName]}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPasswordInput = (icon: React.ReactNode, placeholder: string, value: string, onChangeText: (text: string) => void, showPassword: boolean, setShowPassword: (show: boolean) => void, fieldName: string) => (
    <View style={styles.inputGroup}>
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: COLORS.CARD, 
          borderColor: errors[fieldName] ? COLORS.ERROR : COLORS.GRAY_LIGHT 
        }
      ]}>
        <View style={styles.inputIcon}>
          {icon}
        </View>
        <TextInput
          style={[styles.input, { color: COLORS.TEXT, flex: 1 }]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (errors[fieldName]) {
              setErrors(prev => ({ ...prev, [fieldName]: '' }));
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_MEDIUM}
          secureTextEntry={!showPassword}
          keyboardType="numeric"
          maxLength={6}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} color={COLORS.GRAY_MEDIUM} /> : <Eye size={20} color={COLORS.GRAY_MEDIUM} />}
        </TouchableOpacity>
      </View>
      {errors[fieldName] && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={COLORS.ERROR} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            {errors[fieldName]}
          </Text>
        </View>
      )}
    </View>
  );

  const validatePhoneUniqueness = async (phoneNumber: string) => {
    if (!phoneNumber.trim()) return;
    
    try {
      const exists = await WalletService.checkPhoneExists(phoneNumber);
      if (exists) {
        setErrors(prev => ({ ...prev, phone: 'Ce numéro de téléphone est déjà utilisé' }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    } catch (error) {
      console.error('Erreur lors de la validation du téléphone:', error);
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    
    // Effacer l'erreur précédente
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
    
    // Annuler le timer précédent
    if (phoneValidationTimer) {
      clearTimeout(phoneValidationTimer);
    }
    
    // Débouncer la validation
    if (text.trim().length >= 8) {
      const timer = setTimeout(() => {
        validatePhoneUniqueness(text);
      }, 500);
      setPhoneValidationTimer(timer);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <StatusBar barStyle={COLORS.BACKGROUND === '#FFFFFF' ? 'dark-content' : 'light-content'} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Logo size={120} />
            <Text style={[TYPO.h1, { color: COLORS.TEXT, marginTop: 24 }]}>
              {isLogin ? 'Bon retour !' : 'Créer un wallet'}
            </Text>
            <Text style={[TYPO.body, { color: COLORS.GRAY_MEDIUM, textAlign: 'center', marginTop: 8 }]}>
              {isLogin 
                ? 'Connectez-vous à votre wallet OffliPay' 
                : 'Créez votre wallet pour commencer à payer hors ligne'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <>
                {renderInput(
                  <User size={20} color={COLORS.GRAY_MEDIUM} />,
                  'Nom complet',
                  name,
                  setName,
                  'name',
                  { autoCapitalize: 'words' }
                )}
                
                {renderInput(
                  <Smartphone size={20} color={COLORS.GRAY_MEDIUM} />,
                  'Numéro de téléphone',
                  phone,
                  handlePhoneChange,
                  'phone',
                  { keyboardType: 'phone-pad' }
                )}
              </>
            )}

            {isLogin && 
              renderInput(
                <CreditCard size={20} color={COLORS.GRAY_MEDIUM} />,
                'ID Wallet',
                walletId,
                setWalletId,
                'walletId',
                { autoCapitalize: 'none' }
              )
            }

            {renderPasswordInput(
              <Lock size={20} color={COLORS.GRAY_MEDIUM} />,
              'PIN (4-6 chiffres)',
              pin,
              setPin,
              showPin,
              setShowPin,
              'pin'
            )}

            {!isLogin && 
              renderPasswordInput(
                <Lock size={20} color={COLORS.GRAY_MEDIUM} />,
                'Confirmer le PIN',
                confirmPin,
                setConfirmPin,
                showConfirmPin,
                setShowConfirmPin,
                'confirmPin'
              )
            }

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                loading && styles.buttonDisabled,
                { backgroundColor: COLORS.PRIMARY }
              ]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, { color: COLORS.WHITE }]}>
                {loading ? 'Veuillez patienter...' : isLogin ? 'Se connecter' : 'Créer le wallet'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Mode */}
            <TouchableOpacity 
              style={styles.toggleContainer} 
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, { color: COLORS.GRAY_MEDIUM }]}>
                {isLogin ? "Vous n'avez pas de wallet ? " : "Vous avez déjà un wallet ? "}
              </Text>
              <Text style={[styles.toggleLink, { color: COLORS.PRIMARY }]}>
                {isLogin ? 'Créer un wallet' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.securityBadge, { backgroundColor: COLORS.CARD }]}>
              <Lock size={16} color={COLORS.PRIMARY} />
              <Text style={[styles.securityText, { color: COLORS.GRAY_MEDIUM }]}>
                Données sécurisées localement
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Notification */}
      <SuccessNotification
        visible={successVisible}
        walletId={createdWalletId}
        onClose={() => setSuccessVisible(false)}
        onContinue={handleContinue}
      />

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
          onConfirm={alertConfig.onConfirm}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          showCancel={alertConfig.showCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  actionButton: {
    borderRadius: 16,
    marginTop: 32,
    marginBottom: 24,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toggleLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
});