/**
 * ThreeSixtyThree™ Three Sentences - Conversations Screen
 *
 * List of all active conversations with animated cards.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, MessageCircle, PenLine } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { ConversationCard } from '@/components/social';
import { SkeletonConversations } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Conversation, UserInfo } from '@/types/social';
import { getConversations } from '@/store/chat';
import { getCurrentUser } from '@/store/auth';
import { getProfile } from '@/store/profile';

export default function ConversationsScreen() {
    const activeColors = colors.dark;
    const { showToast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Animation
    const headerOpacity = useSharedValue(0);

    useEffect(() => {
        loadData();
        headerOpacity.value = withSpring(1, { damping: 15 });
    }, []);

    const loadData = async () => {
        try {
            const user = getCurrentUser();
            if (!user) return;

            const profile = await getProfile(user.id);
            const userInfo: UserInfo = {
                id: user.id,
                name: profile?.name || user.name || 'User',
                username: profile?.username || 'user',
                profileImage: profile?.profileImage,
            };
            setCurrentUser(userInfo);

            const convos = await getConversations(user.id);
            setConversations(convos);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            showToast('error', 'Could not load messages.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const handleConversationPress = useCallback((conversation: Conversation) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
            pathname: '/(tabs)/chat/[id]',
            params: { id: conversation.id },
        });
    }, []);

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
    }));

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: activeColors.background }]}
            edges={['top']}
        >
            {/* Header */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <Pressable
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={28} color={activeColors.textPrimary} strokeWidth={2} />
                </Pressable>
                <Text variant="xl" weight="bold" style={styles.headerTitle}>
                    Messages
                </Text>
                <Pressable
                    onPress={() => router.push('/(tabs)/social')}
                    style={styles.newChatButton}
                >
                    <PenLine size={22} color={activeColors.textPrimary} strokeWidth={2} />
                </Pressable>
            </Animated.View>

            {/* Conversations List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={activeColors.accent}
                    />
                }
            >
                {loading ? (
                    <SkeletonConversations />
                ) : conversations.length === 0 ? (
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(300)}
                        style={styles.emptyState}
                    >
                        <MessageCircle
                            size={64}
                            color={activeColors.textTertiary}
                            strokeWidth={1.5}
                        />
                        <Text variant="lg" weight="medium" style={styles.emptyTitle}>
                            No conversations yet
                        </Text>
                        <Text variant="base" color="secondary" centered style={styles.emptySubtitle}>
                            Find friends and start chatting
                        </Text>
                        <Pressable
                            onPress={() => router.push('/(tabs)/social')}
                            style={[styles.emptyButton, { backgroundColor: activeColors.accent }]}
                        >
                            <Text variant="base" weight="semibold" style={{ color: activeColors.background }}>
                                Find Friends
                            </Text>
                        </Pressable>
                    </Animated.View>
                ) : (
                    conversations.map((conversation, index) => (
                        <ConversationCard
                            key={conversation.id}
                            conversation={conversation}
                            currentUserId={currentUser?.id || ''}
                            onPress={handleConversationPress}
                            index={index}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[3],
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.dark.border,
    },
    backButton: {
        padding: spacing[2],
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
    },
    newChatButton: {
        padding: spacing[2],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: spacing[2],
        paddingBottom: spacing[8],
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[16],
        paddingHorizontal: spacing[6],
    },
    emptyTitle: {
        marginTop: spacing[4],
        marginBottom: spacing[2],
    },
    emptySubtitle: {
        marginBottom: spacing[6],
    },
    emptyButton: {
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[3],
        borderRadius: 24,
    },
});
