import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { IllustrationProps } from '../../types';

const TransactionHistory: React.FC<IllustrationProps> = ({
  theme,
  animated = true,
  size = 280,
  onAnimationComplete
}) => {
  const isDark = theme === 'dark';
  const baseColor = isDark ? '#1a1a1a' : '#f0f0f0';
  const cardColor = isDark ? '#2a2a2a' : '#ffffff';
  const shadowColor = isDark ? '#000000' : '#d1d9e6';
  const textColor = isDark ? '#ffffff' : '#333333';
  const subtleTextColor = isDark ? '#888888' : '#666666';
  const successColor = '#4CAF50';
  const warningColor = '#FF9800';
  const errorColor = '#F44336';

  // Animation values
  const containerOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const chartProgress = useSharedValue(0);
  const transactionOpacity = useSharedValue(0);
  const statsScale = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  // Chart bars animation
  const bar1Height = useSharedValue(0);
  const bar2Height = useSharedValue(0);
  const bar3Height = useSharedValue(0);
  const bar4Height = useSharedValue(0);
  const bar5Height = useSharedValue(0);

  // Transaction items animation
  const transaction1Y = useSharedValue(50);
  const transaction2Y = useSharedValue(50);
  const transaction3Y = useSharedValue(50);

  useEffect(() => {
    if (animated) {
      // Initial entrance animation
      containerOpacity.value = withTiming(1, { duration: 800 });
      titleTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });

      // Chart animation with staggered bars
      setTimeout(() => {
        chartProgress.value = withTiming(1, { duration: 1000 });

        bar1Height.value = withDelay(200, withTiming(0.6, { duration: 800, easing: Easing.out(Easing.cubic) }));
        bar2Height.value = withDelay(400, withTiming(0.8, { duration: 800, easing: Easing.out(Easing.cubic) }));
        bar3Height.value = withDelay(600, withTiming(0.4, { duration: 800, easing: Easing.out(Easing.cubic) }));
        bar4Height.value = withDelay(800, withTiming(0.9, { duration: 800, easing: Easing.out(Easing.cubic) }));
        bar5Height.value = withDelay(1000, withTiming(0.7, { duration: 800, easing: Easing.out(Easing.cubic) }));
      }, 500);

      // Stats animation
      statsScale.value = withDelay(800, withTiming(1, { duration: 600, easing: Easing.back(1.2) }));

      // Transaction items animation
      setTimeout(() => {
        transactionOpacity.value = withTiming(1, { duration: 600 });
        transaction1Y.value = withDelay(100, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
        transaction2Y.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
        transaction3Y.value = withDelay(300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
      }, 1200);

      // Continuous pulse animation
      setTimeout(() => {
        pulseAnimation.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
          ),
          -1,
          true
        );
      }, 2000);

      // Call completion callback
      setTimeout(() => {
        onAnimationComplete?.();
      }, 2500);
    } else {
      // Static state
      containerOpacity.value = 1;
      titleTranslateY.value = 0;
      chartProgress.value = 1;
      transactionOpacity.value = 1;
      statsScale.value = 1;
      bar1Height.value = 0.6;
      bar2Height.value = 0.8;
      bar3Height.value = 0.4;
      bar4Height.value = 0.9;
      bar5Height.value = 0.7;
      transaction1Y.value = 0;
      transaction2Y.value = 0;
      transaction3Y.value = 0;
    }
  }, [animated]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsScale.value * pulseAnimation.value }],
  }));

  const transactionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transactionOpacity.value,
  }));

  const createBarStyle = (heightValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      height: interpolate(heightValue.value, [0, 1], [0, 60]),
    }));

  const createTransactionStyle = (translateYValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: translateYValue.value }],
      opacity: transactionOpacity.value,
    }));

  const bar1Style = createBarStyle(bar1Height);
  const bar2Style = createBarStyle(bar2Height);
  const bar3Style = createBarStyle(bar3Height);
  const bar4Style = createBarStyle(bar4Height);
  const bar5Style = createBarStyle(bar5Height);

  const transaction1Style = createTransactionStyle(transaction1Y);
  const transaction2Style = createTransactionStyle(transaction2Y);
  const transaction3Style = createTransactionStyle(transaction3Y);

  const TransactionItem = ({
    icon,
    title,
    amount,
    time,
    type,
    animatedStyle
  }: {
    icon: React.ReactNode;
    title: string;
    amount: string;
    time: string;
    type: 'income' | 'expense';
    animatedStyle: any;
  }) => (
    <Animated.View style={[
      styles.transactionItem,
      {
        backgroundColor: cardColor,
        shadowColor: shadowColor,
      },
      isDark ? styles.darkShadow : styles.lightShadow,
      animatedStyle
    ]}>
      <View style={styles.transactionIcon}>
        {icon}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.transactionTime, { color: subtleTextColor }]}>{time}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: type === 'income' ? successColor : errorColor }
      ]}>
        {type === 'income' ? '+' : '-'}{amount}
      </Text>
    </Animated.View>
  );

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: baseColor,
        width: size,
        height: size,
      },
      containerAnimatedStyle
    ]}>
      <Animated.Text style={[
        styles.title,
        { color: textColor },
        titleAnimatedStyle
      ]}>
        Historique des Transactions
      </Animated.Text>

      {/* Stats Cards */}
      <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
        <View style={[
          styles.statCard,
          {
            backgroundColor: cardColor,
            shadowColor: shadowColor,
          },
          isDark ? styles.darkShadow : styles.lightShadow,
        ]}>
          <TrendingUp size={16} color={successColor} />
          <Text style={[styles.statValue, { color: successColor }]}>+2,450€</Text>
          <Text style={[styles.statLabel, { color: subtleTextColor }]}>Ce mois</Text>
        </View>

        <View style={[
          styles.statCard,
          {
            backgroundColor: cardColor,
            shadowColor: shadowColor,
          },
          isDark ? styles.darkShadow : styles.lightShadow,
        ]}>
          <Clock size={16} color={warningColor} />
          <Text style={[styles.statValue, { color: textColor }]}>47</Text>
          <Text style={[styles.statLabel, { color: subtleTextColor }]}>Transactions</Text>
        </View>
      </Animated.View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <Animated.View style={[styles.chartBar, { backgroundColor: successColor }, bar1Style]} />
          <Animated.View style={[styles.chartBar, { backgroundColor: successColor }, bar2Style]} />
          <Animated.View style={[styles.chartBar, { backgroundColor: warningColor }, bar3Style]} />
          <Animated.View style={[styles.chartBar, { backgroundColor: successColor }, bar4Style]} />
          <Animated.View style={[styles.chartBar, { backgroundColor: successColor }, bar5Style]} />
        </View>
        <View style={styles.chartLabels}>
          {['L', 'M', 'M', 'J', 'V'].map((day, index) => (
            <Text key={index} style={[styles.chartLabel, { color: subtleTextColor }]}>
              {day}
            </Text>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <TransactionItem
          icon={<ArrowUpRight size={16} color={successColor} />}
          title="Reçu de Marie"
          amount="25€"
          time="Il y a 2h"
          type="income"
          animatedStyle={transaction1Style}
        />

        <TransactionItem
          icon={<ArrowDownLeft size={16} color={errorColor} />}
          title="Café Central"
          amount="4.50€"
          time="Il y a 5h"
          type="expense"
          animatedStyle={transaction2Style}
        />

        <TransactionItem
          icon={<ArrowUpRight size={16} color={successColor} />}
          title="Remboursement"
          amount="15€"
          time="Hier"
          type="income"
          animatedStyle={transaction3Style}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: 80,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  lightShadow: {
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#ffffff',
  },
  darkShadow: {
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000000',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '500',
    marginTop: 1,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 60,
    marginBottom: 8,
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    gap: 8,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '500',
    width: 12,
    textAlign: 'center',
  },
  transactionsContainer: {
    width: '100%',
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  transactionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionTime: {
    fontSize: 10,
    marginTop: 1,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TransactionHistory;

