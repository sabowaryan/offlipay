// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Animated: {
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
    })),
    View: ({ children, style, testID, ...props }) => ({
      type: 'View',
      props: { children, style, testID, ...props },
      children,
    }),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  View: ({ children, style, testID, ...props }) => ({
    type: 'View',
    props: { children, style, testID, ...props },
    children,
  }),
  Text: ({ children, style, testID, ...props }) => ({
    type: 'Text',
    props: { children, style, testID, ...props },
    children,
  }),
  TouchableOpacity: ({ children, style, testID, onPress, ...props }) => ({
    type: 'TouchableOpacity',
    props: { children, style, testID, onPress, ...props },
    children,
  }),
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
  },
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View: View,
      Text: require('react-native').Text,
      ScrollView: require('react-native').ScrollView,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withDelay: jest.fn((delay, value) => value),
    runOnJS: jest.fn((fn) => fn),
  };
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    State: { END: 5 },
  };
});

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};