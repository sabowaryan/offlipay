import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PremiumScreenConfig } from './types/PremiumOnboardingConfig';

interface OnboardingQuickPreviewProps {
  screens: PremiumScreenConfig[];
  onScreenSelect: (screenIndex: number) => void;
  onClose: () => void;
}

const OnboardingQuickPreview: React.FC<OnboardingQuickPreviewProps> = ({
  screens,
  onScreenSelect,
  onClose,
}) => {
  const [selectedScreen, setSelectedScreen] = useState<number | null>(null);

  const handleScreenPress = useCallback((index: number) => {
    setSelectedScreen(index);
    onScreenSelect(index);
  }, [onScreenSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aperçu Rapide</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.screenList}>
        {screens.map((screen, index) => (
          <TouchableOpacity
            key={screen.id}
            style={[
              styles.screenItem,
              selectedScreen === index && styles.selectedScreenItem
            ]}
            onPress={() => handleScreenPress(index)}
          >
            <Text style={styles.screenTitle}>{screen.title}</Text>
            <Text style={styles.slideCount}>{screen.slides.length} slides</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    fontSize: 24,
    color: 'white',
  },
  screenList: {
    flex: 1,
  },
  screenItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  selectedScreenItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  slideCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default OnboardingQuickPreview;

