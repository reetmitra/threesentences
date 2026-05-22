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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
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
    Conversation,
    Message,
    UserInfo,
    getOtherParticipant,
    getInitials,
} from '@/types/social';
import {
    getConversationById,
    getMessages,
    sendMessage,
    markMessagesAsRead,
} from '@/store/chat';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/store/profile';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const activeColors = colors.dark;
    const { userId, user } = useAuth();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const headerOpacity = useSharedValue(0);

    useEffect(() => {
        loadData();
        headerOpacity.value = withTiming(1, { duration: 300 });
    }, [id]);

    const loadData = async () => {
        if (!id || !userId) return;

        try {
            const profile = await getProfile(userId);
            const userInfo: UserInfo = {
                id: userId,
                name: profile?.name || user?.name || 'User',
                username: profile?.username || 'user',
                profileImage: profile?.profileImage,
            };
            setCurrentUser(userInfo);

            const [conv, msgs] = await Promise.all([
                getConversationById(userId, id),
                getMessages(userId, id),
            ]);

            setConversation(conv);
            setMessages(msgs);

            // Mark as read
            if (conv) {
                await markMessagesAsRead(userId, id);
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = useCallback(async (content: string) => {
        if (!currentUser || !id || sending) return;

        setSending(true);
        try {
            const newMessage = await sendMessage(id, currentUser.id, content);
            setMessages(prev => [...prev, newMessage]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setSending(false);
        }
    }, [currentUser, id, sending]);

    const handleTypingStart = useCallback(() => {
        // Typing indicators would require additional realtime setup
        // For now, this is a no-op
    }, [currentUser, id]);

    const handleTypingEnd = useCallback(() => {
        // Typing indicators would require additional realtime setup
    }, [currentUser, id]);

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
    }));

    const otherUser = conversation && currentUser
        ? getOtherParticipant(conversation, currentUser.id)
        : null;

    const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
        if (!currentUser) return null;

        const isLastInGroup = index === messages.length - 1 ||
            messages[index + 1]?.senderId !== item.senderId;

        return (
            <MessageBubble
                message={item}
                currentUserId={currentUser.id}
                showTimestamp={isLastInGroup}
                isLastInGroup={isLastInGroup}
                index={index}
            />
        );
    }, [currentUser, messages]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.accent} />
                </View>
            </SafeAreaView>
        );
    }

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
                    <Icon name="arrowL" size={28} color={activeColors.textPrimary} strokeWidth={2} />
                </Pressable>

                <View style={styles.headerContent}>
                    {otherUser && (
                        <>
                            <View style={[styles.avatar, { backgroundColor: activeColors.accentSubtle }]}>
                                <Text variant="base" family="sansBold" style={{ color: activeColors.accent }}>
                                    {getInitials(otherUser.name)}
                                </Text>
                            </View>
                            <View style={styles.headerText}>
                                <Text variant="base" family="sansSemibold" numberOfLines={1}>
                                    {otherUser.name}
                                </Text>
                                {conversation?.isTyping && (
                                    <Animated.Text
                                        entering={FadeIn.duration(200)}
                                        style={[styles.typingText, { color: activeColors.accent }]}
                                    >
                                        typing...
                                    </Animated.Text>
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
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    inverted={false}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text variant="base" color="secondary" centered>
                                No messages yet
                            </Text>
                            <Text variant="sm" color="tertiary" centered style={{ marginTop: spacing[2] }}>
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
                        disabled={sending}
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
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[3],
    },
    headerText: {
        flex: 1,
    },
    typingText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    keyboardView: {
        flex: 1,
    },
    messageList: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[16],
    },
});
