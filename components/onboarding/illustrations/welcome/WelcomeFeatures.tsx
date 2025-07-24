import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WelcomeFeatures = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paiements, portefeuille, et bien plus</Text>
      {/* Ici, nous ajouterons les icônes 3D isométriques, les animations de rotation et les connexions animées */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Couleur de fond temporaire
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeFeatures;

