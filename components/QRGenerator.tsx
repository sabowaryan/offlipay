import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRGeneratorProps {
  data: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function QRGenerator({ 
  data, 
  size = Math.min(screenWidth * 0.7, 300),
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000'
}: QRGeneratorProps) {
  if (!data) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.errorText}>No data to generate QR code</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <QRCode
        value={data}
        size={size}
        color={foregroundColor}
        backgroundColor={backgroundColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});