import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IllustrationProps } from '../../types';

const CashInMethods: React.FC<IllustrationProps> = ({ 
  theme, 
  animated = true, 
  size = 280,
  onAnimationComplete 
}) => {
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        width: size,
        height: size,
      }
    ]}>
      <Text style={[styles.title, { color: theme === 'dark' ? '#ffffff' : '#000000' }]}>
        Méthodes de Rechargement
      </Text>
      {/* Ici, nous ajouterons les icônes néomorphisme et les animations de flux d'argent */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CashInMethods;

