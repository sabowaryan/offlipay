import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentSuccess = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paiement Réussi!</Text>
      {/* Ici, nous ajouterons l'animation de succès avec célébration et effets de confettis */}
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

export default PaymentSuccess;

