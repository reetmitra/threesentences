/**
 * Three™ - Bottom Sheet Component
 *
 * Animated slide-up modal with brand easing and blurred backdrop.
 * Spec §1.5: entrance 280ms (sheet), 180ms (backdrop); exit 220ms both.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Modal, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_OUT = Easing.out(Easing.ease);

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
}

export function BottomSheet({ visible, onClose, children, maxHeight = 0.6 }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const sheetHeight = SCREEN_HEIGHT * maxHeight;

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: reduced ? 0 : 180, easing: EASE_OUT });
      translateY.value = withTiming(0, { duration: reduced ? 0 : 280, easing: BRAND });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: reduced ? 0 : 220, easing: BRAND });
      backdropOpacity.value = withTiming(0, { duration: reduced ? 0 : 220, easing: EASE_OUT });
    }
  }, [visible, reduced]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
      animationType="none"
    >
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={20}
              tint="dark"
              style={[StyleSheet.absoluteFillObject, styles.backdrop]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.backdrop]} />
          )}
        </Pressable>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            paddingBottom: insets.bottom + spacing[4],
            backgroundColor: colors.dark.surface,
          },
          sheetStyle,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.dark.frame }]} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});
