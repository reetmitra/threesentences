import { Platform, PixelRatio } from 'react-native';

export function getFontScale(): number {
  return PixelRatio.getFontScale();
}

export function scaleFontSize(size: number): number {
  const scale = Math.min(Math.max(getFontScale(), 0.8), 1.5);
  return Math.round(size * scale);
}

export const typography = {
  fontFamily: {
    sans: 'SchibstedGrotesk_400Regular',
    sansSemibold: 'SchibstedGrotesk_600SemiBold',
    sansBold: 'SchibstedGrotesk_700Bold',
    primary: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'System' }) as string,
    serif: 'Newsreader_400Regular',
    serifItalic: 'Newsreader_400Regular_Italic',
    serifSemiboldItalic: 'Newsreader_600SemiBold_Italic',
    mono: 'IBMPlexMono_400Regular',
    monoMedium: 'IBMPlexMono_500Medium',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    display: 40,
    hero: 64,
  } as const,
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  } as const,
  letterSpacing: {
    mono: 0.5,
    wide: 1,
    wider: 2,
  } as const,
};

export function getScaledFontSizes(): { xs: number; sm: number; base: number; lg: number; xl: number; '2xl': number; '3xl': number; display: number; hero: number } {
  return {
    xs: scaleFontSize(typography.fontSize.xs),
    sm: scaleFontSize(typography.fontSize.sm),
    base: scaleFontSize(typography.fontSize.base),
    lg: scaleFontSize(typography.fontSize.lg),
    xl: scaleFontSize(typography.fontSize.xl),
    '2xl': scaleFontSize(typography.fontSize['2xl']),
    '3xl': scaleFontSize(typography.fontSize['3xl']),
    display: scaleFontSize(typography.fontSize.display),
    hero: scaleFontSize(typography.fontSize.hero),
  };
}
