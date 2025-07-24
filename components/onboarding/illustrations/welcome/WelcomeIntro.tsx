import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WelcomeIntro = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans l'avenir des paiements</Text>
      {/* Ici, nous ajouterons le logo OffliPay, l'effet glassmorphism, les particules et l'animation */}
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

export default WelcomeIntro;


