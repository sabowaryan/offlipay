import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OfflineCapability = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capacités Hors Ligne</Text>
      {/* Ici, nous ajouterons l'illustration de connectivité avec glassmorphism et l'animation de basculement */}
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

export default OfflineCapability;


