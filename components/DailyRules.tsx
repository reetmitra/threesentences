import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PenLine, Lock, Calendar, Heart } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function DailyRules() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                delay: 300,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
                delay: 300,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const rules = [
        { icon: PenLine, text: '3 SENTENCES' },
        { icon: Calendar, text: 'EVERY DAY' },
        { icon: Heart, text: 'GRACE (363/365)' },
        { icon: Lock, text: 'STAY MINDFUL' },
    ];

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text variant="sm" weight="bold" style={styles.header}>
                    THE 363 PHILOSOPHY
                </Text>
                <View style={styles.line} />
            </View>

            <View style={styles.grid}>
                {rules.map((rule, index) => (
                    <View key={index} style={styles.item}>
                        <rule.icon size={20} color={colors.dark.textSecondary} style={styles.icon} />
                        <Text variant="xs" weight="medium" color="secondary" style={styles.ruleText}>
                            {rule.text}
                        </Text>
                    </View>
                ))}
            </View>

            <Text variant="xs" color="tertiary" style={styles.footer}>
                BY @363v1
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing[8],
        marginBottom: spacing[4],
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: colors.dark.border,
    },
    header: {
        marginHorizontal: spacing[4],
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: colors.dark.textSecondary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[2],
    },
    item: {
        width: '48%', // Two columns
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    icon: {
        marginRight: spacing[3],
    },
    ruleText: {
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    footer: {
        textAlign: 'center',
        marginTop: spacing[6],
        letterSpacing: 2,
        opacity: 0.5,
    },
});
