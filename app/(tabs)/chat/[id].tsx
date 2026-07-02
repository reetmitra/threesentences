/**
 * ThreeSixtyThree™ Three Sentences - Chat Screen
 *
 * Individual conversation view with animated messages.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    FadeIn,
    SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { MessageBubble, ChatInput } from '@/components/social';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
    Message,
    UserInfo,
    getInitials,
} from '@/types/social';
import {
    getMessages,
    sendMessage,
    markAsRead,
    subscribeToMessages,
    subscribeToTyping,
    subscribeToMessageReads,
    broadcastTyping,
} from '@/store/chat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/config/supabase';

// ─── DB row types ─────────────────────────────────────────────────────────────

interface DbConversationRow {
    id: string;
    user_a_id: string;
    user_b_id: string;
    last_message_content: string | null;
    last_message_at: string | null;
    last_message_sender_id: string | null;
    unread_count_a: number;
    unread_count_b: number;
    created_at: string;
    updated_at: string | null;
}

interface DbProfileRow {
    user_id: string;
    name: string;
    username: string;
    profile_image: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const activeColors = colors.dark;
    const { userId, isLoaded } = useAuth();

    // State
    const [otherUser, setOtherUser] = useState<UserInfo | null>(null);
    // Descending order: newest first (index 0). Required for inverted FlatList.
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [isTypingActive, setIsTypingActive] = useState(false);

    const flatListRef = useRef<FlatList<Message>>(null);
    const headerOpacity = useSharedValue(0);
    // Clears a stuck "typing..." if the peer's typing-end broadcast never arrives
    // (network drop, app killed mid-keystroke).
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    // ─── Mount sequence ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!isLoaded || !id || !userId) return;

        headerOpacity.value = withTiming(1, { duration: 300 });

        let unsubMessages: (() => void) | null = null;
        let unsubTyping: (() => void) | null = null;
        let unsubReads: (() => void) | null = null;

        (async () => {
            try {
                // 1. Load conversation row directly
                const { data: convRow, error: convError } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (convError || !convRow) {
                    console.error('Failed to load conversation:', convError);
                    setLoading(false);
                    return;
                }

                const row = convRow as DbConversationRow;
                const otherUserId =
                    row.user_a_id === userId ? row.user_b_id : row.user_a_id;

                // 2. Fetch other participant's profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('user_id, name, username, profile_image')
                    .eq('user_id', otherUserId)
                    .maybeSingle();

                const profile = profileData as DbProfileRow | null;
                const other: UserInfo = profile
                    ? {
                          id: profile.user_id,
                          name: profile.name,
                          username: profile.username,
                          profileImage: profile.profile_image ?? undefined,
                      }
                    : { id: otherUserId, name: 'User', username: 'user' };

                setOtherUser(other);

                // 3. Fetch last 30 messages (ascending from store → reverse to descending)
                const { messages: initialMsgs, nextCursor: cursor } =
                    await getMessages(id, null);
                setMessages([...initialMsgs].reverse()); // newest first
                setNextCursor(cursor);

                // 4. Mark as read
                await markAsRead(id, userId);

                // 5. Subscribe to new messages
                unsubMessages = subscribeToMessages(id, (newMsg) => {
                    setMessages((prev) => {
                        // Avoid duplicates (optimistic already added our own)
                        if (prev.some((m) => m.id === newMsg.id)) return prev;
                        return [newMsg, ...prev];
                    });
                    // The chat is open, so an incoming message is read on arrival —
                    // without this the sender's badge counts messages we're looking at.
                    if (newMsg.senderId !== userId) {
                        void markAsRead(id, userId);
                    }
                });

                // 6. Subscribe to typing
                unsubTyping = subscribeToTyping(id, (typingUserId, isTyping) => {
                    if (typingUserId !== userId) {
                        setIsTypingActive(isTyping);
                        if (typingTimeout.current) clearTimeout(typingTimeout.current);
                        if (isTyping) {
                            typingTimeout.current = setTimeout(() => setIsTypingActive(false), 4000);
                        }
                    }
                });

                // 7. Subscribe to read receipts: flip own messages to 'read' live
                unsubReads = subscribeToMessageReads(id, (messageId, senderId) => {
                    if (senderId !== userId) return;
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === messageId && m.status !== 'read'
                                ? { ...m, status: 'read' }
                                : m
                        )
                    );
                });
            } catch (err) {
                console.error('Failed to initialise chat:', err);
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            unsubMessages?.();
            unsubTyping?.();
            unsubReads?.();
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, id, userId]);

    // ─── AppState: mark read on foreground resume ─────────────────────────────

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' && id && userId) {
                void markAsRead(id, userId);
            }
        });
        return () => sub.remove();
    }, [id, userId]);

    // ─── Optimistic send ──────────────────────────────────────────────────────

    const handleSend = useCallback(
        async (content: string) => {
            if (!id || !userId) return;

            const optimisticId = Date.now().toString();
            const optimisticMsg: Message = {
                id: optimisticId,
                conversationId: id,
                senderId: userId,
                content,
                createdAt: new Date().toISOString(),
                status: 'sending',
            };

            // 1. Append optimistic message (newest first → unshift)
            setMessages((prev) => [optimisticMsg, ...prev]);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            try {
                // 2. Send to server
                const sentMsg = await sendMessage(id, userId, content);

                // 3. Replace optimistic with real message
                setMessages((prev) =>
                    prev.map((m) => (m.id === optimisticId ? sentMsg : m))
                );
            } catch (err) {
                console.error('Failed to send message:', err);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                // 4. Mark optimistic message as failed
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === optimisticId ? { ...m, status: 'failed' } : m
                    )
                );
            }
        },
        [id, userId]
    );

    // ─── Retry failed message ─────────────────────────────────────────────────

    const handleRetry = useCallback(
        async (failedMessage: Message) => {
            if (!id || !userId) return;

            // 1. Reset status to sending
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === failedMessage.id ? { ...m, status: 'sending' } : m
                )
            );

            try {
                // 2. Resend
                const sentMsg = await sendMessage(id, userId, failedMessage.content);

                // 3. Replace with real message
                setMessages((prev) =>
                    prev.map((m) => (m.id === failedMessage.id ? sentMsg : m))
                );
            } catch (err) {
                console.error('Failed to retry message:', err);

                // 4. Back to failed
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === failedMessage.id ? { ...m, status: 'failed' } : m
                    )
                );
            }
        },
        [id, userId]
    );

    // ─── Pagination: load older messages ─────────────────────────────────────

    const handleEndReached = useCallback(async () => {
        if (!id || !nextCursor || isLoadingOlder) return;

        setIsLoadingOlder(true);
        try {
            const { messages: olderMsgs, nextCursor: newCursor } =
                await getMessages(id, nextCursor);

            // olderMsgs is ascending (oldest first) → reverse to descending, concat to END
            setMessages((prev) => [...prev, ...[...olderMsgs].reverse()]);
            setNextCursor(newCursor);
        } catch (err) {
            console.error('Failed to load older messages:', err);
        } finally {
            setIsLoadingOlder(false);
        }
    }, [id, nextCursor, isLoadingOlder]);

    // ─── Typing indicators ────────────────────────────────────────────────────

    const handleTypingStart = useCallback(() => {
        if (!id || !userId) return;
        broadcastTyping(id, userId, true);
    }, [id, userId]);

    const handleTypingEnd = useCallback(() => {
        if (!id || !userId) return;
        broadcastTyping(id, userId, false);
    }, [id, userId]);

    // ─── Header animation ─────────────────────────────────────────────────────

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
    }));

    // ─── Render message ───────────────────────────────────────────────────────

    const renderMessage = useCallback(
        ({ item, index }: { item: Message; index: number }) => {
            if (!userId) return null;

            // In descending order: next item (higher index) is the OLDER message.
            // "Last in group" means the next item has a different sender (or doesn't exist).
            // This determines whether to show the timestamp below this bubble.
            const isLastInGroup =
                index === messages.length - 1 ||
                messages[index + 1]?.senderId !== item.senderId;

            return (
                <MessageBubble
                    message={item}
                    currentUserId={userId}
                    showTimestamp={isLastInGroup}
                    isLastInGroup={isLastInGroup}
                    index={index}
                    failed={item.status === 'failed'}
                    onRetry={() => handleRetry(item)}
                />
            );
        },
        [userId, messages, handleRetry]
    );

    // ─── Loading screen ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: activeColors.background }]}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.accent} />
                </View>
            </SafeAreaView>
        );
    }

    // ─── Main render ──────────────────────────────────────────────────────────

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
                    <Icon
                        name="arrowL"
                        size={28}
                        color={activeColors.textPrimary}
                        strokeWidth={2}
                    />
                </Pressable>

                <View style={styles.headerContent}>
                    {otherUser && (
                        <>
                            <View
                                style={[
                                    styles.avatar,
                                    { backgroundColor: activeColors.accentSubtle },
                                ]}
                            >
                                <Text
                                    variant="base"
                                    family="sansBold"
                                    style={{ color: activeColors.accent }}
                                >
                                    {getInitials(otherUser.name)}
                                </Text>
                            </View>
                            <View style={styles.headerText}>
                                <Text
                                    variant="base"
                                    family="sansSemibold"
                                    numberOfLines={1}
                                >
                                    {otherUser.name}
                                </Text>
                                {isTypingActive ? (
                                    <Animated.Text
                                        entering={FadeIn.duration(200)}
                                        style={[
                                            styles.typingText,
                                            { color: activeColors.accent },
                                        ]}
                                    >
                                        typing...
                                    </Animated.Text>
                                ) : (
                                    <Text
                                        style={{
                                            fontFamily: 'IBMPlexMono_400Regular',
                                            fontSize: 10,
                                            letterSpacing: 1.2,
                                            color: activeColors.textSecondary,
                                        }}
                                    >
                                        @{otherUser.username.replace(/^@+/, '')}
                                    </Text>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </Animated.View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList<Message>
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    inverted
                    onEndReached={nextCursor ? handleEndReached : undefined}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        isLoadingOlder ? (
                            <View style={styles.loadingOlderContainer}>
                                <ActivityIndicator
                                    size="small"
                                    color={activeColors.textTertiary}
                                />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text variant="base" color="secondary" centered>
                                No messages yet
                            </Text>
                            <Text
                                variant="sm"
                                color="tertiary"
                                centered
                                style={{ marginTop: spacing[2] }}
                            >
                                Send a message to start the conversation
                            </Text>
                        </View>
                    }
                />

                {/* Input */}
                <Animated.View entering={SlideInDown.duration(300).delay(200)}>
                    <ChatInput
                        onSend={handleSend}
                        onTypingStart={handleTypingStart}
                        onTypingEnd={handleTypingEnd}
                    />
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[3],
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.dark.border,
    },
    backButton: {
        padding: spacing[2],
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[3],
    },
    headerText: {
        flex: 1,
    },
    typingText: {
        fontSize: 12,
    },
    keyboardView: {
        flex: 1,
    },
    messageList: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        // Inverted list: flex-start (default) is the visual bottom. flex-end
        // here would pin sparse conversations to the top of the screen.
        flexGrow: 1,
    },
    loadingOlderContainer: {
        paddingVertical: spacing[4],
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[16],
    },
});
