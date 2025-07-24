import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CashInMethods = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Méthodes de Rechargement</Text>
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

