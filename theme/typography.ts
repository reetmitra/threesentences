/**
 * ThreeSixtyThree™ Three Sentences - Typography
 * 
 * Per PRD Section 7.3: Dynamic type support - interface scales with system font size.
 */

import { Platform, PixelRatio } from 'react-native';

/**
 * Get the font scale from system settings.
 * This allows users with accessibility needs to scale text.
 */
export function getFontScale(): number {
  return PixelRatio.getFontScale();
}

/**
 * Scale a font size based on system accessibility settings.
 * Respects user's preferred text size.
 */
export function scaleFontSize(size: number): number {
  const scale = getFontScale();
  // Clamp scale between 0.8 and 1.5 to prevent extreme sizes
  const clampedScale = Math.min(Math.max(scale, 0.8), 1.5);
  return Math.round(size * clampedScale);
}

export const typography = {
  fontFamily: {
    // Primary: System default (SF Pro on iOS, Roboto on Android) per PRD 8.2
    primary: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
    // Serif: For reading past entries, creating visual distinction per PRD 8.2
    serif: Platform.select({ ios: 'Charter', android: 'serif', default: 'serif' }),
    // Mono: For sentence counter "2/3" display to prevent layout shift per PRD 8.2
    mono: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
  },

  // Base font sizes (will be scaled by getFontScale)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },

  // Weights need to be strings for React Native
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,

  // Line height multipliers (relative to font size)
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Get scaled font sizes based on system accessibility settings.
 * Call this when rendering to get current scaled values.
 */
export function getScaledFontSizes() {
  return {
    xs: scaleFontSize(typography.fontSize.xs),
    sm: scaleFontSize(typography.fontSize.sm),
    base: scaleFontSize(typography.fontSize.base),
    lg: scaleFontSize(typography.fontSize.lg),
    xl: scaleFontSize(typography.fontSize.xl),
    '2xl': scaleFontSize(typography.fontSize['2xl']),
    '3xl': scaleFontSize(typography.fontSize['3xl']),
  };
}
