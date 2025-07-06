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
}

const { height: screenHeight } = Dimensions.get('window');

export default function ModalContainer({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  maxHeight = screenHeight * 0.8,
}: ModalContainerProps) {
  const { colors: COLORS } = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: COLORS.BACKGROUND,
                borderColor: COLORS.GRAY_LIGHT,
                maxHeight,
              },
            ]}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  {title && (
                    <View style={styles.titleContainer}>
                      <Text style={[styles.title, { color: COLORS.TEXT }]}>
                        {title}
                      </Text>
                      {subtitle && (
                        <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}>
                          {subtitle}
                        </Text>
                      )}
                    </View>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      style={[styles.closeButton, { backgroundColor: COLORS.GRAY_LIGHT }]}
                      onPress={onClose}
                    >
                      <X size={20} color={COLORS.GRAY_MEDIUM} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>{children}</View>
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
  modalContainer: {
    width: '90%',
    maxWidth: 500,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    ...TYPO.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPO.caption,
    lineHeight: 18,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
}); 