import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Dimensions,
  Animated
} from 'react-native';
import { AlertTriangle, X, CheckCircle } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'error',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Annuler',
  showCancel = false
}: CustomAlertProps) {
  const { colors: COLORS } = useThemeColors();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={24} color={COLORS.SUCCESS} />,
          backgroundColor: COLORS.SUCCESS + '20',
          borderColor: COLORS.SUCCESS,
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} color={COLORS.WARNING} />,
          backgroundColor: COLORS.WARNING + '20',
          borderColor: COLORS.WARNING,
        };
      case 'info':
        return {
          icon: <AlertTriangle size={24} color={COLORS.INFO} />,
          backgroundColor: COLORS.INFO + '20',
          borderColor: COLORS.INFO,
        };
      default: // error
        return {
          icon: <AlertTriangle size={24} color={COLORS.ERROR} />,
          backgroundColor: COLORS.ERROR + '20',
          borderColor: COLORS.ERROR,
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleConfirm = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            styles.alertContainer,
            { 
              backgroundColor: COLORS.CARD,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color={COLORS.GRAY_MEDIUM} />
          </TouchableOpacity>

          <View style={[
            styles.iconContainer,
            { 
              backgroundColor: typeConfig.backgroundColor,
              borderColor: typeConfig.borderColor
            }
          ]}>
            {typeConfig.icon}
          </View>

          <Text style={[TYPO.h3, { color: COLORS.TEXT, textAlign: 'center', marginTop: 16 }]}>
            {title}
          </Text>

          <Text style={[TYPO.body, { 
            color: COLORS.GRAY_MEDIUM, 
            textAlign: 'center', 
            marginTop: 8,
            lineHeight: 20
          }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: COLORS.GRAY_LIGHT }
                ]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: COLORS.GRAY_MEDIUM }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: typeConfig.borderColor }
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: COLORS.WHITE }]}>
                {confirmText}
              </Text>
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
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: width - 48,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor is set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
}); 