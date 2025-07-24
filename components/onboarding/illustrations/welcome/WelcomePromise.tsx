import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WelcomePromise = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sécurisé, simple, toujours disponible</Text>
      {/* Ici, nous ajouterons l'illustration de sécurité avec effet néomorphisme, l'animation de protection et les éléments de validation */}
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

export default WelcomePromise;

