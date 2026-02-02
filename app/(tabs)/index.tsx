/**
 * ThreeSixtyThree™ Three Sentences - Today Screen
 * 
 * The main entry screen. Write three sentences, submit, done.
 * Minimal chrome - just the input, counter, and submit button.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { EntryInput } from '@/components/EntryInput';
import { SentenceCounter } from '@/components/SentenceCounter';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EntryCard } from '@/components/EntryCard';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { countSentences } from '@/utils/sentenceDetection';
import {
  getTodayEntry,
  saveEntry,
  saveDraft,
  getDraft,
  clearDraft,
} from '@/store/entries';
import { Entry, getTodayDateString } from '@/types/entry';

const AUTO_SAVE_INTERVAL = 5000; // 5 seconds per PRD

export default function TodayScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  // State
  const [content, setContent] = useState('');
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Refs for auto-save
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');

  // Calculate sentence count
  const sentenceCount = countSentences(content);
  const canSubmit = sentenceCount === 3;

  // Load existing entry or draft on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if entry exists for today
      const existing = await getTodayEntry();
      if (existing) {
        setTodayEntry(existing);
        setContent('');
      } else {
        // Load draft if no entry
        const draft = await getDraft();
        if (draft) {
          setContent(draft.content);
          lastSavedContent.current = draft.content;
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount and when screen focuses
  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Auto-save draft
  useEffect(() => {
    if (todayEntry) return; // Don't auto-save if already submitted

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer
    autoSaveTimer.current = setTimeout(async () => {
      if (content !== lastSavedContent.current && content.trim()) {
        await saveDraft(content);
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
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const entry = await saveEntry(content);
      setTodayEntry(entry);
      setContent('');
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to save entry:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  }, [content, canSubmit, isSubmitting]);

  // Format today's date for display
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
        <View style={styles.loadingContainer}>
          <Text variant="base" color="secondary">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Entry already submitted for today
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
        >
          <View style={styles.header}>
            <Text variant="sm" color="secondary" style={styles.dateLabel}>
              {formatTodayDate()}
            </Text>
            <Text variant="2xl" weight="bold" style={styles.title}>
              Today's Entry
            </Text>
          </View>

          <EntryCard entry={todayEntry} />

          <View style={styles.submittedMessage}>
            <Text variant="sm" color="secondary" centered>
              You've already journaled today.{'\n'}
              See you tomorrow.
            </Text>
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
            <Text variant="2xl" weight="bold" style={styles.title}>
              Three Sentences
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <EntryInput
              value={content}
              onChangeText={setContent}
              autoFocus={!content}
              placeholder="What's on your mind today? Write exactly three sentences..."
            />
          </View>

          <View style={styles.footer}>
            <SentenceCounter count={sentenceCount} target={3} />

            <Button
              title="Submit Entry"
              onPress={() => setShowConfirmation(true)}
              disabled={!canSubmit}
              style={styles.submitButton}
            />

            {content.trim() && !canSubmit && (
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
        loading={isSubmitting}
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
    marginBottom: spacing[4],
  },
  dateLabel: {
    marginBottom: spacing[1],
  },
  title: {
    // No additional styles needed
  },
  inputContainer: {
    flex: 1,
    marginBottom: spacing[4],
  },
  footer: {
    paddingTop: spacing[2],
  },
  submitButton: {
    marginTop: spacing[3],
  },
  hint: {
    marginTop: spacing[2],
  },
  submittedMessage: {
    marginTop: spacing[6],
    paddingVertical: spacing[4],
  },
});
