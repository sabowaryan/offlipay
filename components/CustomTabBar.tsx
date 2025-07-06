import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import { Home, Send, History, UserCog } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const TABS = [
  { name: 'index', label: 'Accueil', icon: Home },
  { name: 'pay', label: 'Payer', icon: Send },
  { name: 'transactions', label: 'Historique', icon: History },
  { name: 'settings', label: 'Paramètres', icon: UserCog },
];

interface TabItemProps {
  route: any;
  index: number;
  isFocused: boolean;
  tabWidth: number;
  onPress: () => void;
  colors: any;
}

const TabItem = React.memo(({ route, index, isFocused, tabWidth, onPress, colors }: TabItemProps) => {
  const TabIcon = TABS[index].icon;
  const animatedValue = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    animatedValue.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused, animatedValue]);

  const tabAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [1, 1.1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      animatedValue.value,
      [0, 1],
      [0, -4],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [1, 1.2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
    transform: [{
      translateY: interpolate(
        animatedValue.value,
        [0, 1],
        [10, 0],
        Extrapolate.CLAMP
      )
    }]
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={[
        styles.tab, 
        { 
          width: tabWidth,
          backgroundColor: isFocused ? colors.PRIMARY + '15' : 'transparent',
          borderColor: isFocused ? colors.PRIMARY + '30' : 'transparent',
        }
      ]}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabContent, tabAnimatedStyle]}>
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <TabIcon 
            size={24} 
            color={isFocused ? colors.PRIMARY : colors.GRAY_MEDIUM} 
          />
        </Animated.View>
        
        <Animated.View style={[styles.labelContainer, labelAnimatedStyle]}>
          <Text style={[
            styles.label,
            { 
              color: isFocused ? colors.PRIMARY : colors.GRAY_MEDIUM,
              fontFamily: isFocused ? 'Inter-SemiBold' : 'Inter-Regular',
            }
          ]}>
            {TABS[index].label}
          </Text>
        </Animated.View>

        {isFocused && (
          <Animated.View 
            style={[
              styles.activeIndicator,
              { backgroundColor: colors.PRIMARY }
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour détecter les changements de couleurs
  return (
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.index === nextProps.index &&
    prevProps.tabWidth === nextProps.tabWidth &&
    prevProps.colors.PRIMARY === nextProps.colors.PRIMARY &&
    prevProps.colors.GRAY_MEDIUM === nextProps.colors.GRAY_MEDIUM &&
    prevProps.colors.CARD === nextProps.colors.CARD &&
    prevProps.colors.TEXT === nextProps.colors.TEXT &&
    prevProps.colors.GRAY_LIGHT === nextProps.colors.GRAY_LIGHT
  );
});

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors: COLORS } = useThemeColors();

  const getTabWidth = () => {
    const tabCount = TABS.length;
    const containerWidth = screenWidth - 32; // 16px margin on each side
    const tabWidth = containerWidth / tabCount;
    return Math.min(tabWidth, 120); // Max width for better UX
  };

  const tabWidth = getTabWidth();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}> 
      <View style={[styles.tabBar, { 
        backgroundColor: COLORS.CARD,
        shadowColor: COLORS.TEXT,
        borderColor: COLORS.GRAY_LIGHT,
      }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              tabWidth={tabWidth}
              onPress={onPress}
              colors={COLORS}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    minHeight: 72,
    maxHeight: 80,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
}); 