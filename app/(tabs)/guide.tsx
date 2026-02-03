/**
 * ThreeSixtyThree™ Three Sentences - Guide Screen
 * 
 * Motivational carousel with "Project 363" philosophy.
 * Auto-rotating slides every 6 seconds.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd5039?auto=format&fit=crop&w=800&q=80', // Dark minimal desk
        title: '1. Three Sentences',
        subtitle: 'The Constraint.',
        body: 'That is all. No more, no less.\nConstraint breeds creativity.\nFocus on the essence.',
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1517836357463-c25dfe949227?auto=format&fit=crop&w=800&q=80', // Dark gym
        title: '2. Build Iron Habits',
        subtitle: 'The Grind.',
        body: 'Momentum is everything.\nDo not break the chain.\n363 days to a new you.',
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80', // Night city
        title: '3. No Edits',
        subtitle: 'The Truth.',
        body: 'Embrace imperfection.\nOnce written, it stands forever.\nHonesty over polish.',
    },
    {
        id: '4',
        image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80', // Code/Focus
        title: '4. Go Ghost',
        subtitle: 'The Focus.',
        body: 'In a world of noise, find your signal.\nBlock the distractions.\nWrite. Every. Day.',
    },
    {
        id: '5',
        image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80', // Abstract
        title: '5. Execute',
        subtitle: 'The Action.',
        body: 'No excuses anymore.\nYou either want it or you don\'t.\nStart today.',
    },
];

export default function GuideScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const activeColors = colors.dark;

    // Auto-rotation
    useEffect(() => {
        const timer = setInterval(() => {
            if (currentIndex < SLIDES.length - 1) {
                flatListRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                });
                setCurrentIndex(currentIndex + 1);
            } else {
                flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                });
                setCurrentIndex(0);
            }
        }, 6000); // 6 seconds

        return () => clearInterval(timer);
    }, [currentIndex]);

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
        <View style={styles.slide}>
            <View style={[styles.card, { backgroundColor: activeColors.background }]}>
                <View style={styles.contentContainer}>
                    <Text variant="3xl" weight="bold" style={styles.title}>
                        {item.title}
                    </Text>
                    <Text variant="lg" color="accent" weight="medium" style={styles.subtitle}>
                        {item.subtitle}
                    </Text>
                    <View style={styles.divider} />
                    <Text variant="base" color="secondary" style={styles.body}>
                        {item.body}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top']}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text variant="xl" weight="bold" style={styles.headerTitle}>The Guide</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.floor(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                style={styles.list}
            />

            {/* Pagination Container */}
            <View style={styles.pagination}>
                {SLIDES.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    index === currentIndex
                                        ? activeColors.accent
                                        : activeColors.border,
                                width: index === currentIndex ? 24 : 6,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Footer removed: Now global */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    headerTitle: {
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    list: {
        flex: 1,
    },
    slide: {
        width: width,
        height: height * 0.7, // Takes up most of the screen
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[4],
    },
    card: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        padding: spacing[6],
    },
    contentContainer: {
        marginBottom: spacing[8],
    },
    title: {
        marginBottom: spacing[2],
        letterSpacing: -0.5,
    },
    subtitle: {
        marginBottom: spacing[4],
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        width: 60,
        marginBottom: spacing[4],
    },
    body: {
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[4],
        marginTop: spacing[2],
        gap: 6,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    footer: {
        textAlign: 'center',
        marginBottom: spacing[4],
        opacity: 0.5,
        letterSpacing: 1,
    },
});
