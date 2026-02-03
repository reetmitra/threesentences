import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Logo } from '@/components/ui/Logo';
import { Text } from '@/components/ui/Text';

export function LoadingScreen() {
    const footerOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(footerOpacity, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(footerOpacity, {
                    toValue: 0.3,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [footerOpacity]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Logo size={80} animated={false} />

                <View style={styles.textContainer}>
                    <Text variant="2xl" weight="bold" style={styles.title}>
                        Three Sentences
                    </Text>
                    <Text variant="base" color="secondary" style={styles.subtitle}>
                        be better, do better
                    </Text>
                    <Text variant="xs" color="tertiary" style={styles.caption}>
                        by 363™
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Animated.Text style={[styles.footerText, { opacity: footerOpacity }]}>
                    THREESIXTYTHREE™
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[8],
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: spacing[6],
    },
    title: {
        marginBottom: spacing[2],
        letterSpacing: 0.5,
    },
    subtitle: {
        fontStyle: 'italic',
        marginBottom: spacing[2],
    },
    caption: {
        marginTop: spacing[1],
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    footer: {
        marginBottom: spacing[4],
    },
    footerText: {
        color: colors.dark.textSecondary,
        fontSize: 10,
        letterSpacing: 3,
        fontWeight: '600',
        fontFamily: typography.fontFamily.primary,
    },
});
