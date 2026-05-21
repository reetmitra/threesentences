import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const BRAND = Easing.bezier(0.16, 1, 0.3, 1);
const JUGGLE = Easing.bezier(0.34, 1.5, 0.64, 1);

function JuggleDot({ delay, arcHeight }: { delay: number; arcHeight: number }) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    y.value = withDelay(
      delay,
      withSequence(
        withTiming(-arcHeight, { duration: 420, easing: JUGGLE }),
        withTiming(arcHeight * 0.2, { duration: 350, easing: JUGGLE }),
        withTiming(0, { duration: 430, easing: JUGGLE }),
      ),
    );
  }, [reduced]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function LoadingScreen() {
  const reduced = useReducedMotion();
  const wordOpacity = useSharedValue(reduced ? 1 : 0);
  const wordY = useSharedValue(reduced ? 0 : 12);
  const tagOpacity = useSharedValue(reduced ? 1 : 0);
  const tagY = useSharedValue(reduced ? 0 : 12);

  useEffect(() => {
    if (reduced) return;
    wordOpacity.value = withDelay(950, withTiming(1, { duration: 800, easing: BRAND }));
    wordY.value = withDelay(950, withTiming(0, { duration: 800, easing: BRAND }));
    tagOpacity.value = withDelay(1350, withTiming(1, { duration: 700, easing: BRAND }));
    tagY.value = withDelay(1350, withTiming(0, { duration: 700, easing: BRAND }));
  }, [reduced]);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.dark.background }]}>
      <View style={styles.dotsRow}>
        <JuggleDot delay={0}   arcHeight={40} />
        <JuggleDot delay={140} arcHeight={48} />
        <JuggleDot delay={280} arcHeight={40} />
      </View>

      <Animated.Text style={[styles.wordMark, { color: colors.dark.textPrimary }, wordStyle]}>
        Three Sentences
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { color: colors.dark.textSecondary }, tagStyle]}>
        BE BETTER. DO BETTER.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
    marginBottom: 32,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFF0',
  },
  wordMark: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
