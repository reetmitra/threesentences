import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Calendar, Heart } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
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

    const rules: { renderIcon: () => React.ReactNode; text: string }[] = [
        { renderIcon: () => <Icon name="edit" size={20} color={colors.dark.textSecondary} />, text: '3 SENTENCES' },
        { renderIcon: () => <Calendar size={20} color={colors.dark.textSecondary} />, text: 'EVERY DAY' },
        { renderIcon: () => <Heart size={20} color={colors.dark.textSecondary} />, text: 'GRACE (363/365)' },
        { renderIcon: () => <Icon name="lock" size={20} color={colors.dark.textSecondary} />, text: 'STAY MINDFUL' },
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
                <Text variant="sm" family="sansSemibold" style={styles.header}>
                    THE 363 PHILOSOPHY
                </Text>
                <View style={styles.line} />
            </View>

            <View style={styles.grid}>
                {rules.map((rule, index) => (
                    <View key={index} style={styles.item}>
                        <View style={styles.icon}>{rule.renderIcon()}</View>
                        <Text variant="xs" family="serif" color="secondary" style={styles.ruleText}>
                            {rule.text}
                        </Text>
                    </View>
                ))}
            </View>
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
        backgroundColor: colors.dark.frame,
    },
    header: {
        marginHorizontal: spacing[4],
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: colors.dark.textPrimary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[2],
    },
    item: {
        width: '48%',
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
});

