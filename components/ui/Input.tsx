import React from 'react';
import { TextInput, TextInputProps, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, componentRadius } from '@/theme/spacing';

interface InputProps extends TextInputProps {
    error?: boolean;
    containerStyle?: ViewStyle;
}

export function Input({
    style,
    error,
    containerStyle,
    ...props
}: InputProps) {
    const scheme = useColorScheme() ?? 'dark';
    const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

    return (
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: activeColors.surface,
                    color: activeColors.textPrimary,
                    borderColor: error ? activeColors.error : activeColors.border,
                    borderRadius: componentRadius.input,
                },
                style
            ]}
            placeholderTextColor={activeColors.textSecondary}
            selectionColor={activeColors.accent}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        padding: spacing[3],
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.primary,
        borderWidth: 1,
    },
});
