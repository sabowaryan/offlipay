import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WalletOverview = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vue d'ensemble du Portefeuille</Text>
      {/* Ici, nous ajouterons l'interface de portefeuille en 3D isométrique et les éléments flottants */}
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

export default WalletOverview;


