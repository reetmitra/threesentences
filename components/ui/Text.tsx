import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { colors } from '@/theme/colors';
import { typography, getScaledFontSizes } from '@/theme/typography';

type FontFamily =
  | 'sans'               // SchibstedGrotesk_400Regular — default UI
  | 'sansSemibold'       // SchibstedGrotesk_600SemiBold — headings, CTAs
  | 'sansBold'           // SchibstedGrotesk_700Bold
  | 'serif'              // Newsreader_400Regular — reading-mode entries (upright)
  | 'serifItalic'        // Newsreader_400Regular_Italic — wordmark, display numerals ≥ 40px ONLY
  | 'serifSemiboldItalic' // Newsreader_600SemiBold_Italic — milestone numbers
  | 'mono'               // IBMPlexMono_400Regular — metadata, eyebrows
  | 'monoMedium';        // IBMPlexMono_500Medium — counters

interface TextProps extends RNTextProps {
  variant?: keyof ReturnType<typeof getScaledFontSizes>;
  family?: FontFamily;
  /** Shorthand: serif upright (reading mode) */
  serif?: boolean;
  /** Shorthand: mono metadata */
  mono?: boolean;
  color?: 'primary' | 'bright' | 'secondary' | 'tertiary' | 'accent' | 'warn';
  centered?: boolean;
  fixedSize?: boolean;
  uppercase?: boolean;
}

export function Text({
  style,
  variant = 'base',
  family,
  serif,
  mono,
  color = 'primary',
  centered,
  fixedSize = false,
  uppercase,
  allowFontScaling = true,
  ...props
}: TextProps) {
  const activeColors = colors.dark;
  const scaledSizes = getScaledFontSizes();
  const fontSize = fixedSize
    ? (typography.fontSize[variant as keyof typeof typography.fontSize] ?? 16)
    : (scaledSizes[variant] ?? 16);

  const getFontFamily = (): string => {
    if (family) return typography.fontFamily[family];
    if (mono) return typography.fontFamily.mono;
    if (serif) return typography.fontFamily.serif;
    return typography.fontFamily.sans;
  };

  const getTextColor = (): string => {
    const map: Record<string, string> = {
      primary: activeColors.textPrimary,
      bright: activeColors.textBright,
      secondary: activeColors.textSecondary,
      tertiary: activeColors.textTertiary,
      accent: activeColors.accent,
      warn: activeColors.warn,
    };
    return map[color] ?? activeColors.textPrimary;
  };

  return (
    <RNText
      style={[
        {
          fontSize,
          fontFamily: getFontFamily(),
          color: getTextColor(),
          textAlign: centered ? 'center' : undefined,
          textTransform: uppercase ? 'uppercase' : undefined,
        },
        style,
      ]}
      allowFontScaling={allowFontScaling && !fixedSize}
      {...props}
    />
  );
}
