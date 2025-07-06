// Import direct selon la plateforme
import { Platform } from 'react-native';

export const secureStorage = Platform.OS === 'web' 
  ? require('./secureStorage.web').secureStorage
  : require('./secureStorage.native').secureStorage;

export type { SecureStorage } from '../secureStorage'; 