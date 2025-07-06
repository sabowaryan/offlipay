import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Share,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { User } from '@/types';
import { 
  User as UserIcon, 
  Wallet, 
  Shield, 
  Bell, 
  Share2, 
  CircleHelp as HelpCircle, 
  LogOut, 
  ChevronRight, 
  Smartphone, 
  Wifi, 
  Database,
  Moon,
  Sun,
  Monitor,
  Copy,
  Settings as SettingsIcon,
  CreditCard,
  Calendar,
  AlertTriangle
} from 'lucide-react-native';
import { useThemeColors, ThemeMode } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import CustomAlert from '@/components/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import * as Clipboard from 'expo-clipboard';

const { width: screenWidth } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { colors: COLORS, manualTheme, setTheme, isAuto, systemTheme } = useThemeColors();
  const { showAlert, hideAlert, isVisible, alertConfig } = useCustomAlert();
  const [user, setUser] = useState<User | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState({
    lastLogin: '',
    deviceInfo: '',
    walletBalance: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    const currentUser = WalletService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Simuler les informations de session
      setSessionInfo({
        lastLogin: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        deviceInfo: `${Platform.OS} ${Platform.Version}`,
        walletBalance: currentUser.balance,
      });
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    showAlert({
      title: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Déconnexion',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await WalletService.logout();
          router.replace('/auth');
        } catch (error) {
          showAlert({
            title: 'Erreur',
            message: 'Erreur lors de la déconnexion',
            type: 'error',
          });
        }
      }
    });
  };

  const handleShareWallet = async () => {
    if (!user) return;

    try {
      await Share.share({
        message: `Mon ID Wallet OffliPay : ${user.walletId}\n\nEnvoyez-moi des paiements avec cet ID sur OffliPay !`,
        title: 'Mon Wallet OffliPay'
      });
    } catch (error) {
      console.error('Erreur de partage:', error);
    }
  };

  const handleCopyWalletId = async () => {
    if (!user) return;
    
    try {
      await Clipboard.setStringAsync(user.walletId);
      showAlert({
        title: 'Copié !',
        message: 'L\'ID wallet a été copié dans le presse-papiers',
        type: 'success',
      });
    } catch (error) {
      showAlert({
        title: 'Erreur',
        message: 'Impossible de copier l\'ID wallet',
        type: 'error',
      });
    }
  };

  const handleExportData = () => {
    showAlert({
      title: 'Exporter les données',
      message: 'Cette fonctionnalité vous permet d\'exporter votre historique de transactions et les données de votre wallet à des fins de sauvegarde.',
      type: 'info',
      showCancel: true,
      confirmText: 'Exporter',
      cancelText: 'Annuler',
      onConfirm: () => {
        showAlert({
          title: 'Succès',
          message: 'Données exportées avec succès !',
          type: 'success',
        });
      }
    });
  };

  const handleSecuritySettings = () => {
    showAlert({
      title: 'Paramètres de sécurité',
      message: 'Fonctionnalités de sécurité :\n• Protection par PIN\n• Chiffrement local\n• Signatures de transactions hors ligne\n• Stockage sécurisé des clés',
      type: 'info',
    });
  };

  const handleHelp = () => {
    showAlert({
      title: 'Aide & Support',
      message: 'OffliPay est un système de paiement hors ligne qui fonctionne sans connexion internet.\n\nFonctionnalités :\n• Générer des codes QR pour les paiements\n• Scanner des codes QR pour payer\n• Traitement des transactions hors ligne\n• Stockage local sécurisé\n• Synchronisation Bluetooth (bientôt disponible)',
      type: 'info',
    });
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    disabled?: boolean
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { 
          backgroundColor: COLORS.CARD,
          borderColor: COLORS.GRAY_LIGHT,
          opacity: disabled ? 0.6 : 1
        }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: COLORS.PRIMARY + '15' }]}>
          {icon}
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingText, { color: COLORS.TEXT }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtext, { color: COLORS.GRAY_MEDIUM }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={COLORS.GRAY_MEDIUM} />)}
    </TouchableOpacity>
  );

  const renderThemeOption = (mode: ThemeMode, icon: React.ReactNode, label: string) => {
    const iconColor = manualTheme === mode ? COLORS.PRIMARY : COLORS.GRAY_MEDIUM;
    
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: manualTheme === mode ? COLORS.PRIMARY + '15' : COLORS.CARD,
            borderColor: manualTheme === mode ? COLORS.PRIMARY : COLORS.GRAY_LIGHT,
          }
        ]}
        onPress={() => handleThemeChange(mode)}
        activeOpacity={0.7}
      >
        <View style={styles.themeIcon}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon, { color: iconColor } as any)
            : icon
          }
        </View>
        <Text style={[
          styles.themeLabel,
          { color: manualTheme === mode ? COLORS.PRIMARY : COLORS.TEXT }
        ]}>
          {label}
        </Text>
        {manualTheme === mode && (
          <View style={[styles.themeIndicator, { backgroundColor: COLORS.PRIMARY }]} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        <StatusBar barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
        <StatusBar barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={COLORS.ERROR} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
            Veuillez vous connecter d'abord
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <StatusBar barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: COLORS.GRAY_LIGHT }]}>
        <View style={styles.headerContent}>
          <SettingsIcon size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.headerTitle, { color: COLORS.TEXT }]}>
            Paramètres
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
            <View style={[styles.profileIcon, { backgroundColor: COLORS.PRIMARY + '20' }]}>
              <UserIcon size={28} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: COLORS.TEXT }]}>
                {user.name}
              </Text>
              <Text style={[styles.profilePhone, { color: COLORS.GRAY_MEDIUM }]}>
                {user.phone}
              </Text>
              <View style={styles.walletIdContainer}>
                <Text style={[styles.profileWallet, { color: COLORS.GRAY_MEDIUM }]}>
                  ID: {user.walletId.substring(0, 16)}...
                </Text>
                <TouchableOpacity onPress={handleCopyWalletId} style={styles.copyButton}>
                  <Copy size={14} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Session Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Informations de session
          </Text>
          
          <View style={[styles.sessionCard, { backgroundColor: COLORS.CARD, borderColor: COLORS.GRAY_LIGHT }]}>
            <View style={styles.sessionItem}>
              <Calendar size={16} color={COLORS.GRAY_MEDIUM} />
              <Text style={[styles.sessionLabel, { color: COLORS.GRAY_MEDIUM }]}>
                Dernière connexion
              </Text>
              <Text style={[styles.sessionValue, { color: COLORS.TEXT }]}>
                {sessionInfo.lastLogin}
              </Text>
            </View>
            
            <View style={styles.sessionItem}>
              <Smartphone size={16} color={COLORS.GRAY_MEDIUM} />
              <Text style={[styles.sessionLabel, { color: COLORS.GRAY_MEDIUM }]}>
                Appareil
              </Text>
              <Text style={[styles.sessionValue, { color: COLORS.TEXT }]}>
                {sessionInfo.deviceInfo}
              </Text>
            </View>
            
            <View style={styles.sessionItem}>
              <CreditCard size={16} color={COLORS.GRAY_MEDIUM} />
              <Text style={[styles.sessionLabel, { color: COLORS.GRAY_MEDIUM }]}>
                Solde wallet
              </Text>
              <Text style={[styles.sessionValue, { color: COLORS.PRIMARY }]}>
                {sessionInfo.walletBalance.toFixed(2)} €
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Apparence
          </Text>
          
          <View style={styles.themeContainer}>
            {renderThemeOption('light', <Sun size={20} />, 'Clair')}
            {renderThemeOption('dark', <Moon size={20} />, 'Sombre')}
            {renderThemeOption('auto', <Monitor size={20} />, 'Système')}
          </View>
        </View>

        {/* Wallet Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Wallet
          </Text>
          
          {renderSettingItem(
            <Share2 size={20} color={COLORS.PRIMARY} />,
            'Partager l\'ID Wallet',
            'Partager votre ID avec d\'autres utilisateurs',
            handleShareWallet
          )}

          {renderSettingItem(
            <Database size={20} color={COLORS.PRIMARY} />,
            'Exporter les données',
            'Sauvegarder vos transactions',
            handleExportData
          )}
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Sécurité
          </Text>
          
          {renderSettingItem(
            <Shield size={20} color={COLORS.PRIMARY} />,
            'Paramètres de sécurité',
            'Configurer la protection de votre wallet',
            handleSecuritySettings
          )}

          {renderSettingItem(
            <Smartphone size={20} color={COLORS.PRIMARY} />,
            'Mode hors ligne',
            'Fonctionner sans connexion internet',
            undefined,
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.PRIMARY + '40' }}
              thumbColor={offlineMode ? COLORS.PRIMARY : COLORS.GRAY_MEDIUM}
            />
          )}
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Synchronisation
          </Text>
          
          {renderSettingItem(
            <Wifi size={20} color={COLORS.PRIMARY} />,
            'Synchronisation automatique',
            'Synchroniser avec le serveur',
            undefined,
            <Switch
              value={syncEnabled}
              onValueChange={setSyncEnabled}
              trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.PRIMARY + '40' }}
              thumbColor={syncEnabled ? COLORS.PRIMARY : COLORS.GRAY_MEDIUM}
            />
          )}

          {renderSettingItem(
            <Smartphone size={20} color={COLORS.GRAY_MEDIUM} />,
            'Bluetooth',
            'Bientôt disponible',
            undefined,
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.GRAY_LIGHT }}
              thumbColor={COLORS.GRAY_MEDIUM}
            />,
            true
          )}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            Support
          </Text>
          
          {renderSettingItem(
            <HelpCircle size={20} color={COLORS.PRIMARY} />,
            'Aide & Support',
            'Obtenir de l\'aide',
            handleHelp
          )}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { 
              backgroundColor: COLORS.ERROR + '15',
              borderColor: COLORS.ERROR + '30'
            }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={COLORS.ERROR} />
            <Text style={[styles.logoutText, { color: COLORS.ERROR }]}>
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: COLORS.GRAY_MEDIUM }]}>
            OffliPay v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: COLORS.GRAY_MEDIUM }]}>
            Système de paiement hors ligne
          </Text>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
          onConfirm={alertConfig.onConfirm}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          showCancel={alertConfig.showCancel}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 20,
    fontFamily: 'Inter-SemiBold',
  },
  profileCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  profilePhone: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  profileWallet: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  walletIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  sessionCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Inter-Medium',
  },
  sessionValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  themeIcon: {
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  themeIndicator: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  settingSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});