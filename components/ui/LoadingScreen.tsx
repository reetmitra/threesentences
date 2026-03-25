/**
 * Three™ - Loading Screen
 *
 * A refined brand moment on every launch.
 * Three acts: logo surfaces → name rises → tagline settles.
 *
 * All animations use only opacity, translateY, scale, scaleX —
 * properties fully supported by the native driver.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/colors';

const EASE_OUT = Easing.out(Easing.cubic);
const t = (ms: number) => ({ duration: ms, easing: EASE_OUT });

export function LoadingScreen() {
  const c = colors.dark;

  // Act 1 – logo mark
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.84);

  // Act 2 – word mark
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(16);

  // Act 3 – separator line
  const lineOpacity = useSharedValue(0);
  const lineScaleX = useSharedValue(0);

  // Act 4 – tagline
  const tagOpacity = useSharedValue(0);
  const tagY = useSharedValue(10);

  useEffect(() => {
    // Logo fades in and settles (0ms)
    logoOpacity.value = withTiming(1, t(700));
    logoScale.value = withTiming(1, t(1000));

    // Word mark rises from below (320ms)
    wordOpacity.value = withDelay(320, withTiming(1, t(600)));
    wordY.value = withDelay(320, withTiming(0, t(700)));

    // Hairline extends outward (680ms)
    lineOpacity.value = withDelay(680, withTiming(1, t(250)));
    lineScaleX.value = withDelay(680, withTiming(1, t(550)));

    // Tagline settles (980ms)
    tagOpacity.value = withDelay(980, withTiming(1, t(650)));
    tagY.value = withDelay(980, withTiming(0, t(650)));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    opacity: lineOpacity.value,
    transform: [{ scaleX: lineScaleX.value }],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Act 1: Logo mark */}
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L20 6.5L12 11L4 6.5L12 2Z"
            stroke={c.textPrimary}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13 12L21 7.5V16.5L13 21V12Z"
            stroke={c.textPrimary}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M11 12L3 7.5V16.5L11 21V12Z"
            stroke={c.textPrimary}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* Act 2: Word mark */}
      <Animated.Text style={[styles.wordMark, { color: c.textPrimary }, wordStyle]}>
        THREE
      </Animated.Text>

      {/* Act 3: Hairline separator */}
      <Animated.View
        style={[styles.separator, { backgroundColor: c.border }, lineStyle]}
      />

      {/* Act 4: Tagline */}
      <Animated.Text style={[styles.tagline, { color: c.textSecondary }, tagStyle]}>
        be better, do better
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
  logoWrapper: {
    marginBottom: 26,
  },
  wordMark: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 10,
    // Compensate for trailing letter-spacing so text appears optically centred
    paddingLeft: 10,
  },
  separator: {
    marginTop: 22,
    width: 44,
    height: 1,
  },
  tagline: {
    marginTop: 16,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    paddingLeft: 2.5,
  },
});
