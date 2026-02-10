import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { FlipTextReveal } from '@/components/ui/FlipTextReveal';

export function LoadingScreen() {
    return (
        <View style={styles.container}>
            <FlipTextReveal
                word="THREE"
                subtitle="be better, do better"
                charSize={80}
                subtitleSize={15}
                color={colors.dark.textPrimary}
                subtitleColor={colors.dark.textSecondary}
                staggerDelay={90}
            />
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
});
