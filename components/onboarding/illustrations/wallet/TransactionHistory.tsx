import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionHistory = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des Transactions</Text>
      {/* Ici, nous ajouterons les graphiques animés et la visualisation des données */}
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

export default TransactionHistory;

