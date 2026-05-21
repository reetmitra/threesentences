import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({ type, message, visible, duration = 3000, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const borderColor = type === 'error' ? colors.dark.warn : colors.dark.frame;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing[3],
          transform: [{ translateY }],
          opacity,
          borderColor,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable onPress={hide}>
        <Text
          family="monoMedium"
          variant="sm"
          fixedSize
          uppercase
          style={styles.message}
        >
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    zIndex: 9999,
    elevation: 10,
  },
  message: {
    color: colors.dark.textPrimary,
    letterSpacing: 1,
  },
});
