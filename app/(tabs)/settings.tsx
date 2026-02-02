/**
 * ThreeSixtyThree™ Three Sentences - Settings Screen
 * 
 * Export data, view about info, manage preferences.
 * No analytics dashboard, no stats - per 363 philosophy.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Download,
  FileText,
  FileJson,
  Trash2,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { exportEntries, getEntryCount, ExportFormat } from '@/store/entries';
import { clearAllData, resetOnboarding } from '@/store/onboarding';

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  showChevron = true,
}: SettingsRowProps) {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      style={[styles.row, { backgroundColor: activeColors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text
          variant="base"
          weight="medium"
          style={destructive ? { color: activeColors.error } : undefined}
        >
          {title}
        </Text>
        {subtitle && (
          <Text variant="sm" color="secondary" style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && (
        <ChevronRight size={20} color={activeColors.textTertiary} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  const [entryCount, setEntryCount] = useState(0);

  // Load entry count
  const loadStats = useCallback(async () => {
    const count = await getEntryCount();
    setEntryCount(count);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // Export entries
  const handleExport = async (format: ExportFormat) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await exportEntries(format);
      
      const filename = `three-sentences-export-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'txt'}`;
      
      await Share.share({
        message: data,
        title: filename,
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Unable to export your entries. Please try again.');
    }
  };

  // Show export options
  const showExportOptions = () => {
    Alert.alert(
      'Export Entries',
      'Choose your export format',
      [
        {
          text: 'Plain Text',
          onPress: () => handleExport('text'),
        },
        {
          text: 'JSON',
          onPress: () => handleExport('json'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Delete all data
  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your journal entries and settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await clearAllData();
            Alert.alert('Data Deleted', 'All your data has been removed.');
            loadStats();
          },
        },
      ]
    );
  };

  // Show about info
  const showAbout = () => {
    Alert.alert(
      'About ThreeSixtyThree™',
      'Three Sentences is the official journaling application of the ThreeSixtyThree™ self-improvement system.\n\nVersion 1.0.0\n\n"Show up. Do the work. Let go of perfection."\n\n— The ThreeSixtyThree™ Principle',
      [{ text: 'OK' }]
    );
  };

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
            Settings
          </Text>
        </View>

        {/* Stats - minimal, not gamified */}
        <View style={[styles.statsCard, { backgroundColor: activeColors.surface }]}>
          <Text variant="3xl" weight="bold" style={{ color: activeColors.accent }}>
            {entryCount}
          </Text>
          <Text variant="sm" color="secondary">
            {entryCount === 1 ? 'entry' : 'entries'} written
          </Text>
        </View>

        {/* Export Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            YOUR DATA
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Download size={22} color={activeColors.textPrimary} />}
              title="Export Entries"
              subtitle="Download your journal as text or JSON"
              onPress={showExportOptions}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            ABOUT
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Info size={22} color={activeColors.textPrimary} />}
              title="About ThreeSixtyThree™"
              subtitle="Version 1.0.0"
              onPress={showAbout}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            DANGER ZONE
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Trash2 size={22} color={activeColors.error} />}
              title="Delete All Data"
              subtitle="Permanently remove all entries"
              onPress={handleDeleteData}
              destructive
              showChevron={false}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="xs" color="tertiary" centered>
            ThreeSixtyThree™
          </Text>
          <Text variant="xs" color="tertiary" centered style={styles.footerTagline}>
            Show up. Do the work. Let go of perfection.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  statsCard: {
    borderRadius: 16,
    padding: spacing[5],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
    letterSpacing: 1,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    minHeight: 56,
  },
  rowIcon: {
    marginRight: spacing[3],
    width: 28,
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowSubtitle: {
    marginTop: 2,
  },
  footer: {
    marginTop: spacing[8],
    paddingTop: spacing[4],
  },
  footerTagline: {
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
});
