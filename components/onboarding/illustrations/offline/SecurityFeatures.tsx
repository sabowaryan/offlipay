import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecurityFeatures = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fonctionnalités de Sécurité</Text>
      {/* Ici, nous ajouterons les éléments de sécurité avec néomorphisme et les animations de chiffrement */}
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

export default SecurityFeatures;

