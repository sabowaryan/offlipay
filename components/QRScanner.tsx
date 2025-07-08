import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ViewStyle, AppState } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { BlurView } from 'expo-blur';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  style?: ViewStyle;
  onUnmount?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function QRScanner({ onScan, onClose, title, description, style, onUnmount }: QRScannerProps) {
  const { colors: COLORS, theme } = useThemeColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!permission) {
      setIsRequesting(true);
      requestPermission().finally(() => setIsRequesting(false));
    }
  }, [permission]);

  // Cleanup caméra à l'unmount pour éviter les crashs natifs
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        onClose?.();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      console.log('[QRScanner] Unmount: caméra libérée');
    };
  }, []);

  useEffect(() => {
    return () => {
      if (onUnmount) onUnmount();
    };
  }, [onUnmount]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  const toggleFlash = () => {
    setFlash(!flash);
  };

  if (!permission || isRequesting) {
    return (
      <View style={[styles.container, style, { backgroundColor: COLORS.BACKGROUND }]}>
        <Text style={[TYPO.body, { color: COLORS.TEXT, marginTop: 32 }]}>Initialisation du scanner...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, style, { backgroundColor: COLORS.BACKGROUND }]}>
        <Text style={[TYPO.body, { color: COLORS.TEXT, marginTop: 32 }]}>Autorisation caméra requise</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
          onPress={async () => {
            setIsRequesting(true);
            await requestPermission();
            setIsRequesting(false);
          }}
          disabled={isRequesting}
        >
          <Text style={[styles.buttonText, { color: COLORS.WHITE }]}>{isRequesting ? 'Demande en cours...' : 'Autoriser'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, { backgroundColor: COLORS.BACKGROUND }]}>
      {/* CameraView en fond, sans enfants */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        flash={flash ? ('torch' as FlashMode) : ('off' as FlashMode)}
      />
      {/* Header en absolute */}
      <BlurView intensity={60} tint={theme === 'dark' ? 'dark' : 'light'} style={[styles.header, {backgroundColor: COLORS.CARD + 'D9', borderBottomColor: COLORS.SHADOW, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2}]}> 
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (!isRequesting && permission && permission.granted) {
              onClose();
            }
          }}
          disabled={isRequesting || !permission || !permission.granted}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Fermer le scanner"
        >
          <X size={26} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <Text style={[TYPO.h3, styles.headerText, { color: COLORS.PRIMARY }]}>{title || 'Scanner un QR Code'}</Text>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash} accessible accessibilityRole="button" accessibilityLabel="Activer/désactiver le flash">
          {flash ? (
            <Flashlight size={26} color={COLORS.PRIMARY} />
          ) : (
            <FlashlightOff size={26} color={COLORS.PRIMARY} />
          )}
        </TouchableOpacity>
      </BlurView>
      {/* Cadre de scan en absolute */}
      <View style={[styles.scanArea, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }]}> 
        <View style={[styles.scanFrame, {
          borderColor: COLORS.PRIMARY,
          shadowColor: COLORS.SHADOW,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 12,
        }]}> 
          <View style={[styles.corner, styles.topLeft, { borderColor: COLORS.ACCENT_ORANGE }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: COLORS.SUCCESS }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: COLORS.PRIMARY_LIGHT }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: COLORS.ERROR }]} />
        </View>
      </View>
      {/* Footer en absolute */}
      <BlurView intensity={60} tint={theme === 'dark' ? 'dark' : 'light'} style={[styles.footer, {backgroundColor: COLORS.CARD + 'D9', borderTopColor: COLORS.SHADOW, position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2}]}> 
        <Text style={[TYPO.body, styles.footerText, { color: COLORS.TEXT }]}>{description || 'Placez le QR code dans le cadre pour scanner'}</Text>
        {scanned && (
          <TouchableOpacity style={[styles.scanAgainButton, { backgroundColor: COLORS.PRIMARY }]} onPress={() => setScanned(false)} accessible accessibilityRole="button" accessibilityLabel="Scanner à nouveau">
            <Text style={[TYPO.body, styles.scanAgainText, { color: COLORS.WHITE }]}>Scanner à nouveau</Text>
          </TouchableOpacity>
        )}
      </BlurView>
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderRadius: 0,
    minHeight: 70,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    marginLeft: -36,
  },
  flashButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: screenWidth < 400 ? 200 : screenWidth < 600 ? 260 : 320,
    height: screenWidth < 400 ? 200 : screenWidth < 600 ? 260 : 320,
    borderRadius: 28,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderWidth: 4,
    borderRadius: 12,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 18,
    borderTopWidth: 1,
    borderRadius: 0,
    alignItems: 'center',
    minHeight: 80,
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  scanAgainButton: {
    marginTop: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanAgainText: {
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});