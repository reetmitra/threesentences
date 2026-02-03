import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '@/theme/colors';

interface Logo363Props {
    size?: number;
    color?: string;
    animated?: boolean;
}

export function Logo363({ size = 80, color = colors.dark.textPrimary, animated = true }: Logo363Props) {
    const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

    useEffect(() => {
        if (animated) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [animated]);

    const fontSize = size;

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <Animated.Text
                style={[
                    styles.logo,
                    {
                        fontSize,
                        color,
                    }
                ]}
            >
                363
            </Animated.Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontWeight: '800',
        letterSpacing: 8,
    },
});
