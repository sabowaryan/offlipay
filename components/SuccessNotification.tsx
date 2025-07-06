import React, { useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { CheckCircle, Copy, ArrowRight, Wallet } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import * as Clipboard from 'expo-clipboard';

const { width, height } = Dimensions.get('window');

interface SuccessNotificationProps {
  visible: boolean;
  walletId: string;
  onClose: () => void;
  onContinue: () => void;
}

export default function SuccessNotification({
  visible,
  walletId,
  onClose,
  onContinue
}: SuccessNotificationProps) {
  const { colors: COLORS } = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [countdown, setCountdown] = React.useState(3);
  const timerRef = useRef<number | null>(null);

  const handleAutoContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    if (visible) {
      setCountdown(3);
      
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

      // Compte à rebours avec délai initial
      timerRef.current = setTimeout(() => {
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              handleAutoContinue();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 1000); // Délai initial de 1 seconde

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      // Nettoyer le timer si la modal se ferme
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
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
  }, [visible, opacityAnim, scaleAnim, slideAnim, handleAutoContinue]);

  const handleCopyWalletId = async () => {
    await Clipboard.setStringAsync(walletId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
          {/* Success Icon */}
          <View style={[styles.iconContainer, { backgroundColor: COLORS.SUCCESS + '20' }]}>
            <CheckCircle size={48} color={COLORS.SUCCESS} />
          </View>

          {/* Title */}
          <Text style={[TYPO.h2, { color: COLORS.TEXT, textAlign: 'center', marginTop: 24 }]}>
            Wallet créé avec succès !
          </Text>

          {/* Subtitle */}
          <Text style={[TYPO.body, { 
            color: COLORS.GRAY_MEDIUM, 
            textAlign: 'center', 
            marginTop: 8,
            lineHeight: 22
          }]}>
            Votre wallet OffliPay est maintenant prêt à être utilisé. 
            Sauvegardez votre ID wallet en lieu sûr.
          </Text>

          {/* Auto-login info */}
          <View style={[styles.autoLoginInfo, { backgroundColor: COLORS.SUCCESS + '15' }]}>
            <Text style={[styles.autoLoginText, { color: COLORS.SUCCESS }]}>
              ✅ Connexion automatique dans {countdown} secondes...
            </Text>
          </View>

          {/* Wallet ID Section */}
          <View style={[styles.walletIdContainer, { backgroundColor: COLORS.BACKGROUND }]}>
            <View style={styles.walletIdHeader}>
              <Wallet size={20} color={COLORS.PRIMARY} />
              <Text style={[TYPO.caption, { color: COLORS.GRAY_MEDIUM, marginLeft: 8 }]}>
                ID Wallet
              </Text>
            </View>
            
            <View style={styles.walletIdContent}>
              <Text style={[styles.walletIdText, { color: COLORS.TEXT }]}>
                {walletId}
              </Text>
              
              <TouchableOpacity 
                style={[styles.copyButton, { backgroundColor: COLORS.PRIMARY }]}
                onPress={handleCopyWalletId}
                activeOpacity={0.8}
              >
                <Copy size={16} color={COLORS.WHITE} />
                <Text style={[styles.copyButtonText, { color: COLORS.WHITE }]}>
                  Copier
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Note */}
          <View style={[styles.securityNote, { backgroundColor: COLORS.WARNING + '15' }]}>
            <Text style={[styles.securityText, { color: COLORS.WARNING }]}>
              ⚠️ Important : Gardez votre ID wallet et votre PIN en sécurité. 
              Ils sont nécessaires pour accéder à votre wallet.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: COLORS.PRIMARY }]}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Text style={[styles.continueButtonText, { color: COLORS.WHITE }]}>
                Continuer maintenant
              </Text>
              <ArrowRight size={20} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  walletIdContainer: {
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  walletIdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIdContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletIdText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  securityNote: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  securityText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  autoLoginInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  autoLoginText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 32,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
}); 