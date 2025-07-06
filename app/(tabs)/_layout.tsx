import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, CreditCard, Settings, ChartBar as BarChart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '@/components/CustomTabBar';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors: COLORS, theme } = useThemeColors();

  return (
    <Tabs
      key={theme}
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.CARD,
          borderTopColor: COLORS.GRAY_LIGHT,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_MEDIUM,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'Pay',
          tabBarIcon: ({ size, color }) => (
            <CreditCard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <BarChart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}