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
    // Staggered flip-up for each character
    const charAnimations = chars.map((_, i) =>
      Animated.timing(animValues[i], {
        toValue: 1,
        duration: 600,
        delay: i * staggerDelay,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      })
    );

    // Subtitle fade-in after all characters are revealed
    const subtitleAnimation = Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
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
            outputRange: [40, 0],
          });
          const rotateX = animValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: ['-90deg', '0deg'],
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
                  transform: [{ translateY }, { rotateX }],
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
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -2,
  },
  subtitle: {
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 1,
  },
});
