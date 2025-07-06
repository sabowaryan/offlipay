import { useState, useEffect } from 'react';
import { WalletService } from '@/services/WalletService';
import { UserMode } from '@/types';

export function useUserMode() {
  const [userMode, setUserMode] = useState<UserMode>('buyer');

  useEffect(() => {
    // Initialiser le mode depuis WalletService
    const savedMode = WalletService.getCurrentUserMode();
    setUserMode(savedMode);

    // Vérifier le mode toutes les 100ms pour une réactivité maximale
    const interval = setInterval(() => {
      const currentMode = WalletService.getCurrentUserMode();
      if (currentMode !== userMode) {
        setUserMode(currentMode);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [userMode]);

  const toggleUserMode = () => {
    const newMode = userMode === 'buyer' ? 'seller' : 'buyer';
    setUserMode(newMode);
    WalletService.setCurrentUserMode(newMode);
  };

  return { userMode, setUserMode, toggleUserMode };
} 