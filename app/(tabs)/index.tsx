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
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { Text } from '@/components/ui/Text';
import { EntryInput } from '@/components/EntryInput';
import { SentenceCounter } from '@/components/SentenceCounter';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { MilestoneModal, isMilestone } from '@/components/MilestoneModal';
import { EntryCard } from '@/components/EntryCard';
import { SkeletonToday } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing, componentRadius, edgePadding } from '@/theme/spacing';
import { countSentences } from '@/utils/sentenceDetection';
import { getTodayEntry, saveEntry, saveDraft, getDraft, getEntryStats } from '@/store/entries';
import { Entry, getTodayDateString } from '@/types/entry';

const AUTO_SAVE_INTERVAL = 5000;

function SubmitButton({
  status,
  onPress,
  disabled,
}: {
  status: 'idle' | 'submitting' | 'success';
  onPress: () => void;
  disabled: boolean;
}) {
  const c = colors.dark;
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const widthAnim = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'success') {
      Animated.parallel([
        Animated.timing(widthAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(spinValue, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(fadeValue, { toValue: 0, duration: 400, delay: 800, useNativeDriver: false }),
      ]).start();
    } else if (status === 'idle') {
      widthAnim.setValue(1);
      spinValue.setValue(0);
      fadeValue.setValue(1);
    }
  }, [status]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const animatedWidth = initialWidth
    ? widthAnim.interpolate({ inputRange: [0, 1], outputRange: [56, initialWidth] })
    : '100%';

  const isEnabled = !disabled && status === 'idle';

  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(e) => { if (!initialWidth) setInitialWidth(e.nativeEvent.layout.width); }}
    >
      <Animated.View style={{ opacity: fadeValue, width: animatedWidth, height: 52 }}>
        <TouchableOpacity
          onPress={onPress}
          disabled={!isEnabled}
          style={[
            styles.submitButton,
            {
              backgroundColor: isEnabled ? c.textBright : c.frame,
              opacity: disabled && status === 'idle' ? 0.4 : 1,
            },
          ]}
        >
          {status === 'submitting'
            ? <ActivityIndicator color={c.paper} size="small" />
            : status === 'success'
            ? <Animated.View style={{ transform: [{ rotate: spin }] }}><Icon name="check" color={c.paper} size={22} /></Animated.View>
            : <Animated.View style={{ opacity: fadeValue }}><Text family="sansSemibold" variant="base" style={{ color: c.paper }}>Done</Text></Animated.View>
          }
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function TodayScreen() {
  const { userId } = useAuth();
  const c = colors.dark;
  const { showToast } = useToast();

  const [content, setContent] = useState('');
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');

  const sentenceCount = countSentences(content);
  const canSubmit = sentenceCount === 3;

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
    } catch {
      showToast('error', 'Could not load today\'s entry');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    if (todayEntry) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (content !== lastSavedContent.current && content.trim()) {
        await saveDraft({ content, date: getTodayDateString(), lastSaved: new Date().toISOString() });
        lastSavedContent.current = content;
      }
    }, AUTO_SAVE_INTERVAL);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [content, todayEntry]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submissionStatus !== 'idle' || !userId) return;
    setShowConfirmation(false);
    setSubmissionStatus('submitting');
    try {
      const entry = await saveEntry(userId, content);
      setSubmissionStatus('success');
      const stats = await getEntryStats(userId);
      const streak = stats.currentStreak;
      if (isMilestone(streak)) {
        setTimeout(() => {
          setTodayEntry(entry);
          setContent('');
          setSubmissionStatus('idle');
          setMilestoneStreak(streak);
          setShowMilestone(true);
        }, 1500);
      } else {
        showToast('success', `STREAK +${streak} · LOCKED`);
        setTimeout(() => {
          setTodayEntry(entry);
          setContent('');
          setSubmissionStatus('idle');
        }, 1500);
      }
    } catch {
      showToast('error', 'Save failed — try again');
      setSubmissionStatus('idle');
    }
  }, [content, canSubmit, submissionStatus, userId]);

  const formatTodayDate = () =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <SkeletonToday />
      </SafeAreaView>
    );
  }

  if (todayEntry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
        >
          <View style={styles.header}>
            <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginBottom: 6 }}>
              {formatTodayDate()}
            </Text>
            <Text family="sansSemibold" variant="2xl" style={{ color: c.textPrimary }}>
              Today's Entry
            </Text>
          </View>
          <EntryCard entry={todayEntry} />
          <View style={styles.submittedMessage}>
            <Text family="mono" variant="xs" uppercase centered style={{ color: c.textTertiary, letterSpacing: 1.5 }}>
              Locked · See you tomorrow
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (todayEntry) setContent(todayEntry.content);
                setTodayEntry(null);
                setSubmissionStatus('idle');
              }}
            >
              <Text family="mono" variant="xs" style={{ color: c.textTertiary, textDecorationLine: 'underline', letterSpacing: 0.5 }}>
                edit entry
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginBottom: 6 }}>
              {formatTodayDate()}
            </Text>
            <Text family="sansSemibold" variant="2xl" style={{ color: c.textPrimary }}>
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
            <View style={{ height: spacing[4] }} />
            <SubmitButton
              status={submissionStatus}
              onPress={() => setShowConfirmation(true)}
              disabled={!canSubmit}
            />
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
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: edgePadding.content, paddingTop: spacing[4] },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: edgePadding.content, paddingBottom: spacing[8] },
  header: { marginBottom: spacing[5] },
  inputContainer: { flex: 1, marginBottom: spacing[4] },
  footer: { paddingTop: spacing[4], paddingBottom: spacing[6] },
  submitButton: { height: 52, borderRadius: componentRadius.button, alignItems: 'center', justifyContent: 'center', width: '100%' },
  submittedMessage: { marginTop: spacing[6], alignItems: 'center', gap: spacing[3] },
  editButton: { padding: spacing[2] },
});
