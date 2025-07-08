import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ViewStyle } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  style?: ViewStyle;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function QRScanner({ onScan, onClose, style }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  const toggleFlash = () => {
    setFlash(!flash);
  };

  if (!permission) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Demande d'autorisation caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Autorisation caméra requise</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        flash={flash ? ('torch' as FlashMode) : ('off' as FlashMode)}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible accessibilityRole="button" accessibilityLabel="Fermer le scanner">
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Scanner un QR Code</Text>
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash} accessible accessibilityRole="button" accessibilityLabel="Activer/désactiver le flash">
            {flash ? (
              <Flashlight size={24} color="#FFFFFF" />
            ) : (
              <FlashlightOff size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        {/* Scanning Frame */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Placez le QR code dans le cadre pour scanner</Text>
          {scanned && (
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)} accessible accessibilityRole="button" accessibilityLabel="Scanner à nouveau">
              <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  flashButton: {
    padding: 8,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00E676',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  scanAgainButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#00E676',
    borderRadius: 8,
  },
  scanAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});