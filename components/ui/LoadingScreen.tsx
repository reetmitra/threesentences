import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Logo363 } from '@/components/ui/Logo363';
import { Text } from '@/components/ui/Text';

export function LoadingScreen() {
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Smooth fade in for all content
        Animated.sequence([
            Animated.delay(800),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();

        // Footer fades in slightly later
        Animated.sequence([
            Animated.delay(2000),
            Animated.timing(footerOpacity, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
                <Logo363 size={72} animated={false} />
                <Text variant="lg" weight="medium" style={styles.title}>
                    Three Sentences
                </Text>
                <Text variant="sm" color="secondary" style={styles.tagline}>
                    be better, do better.
                </Text>
            </Animated.View>

            <Animated.View style={[styles.footerContainer, { opacity: footerOpacity }]}>
                <Text variant="xs" color="tertiary" style={styles.footer}>
                    THREESIXTYTHREE
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        marginTop: spacing[5],
        letterSpacing: 2,
    },
    tagline: {
        marginTop: spacing[2],
        letterSpacing: 0.5,
    },
    footerContainer: {
        position: 'absolute',
        bottom: spacing[16],
    },
    footer: {
        letterSpacing: 4,
    },
});
