/**
 * Three™ - Settings Screen
 *
 * Profile header, preferences, data management, account actions.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Download, Trash2, LogOut, Lightbulb, Vibrate } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { AIOptInModal } from '@/components/AIOptInModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SkeletonStatsCard } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing, edgePadding } from '@/theme/spacing';
import { exportEntries, getEntryCount, getEntryStats, ExportFormat } from '@/store/entries';
import {
  clearAllData,
  getPreferences,
  updatePreferences,
} from '@/store/onboarding';
import { deleteAllReflections, getReflectionCount } from '@/store/reflections';
import { getProfile } from '@/store/profile';
import { refreshHapticsPreference } from '@/utils/haptics';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/services/notifications';

// react-native-web's Switch colors its ON thumb with `activeThumbColor`
// (default teal) which RN core types don't know about — without this the
// toggles render green on web, off-brand for the monochrome system.
const WEB_SWITCH_PROPS = (
  Platform.OS === 'web' ? { activeThumbColor: colors.dark.paper } : {}
) as Record<string, unknown>;

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
  const c = colors.dark;

  const content = (
    <>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text
          family="sansSemibold"
          variant="base"
          style={{ color: destructive ? c.warn : c.textPrimary }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text family="sans" variant="sm" style={[styles.rowSubtitle, { color: c.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
      {showChevron && !rightElement && (
        <Icon name="caret" size={20} color={c.textTertiary} />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.row, { backgroundColor: c.surface }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, { backgroundColor: c.surface }]}>
      {content}
    </View>
  );
}

export default function SettingsScreen() {
  const c = colors.dark;
  const { showToast } = useToast();
  const { signOut, userId, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [entryCount, setEntryCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);
  const [showAIOptInModal, setShowAIOptInModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'signOut' | 'deleteReflections' | 'deleteData' | null>(null);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string; profileImage?: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [count, refCount, prefs, stats] = await Promise.all([
        getEntryCount(userId),
        getReflectionCount(),
        getPreferences(),
        getEntryStats(userId),
      ]);
      setEntryCount(count);
      setReflectionCount(refCount);
      setAiEnabled(prefs.aiReflectionEnabled);
      setHapticsEnabled(prefs.hapticsEnabled);
      setPromptEnabled(prefs.dailyPromptEnabled);
      setNotificationsEnabled(prefs.notificationsEnabled);
      setReminderHour(prefs.reminderHour);
      setCurrentStreak(stats.currentStreak);
      if (userId) {
        const profile = await getProfile(userId);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to load settings data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSignOut = () => setConfirmAction('signOut');

  const confirmSignOut = async () => {
    setConfirmAction(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await signOut();
    router.replace('/(auth)/login');
  };

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

  const handleHapticsToggle = async (value: boolean) => {
    await updatePreferences({ hapticsEnabled: value });
    setHapticsEnabled(value);
    refreshHapticsPreference();
    if (value) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePromptToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updatePreferences({ dailyPromptEnabled: value });
    setPromptEnabled(value);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        showToast('error', 'Please enable notifications in your device settings.');
        return;
      }
      await scheduleDailyReminder(reminderHour, 0);
      await updatePreferences({ notificationsEnabled: true });
      setNotificationsEnabled(true);
      showToast('success', `Daily reminder set for ${reminderHour}:00.`);
    } else {
      await cancelDailyReminder();
      await updatePreferences({ notificationsEnabled: false });
      setNotificationsEnabled(false);
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExport = async (format: ExportFormat) => {
    if (!userId) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await exportEntries(userId, format);

      await Share.share({
        message: data,
        title: `three-sentences-export.${format === 'json' ? 'json' : 'txt'}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Export failed. Please try again.');
    }
  };

  const showExportOptions = () => setShowExportSheet(true);

  const handleDeleteReflections = () => {
    if (reflectionCount === 0) {
      showToast('info', "You don't have any reflections to delete.");
      return;
    }
    setConfirmAction('deleteReflections');
  };

  const confirmDeleteReflections = async () => {
    setConfirmAction(null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteAllReflections();
    setReflectionCount(0);
    showToast('success', 'All reflections deleted.');
  };

  const handleDeleteData = () => setConfirmAction('deleteData');

  const confirmDeleteData = async () => {
    setConfirmAction(null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearAllData();
    showToast('success', 'All data has been removed.');
    loadData();
  };

  const CONFIRM_CONFIG = {
    signOut: {
      title: 'Sign out?',
      message: 'You can sign back in anytime — your entries stay put.',
      confirmLabel: 'Sign Out',
      onConfirm: confirmSignOut,
      destructive: false,
    },
    deleteReflections: {
      title: 'Delete all reflections?',
      message: `This permanently deletes all ${reflectionCount} AI-generated reflections.`,
      confirmLabel: 'Delete',
      onConfirm: confirmDeleteReflections,
      destructive: true,
    },
    deleteData: {
      title: 'Delete all data?',
      message: 'This permanently deletes all your journal entries, reflections, and settings.',
      confirmLabel: 'Delete Everything',
      onConfirm: confirmDeleteData,
      destructive: true,
    },
  } as const;

  const displayName = userProfile?.name || user?.firstName || 'User';
  const displayEmail = user?.email;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text family="sansBold" variant="2xl" style={{ color: c.textPrimary }}>
            Settings
          </Text>
        </View>

        {/* Profile Header Card */}
        {isLoading ? (
          <View style={{ marginBottom: spacing[5] }}>
            <SkeletonStatsCard />
          </View>
        ) : (
          <Pressable
            style={[styles.profileCard, { backgroundColor: c.surface }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: c.surfaceHi }]}>
              <Text family="sansBold" variant="xl" style={{ color: c.textPrimary }}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text family="sansSemibold" variant="lg" style={{ color: c.textPrimary }}>{displayName}</Text>
              {displayEmail && (
                <Text family="sans" variant="sm" style={{ color: c.textSecondary }}>{displayEmail}</Text>
              )}
              <View style={styles.profileStats}>
                <Icon name="flame" size={14} color={c.textBright} />
                <Text family="sans" variant="sm" style={{ color: c.textSecondary, marginLeft: 4 }}>
                  {currentStreak} day streak
                </Text>
                <Text family="sans" variant="sm" style={{ color: c.textTertiary, marginLeft: spacing[3] }}>
                  {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </Text>
              </View>
            </View>
            <Icon name="caret" size={20} color={c.textTertiary} />
          </Pressable>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={[styles.sectionTitle, { color: c.textSecondary, letterSpacing: 1.5 }]}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Icon name="spark" size={22} color={c.textPrimary} />}
              title="AI Reflection"
              subtitle={aiEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={aiEnabled}
                  onValueChange={handleAIToggle}
                  trackColor={{
                    false: c.surfaceHi,
                    true: c.textBright,
                  }}
                  thumbColor={c.textPrimary}
                  {...WEB_SWITCH_PROPS}
                />
              }
            />
            <SettingsRow
              icon={<Vibrate size={22} color={c.textPrimary} />}
              title="Haptic Feedback"
              subtitle={hapticsEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={hapticsEnabled}
                  onValueChange={handleHapticsToggle}
                  trackColor={{
                    false: c.surfaceHi,
                    true: c.textBright,
                  }}
                  thumbColor={c.textPrimary}
                  {...WEB_SWITCH_PROPS}
                />
              }
            />
            <SettingsRow
              icon={<Lightbulb size={22} color={c.textPrimary} />}
              title="Daily Writing Prompt"
              subtitle={promptEnabled ? 'Shown on Insights tab' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={promptEnabled}
                  onValueChange={handlePromptToggle}
                  trackColor={{
                    false: c.surfaceHi,
                    true: c.textBright,
                  }}
                  thumbColor={c.textPrimary}
                  {...WEB_SWITCH_PROPS}
                />
              }
            />
            <SettingsRow
              icon={<Icon name="bell" size={22} color={c.textPrimary} />}
              title="Daily Reminder"
              subtitle={notificationsEnabled ? `Reminder at ${reminderHour}:00` : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{
                    false: c.surfaceHi,
                    true: c.textBright,
                  }}
                  thumbColor={c.textPrimary}
                  {...WEB_SWITCH_PROPS}
                />
              }
            />
          </View>
        </View>

        {/* Your Data Section */}
        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={[styles.sectionTitle, { color: c.textSecondary, letterSpacing: 1.5 }]}>Your Data</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Download size={22} color={c.textPrimary} />}
              title="Export Entries"
              subtitle="Download as text or JSON"
              onPress={showExportOptions}
            />
            <SettingsRow
              icon={<Icon name="lock" size={22} color={c.textSecondary} />}
              title="Encryption"
              subtitle="Entries encrypted at rest"
              showChevron={false}
            />
            {aiEnabled && reflectionCount > 0 && (
              <SettingsRow
                icon={<Trash2 size={22} color={c.warn} />}
                title="Delete All Reflections"
                subtitle={`${reflectionCount} reflection${reflectionCount !== 1 ? 's' : ''}`}
                onPress={handleDeleteReflections}
                destructive
                showChevron={false}
              />
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={[styles.sectionTitle, { color: c.textSecondary, letterSpacing: 1.5 }]}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Icon name="edit" size={22} color={c.textPrimary} />}
              title="Edit Profile"
              onPress={() => router.push('/(tabs)/profile')}
            />
            <SettingsRow
              icon={<LogOut size={22} color={c.warn} />}
              title="Sign Out"
              onPress={handleSignOut}
              destructive
              showChevron={false}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={[styles.sectionTitle, { color: c.textSecondary, letterSpacing: 1.5 }]}>Danger Zone</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Trash2 size={22} color={c.warn} />}
              title="Delete All Data"
              subtitle="Permanently remove everything"
              onPress={handleDeleteData}
              destructive
              showChevron={false}
            />
          </View>
        </View>

        {/* Footer */}
        <Pressable style={styles.footer} onPress={() => {
          showToast('info', 'ThreeSixtyThree™ v1.0.0 — "Show up. Do the work. Let go of perfection."', 5000);
        }}>
          <Text family="mono" variant="xs" centered uppercase style={{ color: c.textTertiary, letterSpacing: 1.5 }}>Three Sentences · v1.0.0</Text>
          <Text family="mono" variant="xs" centered uppercase style={{ color: c.textTertiary, letterSpacing: 1.5, marginTop: spacing[1] }}>Be better. Do better.</Text>
        </Pressable>
      </ScrollView>

      <AIOptInModal
        visible={showAIOptInModal}
        onCancel={() => setShowAIOptInModal(false)}
        onConfirm={handleAIOptInConfirm}
      />

      {confirmAction && (
        <ConfirmationModal
          visible
          title={CONFIRM_CONFIG[confirmAction].title}
          message={CONFIRM_CONFIG[confirmAction].message}
          confirmLabel={CONFIRM_CONFIG[confirmAction].confirmLabel}
          destructive={CONFIRM_CONFIG[confirmAction].destructive}
          onCancel={() => setConfirmAction(null)}
          onConfirm={CONFIRM_CONFIG[confirmAction].onConfirm}
        />
      )}

      <BottomSheet visible={showExportSheet} onClose={() => setShowExportSheet(false)} maxHeight={0.32}>
        <View style={styles.exportSheet}>
          <Text family="sansSemibold" variant="lg" style={{ color: c.textPrimary, marginBottom: spacing[1] }}>
            Export Entries
          </Text>
          <Text family="sans" variant="sm" style={{ color: c.textSecondary, marginBottom: spacing[4] }}>
            Choose your export format
          </Text>
          <TouchableOpacity
            style={[styles.exportOption, { borderColor: c.frame }]}
            onPress={() => { setShowExportSheet(false); handleExport('txt'); }}
            accessibilityRole="button"
            accessibilityLabel="Export as plain text"
          >
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary }}>Plain Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportOption, { borderColor: c.frame }]}
            onPress={() => { setShowExportSheet(false); handleExport('json'); }}
            accessibilityRole="button"
            accessibilityLabel="Export as JSON"
          >
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary }}>JSON</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
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
    paddingHorizontal: edgePadding.content,
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  exportSheet: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
  },
  exportOption: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },

  // Profile header card
  profileCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e1e22',
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  profileInfo: {
    flex: 1,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  // Sections
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

  // Footer
  footer: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
});
