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
  AppState,
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
import { getProfile } from '@/store/profile';
import { getPreferences } from '@/store/onboarding';
import { getDailyPrompt } from '@/constants/prompts';
import {
  Entry,
  formatRolloverLabel,
  getDayRolloverHour,
  getTodayDateString,
  isStaleDate,
  parseDateString,
} from '@/types/entry';
import { suggestHabits } from '@/types/tracking';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useCheckIn } from '@/hooks/useCheckIn';
import { MoodPicker } from '@/components/MoodPicker';
import { HabitCheckList } from '@/components/HabitCheckList';
import { HabitSetupSheet } from '@/components/HabitSetupSheet';

const AUTO_SAVE_INTERVAL = 5000;

function SubmitButton({
  status,
  onPress,
  disabled,
  label,
}: {
  status: 'idle' | 'submitting' | 'success';
  onPress: () => void;
  disabled: boolean;
  label: string;
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
              // Disabled stays readable: a quiet surface pill with dim words (>= 4.5:1).
              backgroundColor: isEnabled ? c.textBright : c.surface,
            },
          ]}
        >
          {status === 'submitting'
            ? <ActivityIndicator color={c.paper} size="small" />
            : status === 'success'
            ? <Animated.View style={{ transform: [{ rotate: spin }] }}><Icon name="check" color={c.paper} size={22} /></Animated.View>
            : <Animated.View style={{ opacity: fadeValue }}><Text family="sansSemibold" variant="base" style={{ color: isEnabled ? c.paper : c.textSecondary }}>{label}</Text></Animated.View>
          }
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const DEFAULT_PLACEHOLDER = 'Three sentences. What happened?';

