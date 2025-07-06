import { useState, useCallback } from 'react';

interface AlertConfig {
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setAlertConfig(null);
  }, []);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      confirmText: 'OK',
      onConfirm,
    });
  }, [showAlert]);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      confirmText: 'OK',
      onConfirm,
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      confirmText: 'OK',
      onConfirm,
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
      onConfirm,
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    confirmText = 'Confirmer',
    cancelText = 'Annuler'
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      showCancel: true,
      onConfirm,
    });
  }, [showAlert]);

  return {
    alertConfig,
    isVisible,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConfirm,
  };
} 