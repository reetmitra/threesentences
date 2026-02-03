import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface LogoProps {
    size?: number;
    color?: string;
    animated?: boolean;
}

export function Logo({ size = 64, color = colors.dark.accent, animated = false }: LogoProps) {
    const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const scale = useRef(new Animated.Value(animated ? 0.9 : 1)).current;

    useEffect(() => {
        if (animated) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 0.95,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animated, opacity, scale]);

    return (
        <Animated.View
            style={[
                styles.container,
                animated && { opacity, transform: [{ scale }] }
            ]}
        >
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M2 17L12 22L22 17"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M2 12L12 17L22 12"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
