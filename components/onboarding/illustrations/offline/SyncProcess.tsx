import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SyncProcess = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processus de Synchronisation</Text>
      {/* Ici, nous ajouterons l'animation de synchronisation des données et la visualisation du processus */}
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

export default SyncProcess;

