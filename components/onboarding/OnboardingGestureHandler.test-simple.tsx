import React from 'react';
import { View } from 'react-native';

interface TestProps {
  children: React.ReactNode;
}

const TestComponent: React.FC<TestProps> = ({ children }) => {
  return <View>{children}</View>;
};

export default TestComponent;