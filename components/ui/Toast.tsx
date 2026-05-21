import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
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

const EASE_OUT = Easing.out(Easing.ease);

export function Toast({ type, message, visible, duration = 2400, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-10);
  const opacity = useSharedValue(0);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 180, easing: EASE_OUT });
    translateY.value = withTiming(-10, { duration: 180, easing: EASE_OUT }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  }, [onDismiss, opacity, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 240, easing: EASE_OUT });
      opacity.value = withTiming(1, { duration: 240, easing: EASE_OUT });
      const timer = setTimeout(() => hide(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const borderColor = type === 'error' ? colors.dark.warn : colors.dark.frame;

  return (
    <View
      style={{
        position: 'absolute',
        alignSelf: 'center',
        width: '100%',
        top: insets.top + spacing[3],
        pointerEvents: visible ? 'box-none' : 'none',
        zIndex: 9999,
        elevation: 10,
      }}
    >
      <Animated.View
        style={[
          styles.container,
          { borderColor },
          animatedStyle,
        ]}
      >
        <Pressable onPress={hide} hitSlop={8}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  message: {
    color: colors.dark.textPrimary,
    letterSpacing: 1.4,
  },
});
