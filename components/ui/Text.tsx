import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface TextProps extends RNTextProps {
    variant?: keyof typeof typography.fontSize;
    weight?: keyof typeof typography.fontWeight;
    color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'warning' | 'error';
    serif?: boolean;
    mono?: boolean;
    centered?: boolean;
}

export function Text({
    style,
    variant = 'base',
    weight = 'regular',
    color = 'primary',
    serif,
    mono,
    centered,
    ...props
}: TextProps) {
    const scheme = useColorScheme() ?? 'dark'; // Default to dark per spec vibe
    const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

    const textStyle = {
        fontSize: typography.fontSize[variant],
        fontWeight: typography.fontWeight[weight],
        fontFamily: mono
            ? typography.fontFamily.mono
            : serif
                ? typography.fontFamily.serif
                : typography.fontFamily.primary,
        color: activeColors[`text${color.charAt(0).toUpperCase() + color.slice(1)}` as keyof typeof activeColors] || activeColors[color as keyof typeof activeColors],
        textAlign: (centered ? 'center' : 'auto') as 'center' | 'auto' | 'left' | 'right' | 'justify',
    };

    return (
        <RNText
            style={[textStyle, style]}
            {...props}
        />
    );
}
