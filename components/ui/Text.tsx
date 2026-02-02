/**
 * ThreeSixtyThree™ Three Sentences - Text Component
 * 
 * Per PRD Section 7.3: Dynamic type support - interface scales with system font size.
 * Per PRD Section 8.2: Typography guidelines.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, useColorScheme } from 'react-native';
import { colors } from '@/theme/colors';
import { typography, getScaledFontSizes } from '@/theme/typography';

interface TextProps extends RNTextProps {
  variant?: keyof typeof typography.fontSize;
  weight?: keyof typeof typography.fontWeight;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'warning' | 'error';
  serif?: boolean;
  mono?: boolean;
  centered?: boolean;
  /** Disable font scaling for specific cases (like sentence counter) */
  fixedSize?: boolean;
}

export function Text({
  style,
  variant = 'base',
  weight = 'regular',
  color = 'primary',
  serif,
  mono,
  centered,
  fixedSize = false,
  allowFontScaling = true,
  ...props
}: TextProps) {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  // Get font size - either scaled or fixed based on prop
  const scaledSizes = getScaledFontSizes();
  const fontSize = fixedSize ? typography.fontSize[variant] : scaledSizes[variant];

  // Determine text color
  const getTextColor = () => {
    const colorMap: Record<string, keyof typeof activeColors> = {
      primary: 'textPrimary',
      secondary: 'textSecondary',
      tertiary: 'textTertiary',
      accent: 'accent',
      warning: 'warning',
      error: 'error',
    };
    return activeColors[colorMap[color] || 'textPrimary'];
  };

  const textStyle = {
    fontSize,
    fontWeight: typography.fontWeight[weight],
    fontFamily: mono
      ? typography.fontFamily.mono
      : serif
        ? typography.fontFamily.serif
        : typography.fontFamily.primary,
    color: getTextColor(),
    textAlign: (centered ? 'center' : 'auto') as 'center' | 'auto' | 'left' | 'right' | 'justify',
  };

  return (
    <RNText
      style={[textStyle, style]}
      allowFontScaling={allowFontScaling && !fixedSize}
      {...props}
    />
  );
}
