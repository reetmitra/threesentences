/**
 * Three™ - Toast Notification Component
 *
 * Animated slide-in notifications with type-based styling.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
}

const TOAST_COLORS: Record<ToastType, string> = {
  success: '#22C55E',
  error: colors.dark.error,
  warning: colors.dark.warning,
  info: colors.dark.accent,
};

const TOAST_ICONS: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const HAPTIC_MAP: Record<ToastType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  info: Haptics.NotificationFeedbackType.Success,
};

export function Toast({
  type,
  message,
  visible,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 200 });
      Haptics.notificationAsync(HAPTIC_MAP[type]);

      // Auto-dismiss
      const timer = setTimeout(() => {
        dismiss();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-120, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const dismiss = () => {
    translateY.value = withTiming(-120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(onDismiss, 300);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const Icon = TOAST_ICONS[type];
  const accentColor = TOAST_COLORS[type];

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + spacing[2] },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={dismiss}
        style={[styles.toast, { borderLeftColor: accentColor }]}
      >
        <Icon size={20} color={accentColor} strokeWidth={2} />
        <Text variant="sm" weight="medium" style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <X size={16} color={colors.dark.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
  },
});
