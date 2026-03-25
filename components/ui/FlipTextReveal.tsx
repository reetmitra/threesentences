/**
 * Three™ - FlipTextReveal
 *
 * Staggered per-character reveal using only opacity + translateY.
 * NOTE: rotateX is intentionally omitted — it is not supported by
 * React Native's native driver and causes animation jank on iOS.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '@/theme/colors';

interface FlipTextRevealProps {
  word?: string;
  subtitle?: string;
  charSize?: number;
  subtitleSize?: number;
  color?: string;
  subtitleColor?: string;
  staggerDelay?: number;
}

export function FlipTextReveal({
  word = 'THREE',
  subtitle,
  charSize = 72,
  subtitleSize = 16,
  color = colors.dark.textPrimary,
  subtitleColor = colors.dark.textSecondary,
  staggerDelay = 80,
}: FlipTextRevealProps) {
  const chars = word.split('');
  const animValues = useRef(chars.map(() => new Animated.Value(0))).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered fade-up — opacity + translateY only (native driver safe)
    const charAnimations = chars.map((_, i) =>
      Animated.timing(animValues[i], {
        toValue: 1,
        duration: 500,
        delay: i * staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    const subtitleAnimation = Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    Animated.sequence([
      Animated.parallel(charAnimations),
      subtitleAnimation,
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        {chars.map((char, i) => {
          const opacity = animValues[i];
          const translateY = animValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          });

          return (
            <Animated.Text
              key={i}
              style={[
                styles.char,
                {
                  fontSize: charSize,
                  color,
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            >
              {char === ' ' ? '\u00A0' : char}
            </Animated.Text>
          );
        })}
      </View>

      {subtitle && (
        <Animated.Text
          style={[
            styles.subtitle,
            {
              fontSize: subtitleSize,
              color: subtitleColor,
              opacity: subtitleOpacity,
            },
          ]}
        >
          {subtitle}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 1,
  },
});
