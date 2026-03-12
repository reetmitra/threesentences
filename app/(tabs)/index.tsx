/**
 * ThreeSixtyThree™ Three Sentences - Today Screen
 *
 * The main entry screen. Write three sentences, submit, done.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Text } from '@/components/ui/Text';
import { EntryInput } from '@/components/EntryInput';
import { SentenceCounter } from '@/components/SentenceCounter';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { MilestoneModal, isMilestone } from '@/components/MilestoneModal';
import { EntryCard } from '@/components/EntryCard';
import { SkeletonToday } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { countSentences } from '@/utils/sentenceDetection';
import {
  getTodayEntry,
  saveEntry,
  saveDraft,
  getDraft,
  getEntryStats,
} from '@/store/entries';
import { Entry, getTodayDateString } from '@/types/entry';

const AUTO_SAVE_INTERVAL = 5000;

// Custom Animated Button Component
const AnimatedButton = ({
  status,
  onPress,
  disabled
}: {
  status: 'idle' | 'submitting' | 'success';
  onPress: () => void;
  disabled: boolean;
}) => {
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;
  const widthAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'success') {
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 400,
          delay: 800,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (status === 'idle') {
      widthAnim.setValue(1);
      spinValue.setValue(0);
      fadeValue.setValue(1);
    }
  }, [status]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedWidth = initialWidth
    ? widthAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [56, initialWidth],
    })
    : '100%';

  const renderContent = () => {
    if (status === 'submitting') {
      return <ActivityIndicator color="#FFFFFF" size="small" />;
    }
    if (status === 'success') {
      return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Check color="#FFFFFF" size={24} />
        </Animated.View>
      );
    }
    return (
      <Animated.View style={{ opacity: fadeValue }}>
        <Text variant="base" weight="medium" style={{ color: '#FFFFFF' }}>Done</Text>
      </Animated.View>
    );
  };

  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(e) => {
        if (!initialWidth) setInitialWidth(e.nativeEvent.layout.width);
      }}
    >
      <Animated.View
        style={{
          opacity: fadeValue,
          width: animatedWidth,
          height: 56,
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || status !== 'idle'}
          style={[
            styles.animatedButton,
            {
              backgroundColor: disabled ? '#2A2A2A' : '#333333',
              opacity: disabled && status === 'idle' ? 0.5 : 1,
              width: '100%',
              marginTop: 0,
            }
          ]}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};


export default function TodayScreen() {
  const { userId } = useAuth();
  const activeColors = colors.dark;
  const { showToast } = useToast();

  // State
  const [content, setContent] = useState('');
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for auto-save
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');

  // Calculate sentence count
  const sentenceCount = countSentences(content);
  const canSubmit = sentenceCount === 3;

  // Load existing entry or draft on mount
  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const existing = await getTodayEntry(userId);
      if (existing) {
        setTodayEntry(existing);
        setContent('');
      } else {
        const draft = await getDraft();
        if (draft) {
          setContent(draft.content);
          lastSavedContent.current = draft.content;
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('error', "Couldn't load today's entry. Pull to refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Auto-save draft
  useEffect(() => {
    if (todayEntry) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      if (content !== lastSavedContent.current && content.trim()) {
        await saveDraft({
          content,
          date: getTodayDateString(),
          lastSaved: new Date().toISOString()
        });
        lastSavedContent.current = content;
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, todayEntry]);

  // Handle submission
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submissionStatus !== 'idle' || !userId) return;

    setShowConfirmation(false);
    setSubmissionStatus('submitting');

    try {
      const entry = await saveEntry(userId, content);

      setSubmissionStatus('success');
      showToast('success', 'Entry saved. See you tomorrow.');

      // Check for streak milestone
      const stats = await getEntryStats(userId);
      const streak = stats.currentStreak;

      // Wait for animation to finish before switching screens
      setTimeout(() => {
        setTodayEntry(entry);
        setContent('');
        setSubmissionStatus('idle');

        // Show milestone modal if applicable
        if (isMilestone(streak)) {
          setMilestoneStreak(streak);
          setShowMilestone(true);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to save entry:', error);
      showToast('error', 'Failed to save your entry. Please try again.');
      setSubmissionStatus('idle');
    }
  }, [content, canSubmit, submissionStatus, userId]);

  // Format today's date
  const formatTodayDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
        <SkeletonToday />
      </SafeAreaView>
    );
  }

  // Entry already submitted
  if (todayEntry) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
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
          <View style={styles.header}>
            <Text variant="sm" color="secondary" style={styles.dateLabel}>
              {formatTodayDate()}
            </Text>
            <Text variant="2xl" weight="bold">
              Today's Entry
            </Text>
          </View>

          <EntryCard entry={todayEntry} />

          <View style={styles.submittedMessage}>
            <Text variant="sm" color="secondary" centered>
              You've already journaled today.{'\n'}
              See you tomorrow.
            </Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (todayEntry) setContent(todayEntry.content);
                setTodayEntry(null);
                setSubmissionStatus('idle');
              }}
            >
              <Text variant="xs" color="tertiary" style={{ textDecorationLine: 'underline' }}>
                Edit Entry
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Entry input mode
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="sm" color="secondary" style={styles.dateLabel}>
              {formatTodayDate()}
            </Text>
            <Text variant="2xl" weight="bold">
              Three Sentences
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <EntryInput
              value={content}
              onChangeText={setContent}
              autoFocus={!content}
              placeholder="What's on your mind today?"
            />
          </View>

          <View style={styles.footer}>
            <SentenceCounter count={sentenceCount} target={3} />

            <AnimatedButton
              status={submissionStatus}
              onPress={() => setShowConfirmation(true)}
              disabled={!canSubmit}
            />

            {content.trim() && !canSubmit && submissionStatus === 'idle' && (
              <Text variant="xs" color="tertiary" centered style={styles.hint}>
                {sentenceCount < 3
                  ? `${3 - sentenceCount} more sentence${3 - sentenceCount !== 1 ? 's' : ''} to go`
                  : 'Please write exactly 3 sentences'}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={showConfirmation}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleSubmit}
        loading={submissionStatus === 'submitting'}
      />

      <MilestoneModal
        visible={showMilestone}
        streak={milestoneStreak}
        onClose={() => setShowMilestone(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[5],
  },
  dateLabel: {
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flex: 1,
    marginBottom: spacing[4],
  },
  footer: {
    paddingTop: spacing[6],
  },
  animatedButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: spacing[4],
  },
  submittedMessage: {
    marginTop: spacing[6],
    paddingVertical: spacing[4],
  },
  editButton: {
    marginTop: spacing[4],
    alignSelf: 'center',
    padding: spacing[2],
  },
});
