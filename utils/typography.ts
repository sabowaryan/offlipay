import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const TYPO = StyleSheet.create({
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: COLORS.GRAY_DARK,
  },
  h2: {
    fontFamily: 'Inter-Medium',
    fontSize: 24,
    color: COLORS.GRAY_DARK,
  },
  h3: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: COLORS.GRAY_DARK,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
  },
}); 