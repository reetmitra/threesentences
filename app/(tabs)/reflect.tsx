/**
 * ThreeSixtyThree™ Three Sentences - Reflect Screen
 * 
 * AI-powered reflection on journal entries.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Brain } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ReflectionCard } from '@/components/ReflectionCard';
import { CrisisResourcesCard } from '@/components/CrisisResourcesCard';
import { SkeletonReflect } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getEntriesForReflection } from '@/store/entries';
import { getPreferences } from '@/store/onboarding';
import {
  getLatestReflection,
  saveReflection,
} from '@/store/reflections';
import {
  generateReflection,
  Reflection,
  ReflectionTimeRange,
} from '@/services/aiReflection';

type TimeRangeOption = {
  value: ReflectionTimeRange;
  label: string;
};

const TIME_RANGES: TimeRangeOption[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

export default function ReflectScreen() {
  const { userId } = useAuth();
  const activeColors = colors.dark;
  const { showToast } = useToast();

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ReflectionTimeRange>(7);
  const [latestReflection, setLatestReflection] = useState<Reflection | null>(null);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up swap timeout on unmount
  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current) {
        clearTimeout(swapTimeoutRef.current);
      }
    };
  }, []);

  const handleRangeChange = useCallback((range: ReflectionTimeRange) => {
    if (range === selectedRange) return;
    setSelectedRange(range);
    setIsSwapping(true);
    if (swapTimeoutRef.current) {
      clearTimeout(swapTimeoutRef.current);
    }
    swapTimeoutRef.current = setTimeout(() => setIsSwapping(false), 800);
  }, [selectedRange]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const prefs = await getPreferences();
      setIsEnabled(prefs.aiReflectionEnabled);

      if (prefs.aiReflectionEnabled) {
        const latest = await getLatestReflection();
        setLatestReflection(latest);
      }
    } catch (err) {
      console.error('Failed to load reflection data:', err);
      showToast('error', 'Could not load reflections.');
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

  const handleGenerate = async () => {
    if (!userId) return;
    setIsGenerating(true);
    setError(null);
    setShowCrisisResources(false);

    try {
      const entries = await getEntriesForReflection(userId, selectedRange);
      const result = await generateReflection(entries, selectedRange);

      if (result.crisisDetected) {
        setShowCrisisResources(true);
        return;
      }

      if (result.success && result.reflection) {
        await saveReflection(userId!, result.reflection);
        setLatestReflection(result.reflection);
      } else {
        setError(result.error || 'Failed to generate reflection');
      }
    } catch (err) {
      console.error('Failed to generate reflection:', err);
      setError('Something went wrong. Please try again.');
      showToast('error', 'Reflection generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || isSwapping) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
        <SkeletonReflect />
      </SafeAreaView>
    );
  }

  if (!isEnabled) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
        <View style={styles.disabledContainer}>
          <Icon name="spark" size={48} color={activeColors.textTertiary} />
          <Text variant="xl" family="sansSemibold" centered style={styles.disabledTitle}>
            AI Reflection
          </Text>
          <Text variant="base" color="secondary" centered style={styles.disabledText}>
            AI-powered reflection is disabled.{'\n'}
            Enable it in Settings to receive gentle insights about your journal entries.
          </Text>
          <Button
            title="Enable in Settings"
            variant="outline"
            onPress={() => router.push('/(tabs)/settings')}
            style={{ marginTop: spacing[5] }}
          />
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <Text variant="2xl" family="sansBold">
            Reflect
          </Text>
          <Text variant="sm" color="secondary" style={styles.subtitle}>
            AI-powered insights from your entries
          </Text>
        </View>

        {/* Crisis resources */}
        {showCrisisResources && (
          <View style={styles.section}>
            <CrisisResourcesCard onDismiss={() => setShowCrisisResources(false)} />
          </View>
        )}

        {/* Generate new reflection */}
        {!showCrisisResources && (
          <View style={[styles.generateSection, { backgroundColor: activeColors.surface }]}>
            <Text variant="base" style={styles.generateTitle}>
              Generate Reflection
            </Text>
            <Text variant="sm" color="secondary" style={styles.generateDescription}>
              Select a time range to analyze your recent entries.
            </Text>

            {/* Time range selector */}
            <View style={styles.rangeSelector}>
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.value}
                  title={range.label}
                  variant={selectedRange === range.value ? 'primary' : 'outline'}
                  onPress={() => handleRangeChange(range.value)}
                  style={styles.rangeButton}
                />
              ))}
            </View>

            {/* Generate button */}
            <Button
              title={isGenerating ? 'Generating...' : 'Generate Reflection'}
              onPress={handleGenerate}
              disabled={isGenerating}
              loading={isGenerating}
              style={styles.generateButton}
            />

            {error && (
              <TouchableOpacity onPress={handleGenerate} style={styles.errorRow}>
                <Text variant="sm" style={[styles.error, { color: activeColors.error }]}>
                  {error}
                </Text>
                <Text variant="sm" style={[styles.retryLink, { color: activeColors.textTertiary }]}>
                  Tap to retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Latest reflection */}
        {latestReflection && !showCrisisResources && (
          <View style={styles.section}>
            <Text variant="sm" family="mono" color="secondary" style={[styles.sectionTitle, { textTransform: 'uppercase' }]}>
              LATEST REFLECTION
            </Text>
            <ReflectionCard reflection={latestReflection} />
          </View>
        )}

        {/* Empty state */}
        {!latestReflection && !showCrisisResources && (
          <View style={styles.emptyState}>
            <Brain size={40} color={activeColors.textTertiary} strokeWidth={1.5} />
            <Text variant="base" color="secondary" centered style={{ marginTop: spacing[3] }}>
              Ready to discover patterns in your writing?
            </Text>
            <Text variant="sm" color="tertiary" centered style={{ marginTop: spacing[1] }}>
              Generate your first reflection above.
            </Text>
          </View>
        )}
      </ScrollView>
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
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  disabledTitle: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  disabledText: {
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  subtitle: {
    marginTop: spacing[1],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
    letterSpacing: 1,
  },
  generateSection: {
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[5],
  },
  generateTitle: {
    marginBottom: spacing[1],
  },
  generateDescription: {
    marginBottom: spacing[4],
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  rangeButton: {
    flex: 1,
    // Chips are narrow at phone widths; without this the default 24px
    // horizontal padding wraps "30 days" onto two lines.
    paddingHorizontal: spacing[2],
  },
  generateButton: {
    width: '100%',
  },
  errorRow: {
    marginTop: spacing[2],
    alignItems: 'center',
  },
  error: {
    textAlign: 'center',
  },
  retryLink: {
    marginTop: spacing[1],
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  emptyState: {
    paddingVertical: spacing[8],
  },
});
