import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WalletService } from '@/services/WalletService';
import { useThemeColors } from '@/hooks/useThemeColors';
import Logo from '@/components/Logo';

export default function IndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { colors } = useThemeColors();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await WalletService.loadCurrentUser();
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/auth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Logo size={120} style={styles.logo} />
     
      <Text style={[styles.subtitle, { color: colors.TEXT }]}>Offline Payment System</Text>
      {loading && (
        <ActivityIndicator 
          size="large" 
          color={colors.PRIMARY} 
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  loader: {
    marginTop: 20,
  },
});