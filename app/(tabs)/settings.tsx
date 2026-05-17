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
  Alert,
  Share,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  Lock,
  LogOut,
  Edit3,
  Flame,
  Lightbulb,
  Vibrate,
  Bell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { AIOptInModal } from '@/components/AIOptInModal';
import { SkeletonStatsCard } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
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

  const showExportOptions = () => {
    Alert.alert(
      'Export Entries',
      'Choose your export format',
      [
        { text: 'Plain Text', onPress: () => handleExport('txt') },
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
            showToast('success', 'All reflections deleted.');
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
            showToast('success', 'All data has been removed.');
            loadData();
          },
        },
      ]
    );
  };

  const displayName = userProfile?.name || user?.firstName || 'User';
  const displayEmail = user?.email;
  const initials = displayName.charAt(0).toUpperCase();

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

        {/* Profile Header Card */}
        {isLoading ? (
          <SkeletonStatsCard style={{ marginBottom: spacing[5] }} />
        ) : (
          <Pressable
            style={[styles.profileCard, { backgroundColor: activeColors.surface }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: activeColors.surfaceHover }]}>
              <Text variant="xl" weight="bold">{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text variant="lg" weight="semibold">{displayName}</Text>
              {displayEmail && (
                <Text variant="sm" color="secondary">{displayEmail}</Text>
              )}
              <View style={styles.profileStats}>
                <Flame size={14} color={activeColors.accent} />
                <Text variant="sm" color="secondary" style={{ marginLeft: 4 }}>
                  {currentStreak} day streak
                </Text>
                <Text variant="sm" color="tertiary" style={{ marginLeft: spacing[3] }}>
                  {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={activeColors.textTertiary} />
          </Pressable>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            PREFERENCES
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
            <SettingsRow
              icon={<Vibrate size={22} color={activeColors.textPrimary} />}
              title="Haptic Feedback"
              subtitle={hapticsEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={hapticsEnabled}
                  onValueChange={handleHapticsToggle}
                  trackColor={{
                    false: activeColors.surfaceHover,
                    true: activeColors.accent,
                  }}
                  thumbColor={activeColors.textPrimary}
                />
              }
            />
            <SettingsRow
              icon={<Lightbulb size={22} color={activeColors.textPrimary} />}
              title="Daily Writing Prompt"
              subtitle={promptEnabled ? 'Shown on Insights tab' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={promptEnabled}
                  onValueChange={handlePromptToggle}
                  trackColor={{
                    false: activeColors.surfaceHover,
                    true: activeColors.accent,
                  }}
                  thumbColor={activeColors.textPrimary}
                />
              }
            />
            <SettingsRow
              icon={<Bell size={22} color={activeColors.textPrimary} />}
              title="Daily Reminder"
              subtitle={notificationsEnabled ? `Reminder at ${reminderHour}:00` : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{
                    false: activeColors.surfaceHover,
                    true: activeColors.accent,
                  }}
                  thumbColor={activeColors.textPrimary}
                />
              }
            />
          </View>
        </View>

        {/* Your Data Section */}
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

        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
            ACCOUNT
          </Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Edit3 size={22} color={activeColors.textPrimary} />}
              title="Edit Profile"
              onPress={() => router.push('/(tabs)/profile')}
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
        <Pressable style={styles.footer} onPress={() => {
          Alert.alert(
            'About ThreeSixtyThree™',
            'Three Sentences is the official journaling application of the ThreeSixtyThree™ self-improvement system.\n\nVersion 1.0.0\n\n"Show up. Do the work. Let go of perfection."',
            [{ text: 'OK' }]
          );
        }}>
          <Text variant="xs" color="tertiary" centered>
            ThreeSixtyThree™ v1.0.0
          </Text>
          <Text variant="xs" color="tertiary" centered style={styles.footerTagline}>
            Show up. Do the work. Let go of perfection.
          </Text>
        </Pressable>
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

  // Profile header card
  profileCard: {
    borderRadius: 16,
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
  footerTagline: {
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
});
