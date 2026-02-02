/**
 * ThreeSixtyThree™ Three Sentences - Reflect Screen
 * 
 * AI-powered reflection on journal entries.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Sparkles } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ReflectionCard } from '@/components/ReflectionCard';
import { CrisisResourcesCard } from '@/components/CrisisResourcesCard';
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
  const activeColors = colors.dark;

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ReflectionTimeRange>(7);
  const [latestReflection, setLatestReflection] = useState<Reflection | null>(null);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsGenerating(true);
    setError(null);
    setShowCrisisResources(false);

    try {
      const entries = await getEntriesForReflection(selectedRange);
      const result = await generateReflection(entries, selectedRange);

      if (result.crisisDetected) {
        setShowCrisisResources(true);
        return;
      }

      if (result.success && result.reflection) {
        await saveReflection(result.reflection);
        setLatestReflection(result.reflection);
      } else {
        setError(result.error || 'Failed to generate reflection');
      }
    } catch (err) {
      console.error('Failed to generate reflection:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
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
          <Sparkles size={48} color={activeColors.textTertiary} />
          <Text variant="xl" weight="semibold" centered style={styles.disabledTitle}>
            AI Reflection
          </Text>
          <Text variant="base" color="secondary" centered style={styles.disabledText}>
            AI-powered reflection is disabled.{'\n'}
            Enable it in Settings to receive gentle insights about your journal entries.
          </Text>
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
          <Text variant="2xl" weight="bold">
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
            <Text variant="base" weight="medium" style={styles.generateTitle}>
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
                  onPress={() => setSelectedRange(range.value)}
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
              <Text variant="sm" style={[styles.error, { color: activeColors.error }]}>
                {error}
              </Text>
            )}
          </View>
        )}

        {/* Latest reflection */}
        {latestReflection && !showCrisisResources && (
          <View style={styles.section}>
            <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
              LATEST REFLECTION
            </Text>
            <ReflectionCard reflection={latestReflection} />
          </View>
        )}

        {/* Empty state */}
        {!latestReflection && !showCrisisResources && (
          <View style={styles.emptyState}>
            <Text variant="base" color="secondary" centered>
              No reflections yet.{'\n'}
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
  },
  generateButton: {
    width: '100%',
  },
  error: {
    marginTop: spacing[2],
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: spacing[8],
  },
});
