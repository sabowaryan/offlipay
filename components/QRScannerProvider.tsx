import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import QRScanner from './QRScanner';

interface QRScannerContextProps {
  openScanner: (options: { onScan: (data: string) => void; title?: string; description?: string }) => void;
  closeScanner: () => void;
  isVisible: boolean;
  isCameraBusy: boolean;
}

const QRScannerContext = createContext<QRScannerContextProps | undefined>(undefined);

export function useQRScanner() {
  const ctx = useContext(QRScannerContext);
  if (!ctx) throw new Error('useQRScanner must be used within a QRScannerProvider');
  return ctx;
}

interface QRScannerProviderProps {
  children: ReactNode;
}

export function QRScannerProvider({ children }: QRScannerProviderProps) {
  const [visible, setVisible] = useState(false);
  const [onScan, setOnScan] = useState<((data: string) => void) | null>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isCameraBusy, setIsCameraBusy] = useState(false);

  const openScanner = useCallback(({ onScan, title, description }: { onScan: (data: string) => void; title?: string; description?: string }) => {
    if (isCameraBusy) {
      // Optionnel : tu peux afficher un toast ou un log
      console.warn('Scanner déjà en cours de fermeture/ouverture.');
      return;
    }
    setIsCameraBusy(true);
    setOnScan(() => onScan);
    setTitle(title);
    setDescription(description);
    setVisible(true);
  }, [isCameraBusy]);

  const closeScanner = useCallback(() => {
    setVisible(false);
    setOnScan(null);
    setTitle(undefined);
    setDescription(undefined);
    // isCameraBusy sera remis à false dans le cleanup du QRScanner
  }, []);

  // Callback appelé à l'unmount du QRScanner
  const handleScannerUnmount = useCallback(() => {
    setTimeout(() => setIsCameraBusy(false), 300); // délai pour garantir la libération native
  }, []);

  return (
    <QRScannerContext.Provider value={{ openScanner, closeScanner, isVisible: visible, isCameraBusy }}>
      {children}
      {visible && (
        <QRScanner
          onScan={(data) => {
            if (onScan) onScan(data);
            closeScanner();
          }}
          onClose={closeScanner}
          title={title}
          description={description}
          // Appel du cleanup à l'unmount
          key="global-qr-scanner"
          {...{ onUnmount: handleScannerUnmount }}
        />
      )}
    </QRScannerContext.Provider>
  );
} 