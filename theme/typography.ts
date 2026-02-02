import { Platform } from 'react-native';

export const typography = {
    fontFamily: {
        primary: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
        serif: Platform.select({ ios: 'Charter', android: 'serif', default: 'serif' }),
        mono: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }), // Using safe system defaults primarily
    },

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

    // Key text styles logic will be handled in components, but these are reference values
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    }
};