export default function TodayScreen() {
  const { userId } = useAuth();
  const c = colors.dark;
  const { showToast } = useToast();
  const isConnected = useNetworkStatus();

  const [content, setContent] = useState('');
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showHabitSetup, setShowHabitSetup] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [promptEnabled, setPromptEnabled] = useState(false);

  // Logical date: before the rollover hour this is still yesterday.
  const today = getTodayDateString();
  const lockLabel = formatRolloverLabel(getDayRolloverHour());
  const checkIn = useCheckIn(today);
  // loadData never clears todayEntry (a failed read also returns null), so
  // after the day rolls over the previous day's entry can still be in state.
  const entryForToday = todayEntry?.date === today ? todayEntry : null;

  const profileLoaded = useRef(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');
  // Logical date of the submitted entry being re-edited (same-day grace); null
  // when not editing. Resubmits skip the streak toast and milestone; the lock
  // guard and edit drafts use this entry's own day.
  const editingDate = useRef<string | null>(null);
  // Logical date the screen's state belongs to: set by each loadData and when
  // an edit starts; null until the first load.
  const loadedDate = useRef<string | null>(null);

  const sentenceCount = countSentences(content);
  const canSubmit = sentenceCount === 3;

  const loadData = useCallback(async () => {
    if (!userId) return;
    const date = getTodayDateString();
    // The day rolled over since the last load: the text on screen and edit mode
    // belong to a locked day. Same-day loads (and the first) keep what's there.
    if (loadedDate.current && loadedDate.current !== date) {
      setContent('');
      editingDate.current = null;
    }
    loadedDate.current = date;
    setIsLoading(true);
    try {
      const [existing, profile] = await Promise.all([
        getTodayEntry(userId),
        profileLoaded.current ? null : getProfile(userId),
        // Cosmetic: a failed read just keeps the default placeholder.
        getPreferences()
          .then((prefs) => setPromptEnabled(prefs.dailyPromptEnabled))
          .catch(() => undefined),
        checkIn.reload(),
      ]);
      if (profile) {
        profileLoaded.current = true;
        setInterests(profile.interests);
      }
      if (existing) {
        // Still re-editing this entry (tab switch mid-edit): keep the text on
        // screen. Otherwise show it done and drop any edit mode left over, so
        // it can't date a later fresh draft or trip the lock guard.
        if (editingDate.current !== existing.date) {
          editingDate.current = null;
          setTodayEntry(existing);
          setContent('');
        }
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
  }, [userId, checkIn.reload]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // useFocusEffect doesn't fire on resume. If the day rolled over while the
  // app was in the background, reload before a tap can reach the locked day.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isStaleDate(today)) loadData();
    });
    return () => sub.remove();
  }, [today, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    if (entryForToday) return;
    // Dated when typed, not when the timer fires: a timer still pending when the
    // app was suspended fires on resume and must not file last night's text
    // under the new day (getDraft would then restore it). An edit draft carries
    // the edited entry's day, so it expires with that day.
    const date = editingDate.current ?? getTodayDateString();
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (content !== lastSavedContent.current && content.trim()) {
        await saveDraft({ content, date, lastSaved: new Date().toISOString() });
        lastSavedContent.current = content;
      }
    }, AUTO_SAVE_INTERVAL);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [content, entryForToday]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submissionStatus !== 'idle' || !userId) return;
    setShowConfirmation(false);

    // Re-editing an entry whose day has since rolled over: it's locked, and
    // saveEntry would file the text under the new day. Fresh drafts still submit.
    if (editingDate.current !== null && isStaleDate(editingDate.current)) {
      editingDate.current = null;
      setContent('');
      showToast('info', "That day's entry is locked now.");
      loadData();
      return;
    }

    if (!isConnected) {
      showToast('error', 'No internet connection — please try again');
      return;
    }

    setSubmissionStatus('submitting');
    try {
      const entry = await saveEntry(userId, content);
      setSubmissionStatus('success');

      if (editingDate.current !== null) {
        editingDate.current = null;
        showToast('success', `Updated · locks at ${formatRolloverLabel(getDayRolloverHour())}`);
        setTimeout(() => {
          setTodayEntry(entry);
          setContent('');
          setSubmissionStatus('idle');
        }, 1500);
        return;
      }

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
        showToast('success', `Streak +${streak} · locked`);
        setTimeout(() => {
          setTodayEntry(entry);
          setContent('');
          setSubmissionStatus('idle');
        }, 1500);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error('Failed to save entry:', detail);
      showToast('error', 'Failed to save entry — please try again');
      setSubmissionStatus('idle');
    }
  }, [content, canSubmit, submissionStatus, userId, isConnected, loadData]);

  const formatTodayDate = () =>
    parseDateString(today).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();

  // Sentences → mood → habits, in both the writing and the done state.
  const trackerSections = (
    <>
      {checkIn.trackers.mood && (
        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={styles.eyebrow}>
            How was today
          </Text>
          <MoodPicker value={checkIn.mood} onChange={checkIn.chooseMood} />
        </View>
      )}
      {checkIn.trackers.habits && (
        <View style={styles.section}>
          <HabitCheckList
            habits={checkIn.habits}
            answers={checkIn.answers}
            onAnswer={checkIn.answerHabit}
            onEdit={() => setShowHabitSetup(true)}
          />
        </View>
      )}
    </>
  );

  const habitSheet = (
    <HabitSetupSheet
      visible={showHabitSetup}
      onClose={() => setShowHabitSetup(false)}
      habits={checkIn.habits}
      suggestions={suggestHabits(interests, checkIn.habits.map((h) => h.name))}
      onAdd={checkIn.addHabit}
      onRemove={checkIn.removeHabit}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <SkeletonToday />
      </SafeAreaView>
    );
  }

  if (entryForToday) {
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
              Done.
            </Text>
          </View>
          <EntryCard entry={entryForToday} />
          <View style={styles.submittedMessage}>
            <Text family="mono" variant="xs" uppercase centered style={{ color: c.textSecondary, letterSpacing: 1.5 }}>
              {`Locks at ${lockLabel} · edit until then`}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                // Left open across the rollover: this is last night's entry, now
                // locked. Load the new day instead of prefilling it.
                if (isStaleDate(today)) {
                  loadData();
                  return;
                }
                setContent(entryForToday.content);
                editingDate.current = entryForToday.date;
                // The entry may have been submitted after a rollover that no
                // load saw; without this a tab switch would treat the edit as
                // a locked day's and discard it.
                loadedDate.current = entryForToday.date;
                setTodayEntry(null);
                setSubmissionStatus('idle');
              }}
            >
              <Text family="mono" variant="xs" style={{ color: c.textSecondary, textDecorationLine: 'underline', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                edit entry
              </Text>
            </TouchableOpacity>
          </View>
          {trackerSections}
        </ScrollView>
        {habitSheet}
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.writingContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginBottom: 6 }}>
              {formatTodayDate()}
            </Text>
            <Text family="sansSemibold" variant="2xl" style={{ color: c.textPrimary }}>
              Today
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <EntryInput
              value={content}
              onChangeText={setContent}
              autoFocus={!content}
              placeholder={promptEnabled ? getDailyPrompt(today).text : DEFAULT_PLACEHOLDER}
            />
          </View>

          <View style={styles.footer}>
            <SentenceCounter count={sentenceCount} target={3} />
            {trackerSections}
            <View style={{ height: spacing[4] }} />
            <SubmitButton
              status={submissionStatus}
              onPress={() => setShowConfirmation(true)}
              disabled={!canSubmit}
              label={sentenceCount < 3 ? 'Write 3 sentences' : 'Submit'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={showConfirmation}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleSubmit}
        loading={submissionStatus === 'submitting'}
        message={`You can refine your three sentences until ${lockLabel}. After that, they stand as written.`}
      />
      {habitSheet}
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: edgePadding.content, paddingBottom: spacing[8] },
  // flexGrow + flex:1 input: with trackers off the input still fills the screen as before;
  // with them on the content overflows and the input sits at its minimum.
  writingContent: { flexGrow: 1, paddingHorizontal: edgePadding.content, paddingTop: spacing[4] },
  header: { marginBottom: spacing[5] },
  // Matches EntryInput's own minHeight so the input never overflows its container.
  inputContainer: { flex: 1, minHeight: 200, marginBottom: spacing[4] },
  section: { marginTop: spacing[6] },
  eyebrow: { color: colors.dark.textSecondary, letterSpacing: 1.5, marginBottom: spacing[3] },
  footer: { paddingTop: spacing[4], paddingBottom: spacing[6] },
  submitButton: { height: 52, borderRadius: componentRadius.button, alignItems: 'center', justifyContent: 'center', width: '100%' },
  submittedMessage: { marginTop: spacing[6], alignItems: 'center', gap: spacing[3] },
  editButton: { padding: spacing[2] },
});
