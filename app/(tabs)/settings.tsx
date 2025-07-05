import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { User } from '@/types';
import { User as UserIcon, Wallet, Shield, Bell, Share2, CircleHelp as HelpCircle, LogOut, ChevronRight, Smartphone, Wifi, Database } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(WalletService.getCurrentUser());
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletService.logout();
              router.replace('/auth');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleShareWallet = async () => {
    if (!user) return;

    try {
      await Share.share({
        message: `My OffliPay Wallet ID: ${user.walletId}\n\nSend me payments using this ID on OffliPay!`,
        title: 'My OffliPay Wallet'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature allows you to export your transaction history and wallet data for backup purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // In a real app, this would export data to a file
          Alert.alert('Success', 'Data exported successfully!');
        }}
      ]
    );
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      'Security Settings',
      'Security features:\n• PIN protection\n• Local encryption\n• Offline transaction signatures\n• Secure key storage',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'OffliPay is an offline payment system that works without internet connection.\n\nFeatures:\n• Generate QR codes for payments\n• Scan QR codes to pay\n• Offline transaction processing\n• Secure local storage\n• Bluetooth sync (coming soon)',
      [{ text: 'OK' }]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please login first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <UserIcon size={24} color="#00E676" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profilePhone}>{user.phone}</Text>
              <Text style={styles.profileWallet}>
                ID: {user.walletId.substring(0, 16)}...
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleShareWallet}>
            <View style={styles.settingLeft}>
              <Share2 size={20} color="#00E676" />
              <Text style={styles.settingText}>Share Wallet ID</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Database size={20} color="#00E676" />
              <Text style={styles.settingText}>Export Data</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleSecuritySettings}>
            <View style={styles.settingLeft}>
              <Shield size={20} color="#00E676" />
              <Text style={styles.settingText}>Security Settings</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Smartphone size={20} color="#00E676" />
              <Text style={styles.settingText}>Offline Mode</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#2A2A2A', true: '#00E676' }}
              thumbColor={offlineMode ? '#FFFFFF' : '#666'}
            />
          </View>
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronization</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Wifi size={20} color="#00E676" />
              <Text style={styles.settingText}>Auto Sync</Text>
            </View>
            <Switch
              value={syncEnabled}
              onValueChange={setSyncEnabled}
              trackColor={{ false: '#2A2A2A', true: '#00E676' }}
              thumbColor={syncEnabled ? '#FFFFFF' : '#666'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>Bluetooth</Text>
              <Text style={styles.settingSubtext}>Coming soon</Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: '#2A2A2A', true: '#00E676' }}
              thumbColor="#666"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>SMS Sync</Text>
              <Text style={styles.settingSubtext}>Coming soon</Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: '#2A2A2A', true: '#00E676' }}
              thumbColor="#666"
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
            <View style={styles.settingLeft}>
              <HelpCircle size={20} color="#00E676" />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>OffliPay v1.0.0</Text>
          <Text style={styles.appInfoText}>Offline Payment System</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
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
    color: '#FFFFFF',
    marginBottom: 12,
    marginHorizontal: 20,
    fontFamily: 'Inter-SemiBold',
  },
  profileCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
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
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  profilePhone: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  profileWallet: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
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
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    fontFamily: 'Inter-Regular',
  },
});