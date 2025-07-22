import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IllustrationProps } from '@/types';

export const SyncProcess: React.FC<IllustrationProps> = ({
  theme,
  animated,
  size,
  onAnimationComplete
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Placeholder for sync process visualization animation */}
      <View style={[
        styles.placeholder,
        { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
    opacity: 0.3,
  },
});