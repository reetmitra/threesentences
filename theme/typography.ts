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

export const TypeStyle = {
  displayXL:    { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 84, letterSpacing: -3,   lineHeight: 84  },
  display:      { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 56, letterSpacing: -1.5, lineHeight: 56  },
  hero:         { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 38, letterSpacing: -0.7, lineHeight: 38  },
  streakHero:   { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 64, letterSpacing: -1.8, lineHeight: 64  },
  streakLadder: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 40, letterSpacing: -1.0, lineHeight: 40  },
  sectionLarge: { fontFamily: 'SchibstedGrotesk_600SemiBold', fontSize: 30, letterSpacing: -0.6, lineHeight: 31.5 },
  h2Modal:      { fontFamily: 'SchibstedGrotesk_600SemiBold', fontSize: 22, letterSpacing: -0.3, lineHeight: 26.4 },
  h3Card:       { fontFamily: 'SchibstedGrotesk_500Medium',   fontSize: 16, letterSpacing: -0.2, lineHeight: 20.8 },
  body:         { fontFamily: 'SchibstedGrotesk_400Regular',  fontSize: 14, letterSpacing: -0.1, lineHeight: 21  },
  bodySmall:    { fontFamily: 'SchibstedGrotesk_400Regular',  fontSize: 13, letterSpacing: -0.1, lineHeight: 20.15 },
  reading:      { fontFamily: 'Newsreader_400Regular',        fontSize: 17, letterSpacing: -0.1, lineHeight: 27.2 },
  readingLg:    { fontFamily: 'Newsreader_400Regular',        fontSize: 18, letterSpacing: -0.1, lineHeight: 28.8 },
  eyebrow:      { fontFamily: 'IBMPlexMono_500Medium',        fontSize: 11, letterSpacing: 1.4,  lineHeight: 11, textTransform: 'uppercase' as const },
  eyebrowLoud:  { fontFamily: 'IBMPlexMono_500Medium',        fontSize: 12, letterSpacing: 3.0,  lineHeight: 12, textTransform: 'uppercase' as const },
  meta:         { fontFamily: 'IBMPlexMono_500Medium',        fontSize: 10, letterSpacing: 1.2,  lineHeight: 10, textTransform: 'uppercase' as const },
  metaSm:       { fontFamily: 'IBMPlexMono_500Medium',        fontSize: 9,  letterSpacing: 0.8,  lineHeight: 14.4, textTransform: 'uppercase' as const },
} as const;

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
