import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';

interface ModalContainerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxHeight?: number;
  maxWidth?: number | string;
  style?: ViewStyle;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function ModalContainer({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  maxHeight = screenHeight * 0.8,
  maxWidth = '90%',
  style,
}: ModalContainerProps) {
  const { colors: COLORS } = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: COLORS.CARD,
                borderColor: COLORS.GRAY_LIGHT,
                maxHeight,
                ...(typeof maxWidth === 'number'
                  ? { maxWidth: maxWidth as number, width: '100%' as const }
                  : (typeof maxWidth === 'string' && /^\d+%$/.test(maxWidth)
                      ? { maxWidth: maxWidth as `${number}%`, width: maxWidth as `${number}%` }
                      : {})),
              },
              style,
            ]}
          >
            {(title || showCloseButton) && (
              <View style={[
                styles.headerModern,
                { backgroundColor: COLORS.BACKGROUND, shadowColor: COLORS.SHADOW, borderBottomColor: COLORS.GRAY_LIGHT }]}>
                {showCloseButton && (
                  <TouchableOpacity
                    style={[styles.closeButtonModern, { backgroundColor: (COLORS.GRAY_MEDIUM + '22') }]}
                    onPress={onClose}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Fermer le modal"
                  >
                    <X size={22} color={COLORS.GRAY_MEDIUM} />
                  </TouchableOpacity>
                )}
                {title && (
                  <View style={styles.titleContainerModern}>
                    <Text style={[styles.titleModern, { color: COLORS.TEXT }]} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
                    {subtitle && (
                      <Text style={[styles.subtitleModern, { color: COLORS.GRAY_MEDIUM }]} numberOfLines={2} ellipsizeMode="tail">{subtitle}</Text>
                    )}
                  </View>
                )}
              </View>
            )}
            <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 24}}>
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    paddingBottom: 0,
    paddingHorizontal: 0,
    width: '90%',
    maxWidth: 500,
    overflow: 'hidden',
    minHeight: 220,
  },
  headerModern: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    zIndex: 2,
  },
  closeButtonModern: {
    position: 'absolute',
    right: 16,
    top: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  titleContainerModern: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  titleModern: {
    ...TYPO.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
    fontSize: 22,
    letterSpacing: 0.1,
  },
  subtitleModern: {
    ...TYPO.caption,
    textAlign: 'center',
    marginTop: 2,
    fontSize: 14,
    letterSpacing: 0.05,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
}); 