/**
 * ThreeSixtyThree™ Three Sentences - Settings Screen
 * 
 * Export data, manage AI reflection, view about info.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import {
  Download,
  Trash2,
  Info,
  ChevronRight,
  Sparkles,
  Lock,
  LogOut,
  User,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { AIOptInModal } from '@/components/AIOptInModal';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { exportEntries, getEntryCount, ExportFormat } from '@/store/entries';
import {
  clearAllData,
  getPreferences,
  updatePreferences,
} from '@/store/onboarding';
import { deleteAllReflections, getReflectionCount } from '@/store/reflections';
import { getCurrentUser, signOut, User as AuthUser } from '@/store/auth';

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  showChevron = true,
  rightElement,
}: SettingsRowProps) {
  const activeColors = colors.dark;

  const content = (
    <>
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
      {rightElement}
      {showChevron && !rightElement && (
        <ChevronRight size={20} color={activeColors.textTertiary} />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.row, { backgroundColor: activeColors.surface }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, { backgroundColor: activeColors.surface }]}>
      {content}
    </View>
  );
}

export default function SettingsScreen() {
  const activeColors = colors.dark;

  const [entryCount, setEntryCount] = useState(0);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showAIOptInModal, setShowAIOptInModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const loadData = useCallback(async () => {
    const [count, refCount, prefs] = await Promise.all([
      getEntryCount(),
      getReflectionCount(),
      getPreferences(),
    ]);
    setEntryCount(count);
    setReflectionCount(refCount);
    setAiEnabled(prefs.aiReflectionEnabled);
    setCurrentUser(getCurrentUser());
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAIToggle = async (value: boolean) => {
    if (value) {
      setShowAIOptInModal(true);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updatePreferences({ aiReflectionEnabled: false });
      setAiEnabled(false);
    }
  };

  const handleAIOptInConfirm = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updatePreferences({ aiReflectionEnabled: true });
    setAiEnabled(true);
    setShowAIOptInModal(false);
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await exportEntries(format);
      
      await Share.share({
        message: data,
        title: `three-sentences-export.${format === 'json' ? 'json' : 'txt'}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Unable to export your entries.');
    }
  };

  const showExportOptions = () => {
    Alert.alert(
      'Export Entries',
      'Choose your export format',
      [
        { text: 'Plain Text', onPress: () => handleExport('text') },
        { text: 'JSON', onPress: () => handleExport('json') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteReflections = () => {
    if (reflectionCount === 0) {
      Alert.alert('No Reflections', 'You don\'t have any reflections to delete.');
      return;
    }

    Alert.alert(
      'Delete All Reflections',
      `This will permanently delete all ${reflectionCount} AI-generated reflections.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteAllReflections();
            setReflectionCount(0);
            Alert.alert('Deleted', 'All reflections have been removed.');
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your journal entries, reflections, and settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await clearAllData();
            Alert.alert('Data Deleted', 'All your data has been removed.');
            loadData();
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About ThreeSixtyThree™',
      'Three Sentences is the official journaling application of the ThreeSixtyThree™ self-improvement system.\n\nVersion 1.0.0\n\n"Show up. Do the work. Let go of perfection."',
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

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: activeColors.surface }]}>
          <Text variant="3xl" weight="bold" style={{ color: activeColors.accent }}>
            {entryCount}
          </Text>
          <Text variant="sm" color="secondary">
            {entryCount === 1 ? 'entry' : 'entries'} written
          </Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            ACCOUNT
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<User size={22} color={activeColors.textPrimary} />}
              title={currentUser?.name || currentUser?.email || 'Not signed in'}
              subtitle={currentUser?.name ? currentUser.email : undefined}
              showChevron={false}
            />
            <SettingsRow
              icon={<LogOut size={22} color={activeColors.error} />}
              title="Sign Out"
              onPress={handleSignOut}
              destructive
              showChevron={false}
            />
          </View>
        </View>

        {/* AI Reflection Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            AI REFLECTION
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Sparkles size={22} color={activeColors.textPrimary} />}
              title="AI Reflection"
              subtitle={aiEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={aiEnabled}
                  onValueChange={handleAIToggle}
                  trackColor={{
                    false: activeColors.surfaceHover,
                    true: activeColors.accent,
                  }}
                  thumbColor={activeColors.textPrimary}
                />
              }
            />
            {aiEnabled && reflectionCount > 0 && (
              <SettingsRow
                icon={<Trash2 size={22} color={activeColors.error} />}
                title="Delete All Reflections"
                subtitle={`${reflectionCount} reflection${reflectionCount !== 1 ? 's' : ''}`}
                onPress={handleDeleteReflections}
                destructive
                showChevron={false}
              />
            )}
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            YOUR DATA
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Download size={22} color={activeColors.textPrimary} />}
              title="Export Entries"
              subtitle="Download as text or JSON"
              onPress={showExportOptions}
            />
            <SettingsRow
              icon={<Lock size={22} color={activeColors.textSecondary} />}
              title="Encryption"
              subtitle="Entries encrypted at rest"
              showChevron={false}
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
              subtitle="Permanently remove everything"
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

      <AIOptInModal
        visible={showAIOptInModal}
        onCancel={() => setShowAIOptInModal(false)}
        onConfirm={handleAIOptInConfirm}
      />
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
