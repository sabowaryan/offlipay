import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QRScanDemo = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Démonstration Scan QR</Text>
      {/* Ici, nous ajouterons le téléphone 3D, l'animation de scan et le QR code */}
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

export default QRScanDemo;


