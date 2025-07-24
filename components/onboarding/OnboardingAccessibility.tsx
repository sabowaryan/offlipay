import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform, UIManager, findNodeHandle } from 'react-native';

interface OnboardingAccessibilityProps {
  title: string;
  description: string;
  isScreenActive: boolean;
  reduceMotionEnabled: boolean;
  onReduceMotionChange: (enabled: boolean) => void;
  children: React.ReactNode;
}

const OnboardingAccessibility: React.FC<OnboardingAccessibilityProps> = ({
  title,
  description,
  isScreenActive,
  reduceMotionEnabled,
  onReduceMotionChange,
  children,
}) => {
  useEffect(() => {
    if (isScreenActive) {
      // Announce screen title for screen readers
      AccessibilityInfo.announceForAccessibility(`${title}. ${description}`);

      // Set accessibility focus to the current screen
      const tag = findNodeHandle(this);
      if (tag) {
        UIManager.sendAccessibilityEvent(tag, UIManager.AccessibilityEventTypes.typeViewFocused);
      }
    }
  }, [isScreenActive, title, description]);

  useEffect(() => {
    // Listen for reduce motion preference changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      onReduceMotionChange
    );
    return () => subscription.remove();
  }, [onReduceMotionChange]);

  useEffect(() => {
    // Get initial reduce motion preference
    AccessibilityInfo.isReduceMotionEnabled().then(onReduceMotionChange);
  }, [onReduceMotionChange]);

  return <>{children}</>;
};

export default OnboardingAccessibility;


