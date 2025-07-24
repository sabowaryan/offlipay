import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QRGenerateDemo = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Génération de QR</Text>
      {/* Ici, nous ajouterons l'interface de génération avec glassmorphism et la construction pixel par pixel */}
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

export default QRGenerateDemo;

