import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'ghost' | 'outline';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    disabled,
    loading,
    style
}: ButtonProps) {
    const scheme = useColorScheme() ?? 'dark';
    const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const getBackgroundColor = () => {
        if (variant === 'ghost' || variant === 'outline') return 'transparent';
        if (disabled) return activeColors.surfaceHover; // Muted background for disabled
        return activeColors.accent;
    };

    const getTextColor = () => {
        if (disabled) return 'tertiary';
        if (variant === 'primary') return 'primary'; // Or white if accent is dark? Spec says textPrimary is generic
        return 'accent';
    };

    const containerStyle: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        borderRadius: componentRadius.button,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: variant === 'outline' ? activeColors.border : 'transparent',
        opacity: disabled && variant !== 'primary' ? 0.5 : 1,
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[containerStyle, style]}
        >
            {loading ? (
                <ActivityIndicator color={activeColors.textPrimary} />
            ) : (
                <Text
                    variant="base"
                    weight="medium"
                    color={getTextColor()}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}
