import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OnboardingCompletion = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Félicitations !</Text>
      <Text style={styles.subtitle}>Votre onboarding est terminé.</Text>
      {/* Ici, nous ajouterons l'animation de célébration (ex: Lottie, particules) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default OnboardingCompletion;


