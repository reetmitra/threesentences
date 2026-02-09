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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
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
} from '@/store/entries';
import { Entry } from '@/types/entry';

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
          useNativeDriver: false, // Changed to false to match width animation and avoid error
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 400,
          delay: 800,
          useNativeDriver: false, // Changed to false for consistency
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
  const activeColors = colors.dark;

  // State
  const [content, setContent] = useState('');
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
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
      const existing = await getTodayEntry();
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
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    if (todayEntry) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

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
    if (!canSubmit || submissionStatus !== 'idle') return;

    setShowConfirmation(false);
    setSubmissionStatus('submitting');

    try {
      const entry = await saveEntry(content);

      setSubmissionStatus('success');

      // Wait for animation to finish before switching screens
      setTimeout(() => {
        setTodayEntry(entry);
        setContent('');
        setSubmissionStatus('idle'); // Reset for next time (though screen changes)
      }, 1500); // 1.5s delay
    } catch (error) {
      console.error('Failed to save entry:', error);
      setSubmissionStatus('idle');
    }
  }, [content, canSubmit, submissionStatus]);

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
        <View style={styles.loadingContainer}>
          <Text variant="base" color="secondary">Loading...</Text>
        </View>
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
    paddingTop: spacing[6], // Increased to separate button from input
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
