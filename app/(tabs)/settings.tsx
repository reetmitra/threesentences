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
  Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { BedDouble, Download, Trash2, ListChecks, SmilePlus, Moon, LogOut, Lightbulb, Vibrate, Shield, FileText, Mail } from 'lucide-react-native';
import { PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from '@/constants/links';
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
import { exportEntries, getEntryCount, ExportFormat } from '@/store/entries';
import { getPreferences, updatePreferences } from '@/store/onboarding';
import { deleteAllReflections, getReflectionCount } from '@/store/reflections';
import { getProfile, deleteAccount } from '@/store/profile';
import { resetSettingsCache, getCachedSettings, updateSettings } from '@/store/settings';
import { clearPatternsCache } from '@/store/patterns';
import { SettingsPatch, UserSettings } from '@/types/tracking';
import { useCheckIn } from '@/hooks/useCheckIn';
import { HabitSetupSheet } from '@/components/HabitSetupSheet';
import { suggestHabits } from '@/types/tracking';
import { DAY_ROLLOVER_OPTIONS, DEFAULT_WIND_DOWN_HOUR, formatHourLabel, formatRolloverLabel, getTodayDateString, WIND_DOWN_HOURS } from '@/types/entry';
import { refreshHapticsPreference } from '@/utils/haptics';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleWindDown,
  cancelWindDown,
} from '@/services/notifications';

// react-native-web's Switch colors its ON thumb with `activeThumbColor`
// (default teal) which RN core types don't know about — without this the
// toggles render green on web, off-brand for the monochrome system.
const WEB_SWITCH_PROPS = (
  Platform.OS === 'web' ? { activeThumbColor: colors.dark.paper } : {}
) as Record<string, unknown>;

// ON: ivory track, dark thumb. OFF: quiet track, grey thumb. No hue, and the thumb
// never disappears into the track (it did when both were near-white).
function switchProps(value: boolean): Record<string, unknown> {
  const c = colors.dark;
  return {
    trackColor: { false: c.surfaceHi, true: c.textPrimary },
    thumbColor: value ? c.background : c.textSecondary,
    ...WEB_SWITCH_PROPS,
  };
}

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
        <Icon name="caret" size={20} color={c.textSecondary} />
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
  const [reflectionCount, setReflectionCount] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);
  const [windDownEnabled, setWindDownEnabled] = useState(false);
  const [windDownHour, setWindDownHour] = useState<number>(DEFAULT_WIND_DOWN_HOUR);
  const [showWindDownSheet, setShowWindDownSheet] = useState(false);
  const [showAIOptInModal, setShowAIOptInModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'signOut' | 'deleteReflections' | 'deleteAccount' | null>(null);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string; profileImage?: string; interests?: string[] } | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => getCachedSettings());
  const [showHabitSetup, setShowHabitSetup] = useState(false);
  const [showRolloverSheet, setShowRolloverSheet] = useState(false);
  const checkIn = useCheckIn(getTodayDateString());

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [count, refCount, prefs] = await Promise.all([
        getEntryCount(userId),
        getReflectionCount(),
        getPreferences(),
      ]);
      setEntryCount(count);
      setReflectionCount(refCount);
      setAiEnabled(prefs.aiReflectionEnabled);
      setHapticsEnabled(prefs.hapticsEnabled);
      setPromptEnabled(prefs.dailyPromptEnabled);
      setNotificationsEnabled(prefs.notificationsEnabled);
      setReminderHour(prefs.reminderHour);
      setWindDownEnabled(prefs.windDownEnabled);
      setWindDownHour(prefs.windDownHour);
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
      // loadSettings may have landed after mount (boot-timeout path).
      setSettings(getCachedSettings());
      loadData();
      checkIn.reload();
    }, [loadData, checkIn.reload])
  );

  const saveSettings = async (patch: SettingsPatch, successMessage?: string) => {
    try {
      await updateSettings(patch);
      if (successMessage) showToast('success', successMessage);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not save your settings. Please try again.');
    }
    // The cache, not this call's result: another save may have settled since.
    setSettings(getCachedSettings());
  };

  const handleRolloverSelect = (hour: number) => {
    setShowRolloverSheet(false);
    if (hour === settings.dayRolloverHour) return;
    saveSettings({ dayRolloverHour: hour }, `Your day now ends at ${formatRolloverLabel(hour)}.`);
  };

  const handleSignOut = () => setConfirmAction('signOut');

  const confirmSignOut = async () => {
    setConfirmAction(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await signOut();
    await resetSettingsCache();
    await clearPatternsCache();
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

  const handleWindDownToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!value) {
      await cancelWindDown();
      await updatePreferences({ windDownEnabled: false });
      setWindDownEnabled(false);
      return;
    }
    try {
      if (!(await requestNotificationPermission())) {
        showToast('error', 'Please enable notifications in your device settings.');
        return;
      }
      await scheduleWindDown(windDownHour);
      await updatePreferences({ windDownEnabled: true });
      setWindDownEnabled(true);
      showToast('success', `Wind-down nudge set for ${formatHourLabel(windDownHour)}.`);
    } catch (error) {
      console.error('Wind-down reminder failed:', error);
      showToast('error', 'Could not set the reminder. Please try again.');
    }
  };

  const handleWindDownSelect = async (hour: number) => {
    setShowWindDownSheet(false);
    if (hour === windDownHour) return;
    try {
      await scheduleWindDown(hour);
      await updatePreferences({ windDownHour: hour });
      setWindDownHour(hour);
      showToast('success', `Wind-down nudge moved to ${formatHourLabel(hour)}.`);
    } catch (error) {
      console.error('Wind-down reminder failed:', error);
      showToast('error', 'Could not move the reminder. Please try again.');
    }
  };

  // The nudge belongs to the habits tracker: turning habits off stops it too.
  const handleHabitsToggle = async (value: boolean) => {
    saveSettings({ trackers: { habits: value } });
    if (!value && windDownEnabled) {
      await cancelWindDown();
      await updatePreferences({ windDownEnabled: false });
      setWindDownEnabled(false);
    }
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

  const handleDeleteAccount = () => setConfirmAction('deleteAccount');

  const confirmDeleteAccount = async () => {
    setConfirmAction(null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await deleteAccount();
      router.replace('/(auth)/login');
      showToast('success', 'Your account and data have been deleted.');
    } catch (error) {
      showToast('error', (error as Error).message);
    }
  };

  const openLink = (url: string) => {
    WebBrowser.openBrowserAsync(url).catch(() => showToast('error', 'Could not open the page.'));
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
    deleteAccount: {
      title: 'Delete your account?',
      message: 'This permanently deletes your account, journal entries, reflections, friends, and messages. It cannot be undone.',
      confirmLabel: 'Delete Account',
      onConfirm: confirmDeleteAccount,
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
                <Text family="sans" variant="sm" style={{ color: c.textSecondary }}>
                  {entryCount === 0
                    ? 'Your first night is waiting'
                    : `${entryCount} ${entryCount === 1 ? 'night' : 'nights'} · ${Math.max(363 - entryCount, 0)} to go`}
                </Text>
              </View>
            </View>
            <Icon name="caret" size={20} color={c.textSecondary} />
          </Pressable>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text family="sansSemibold" variant="sm" style={[styles.sectionTitle, { color: c.textSecondary }]}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Icon name="spark" size={22} color={c.textPrimary} />}
              title="AI reflection"
              subtitle={aiEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={aiEnabled}
                  onValueChange={handleAIToggle}
                  {...switchProps(aiEnabled)}
                />
              }
            />
            <SettingsRow
              icon={<Vibrate size={22} color={c.textPrimary} />}
              title="Haptic feedback"
              subtitle={hapticsEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={hapticsEnabled}
                  onValueChange={handleHapticsToggle}
                  {...switchProps(hapticsEnabled)}
                />
              }
            />
            <SettingsRow
              icon={<Lightbulb size={22} color={c.textPrimary} />}
              title="Daily writing prompt"
              subtitle={promptEnabled ? "Shown as today's prompt" : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={promptEnabled}
                  onValueChange={handlePromptToggle}
                  {...switchProps(promptEnabled)}
                />
              }
            />
            <SettingsRow
              icon={<Icon name="bell" size={22} color={c.textPrimary} />}
              title="Daily reminder"
              subtitle={notificationsEnabled ? `Reminder at ${reminderHour}:00` : 'Disabled'}
              showChevron={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  {...switchProps(notificationsEnabled)}
                />
              }
            />
          </View>
        </View>

        {/* Trackers Section */}
        <View style={styles.section}>
          <Text family="sansSemibold" variant="sm" style={[styles.sectionTitle, { color: c.textSecondary }]}>Trackers</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<ListChecks size={22} color={c.textPrimary} />}
              title="Habits"
              subtitle={settings.trackers.habits ? 'Shown in your nightly check-in' : 'Off'}
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.trackers.habits}
                  onValueChange={handleHabitsToggle}
                  {...switchProps(settings.trackers.habits)}
                />
              }
            />
            <SettingsRow
              icon={<SmilePlus size={22} color={c.textPrimary} />}
              title="Mood"
              subtitle={settings.trackers.mood ? 'Shown in your nightly check-in' : 'Off'}
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.trackers.mood}
                  onValueChange={(value) => saveSettings({ trackers: { mood: value } })}
                  {...switchProps(settings.trackers.mood)}
                />
              }
            />
            {settings.trackers.habits && (
              <SettingsRow
                icon={<Icon name="edit" size={22} color={c.textPrimary} />}
                title="Edit habits"
                subtitle={`${checkIn.habits.length} active`}
                onPress={() => setShowHabitSetup(true)}
              />
            )}
            {settings.trackers.habits && (
              <SettingsRow
                icon={<BedDouble size={22} color={c.textPrimary} />}
                title="Wind-down nudge"
                subtitle={windDownEnabled ? `A gentle nudge at ${formatHourLabel(windDownHour)}` : 'Off'}
                showChevron={false}
                rightElement={
                  <Switch
                    value={windDownEnabled}
                    onValueChange={handleWindDownToggle}
                    {...switchProps(windDownEnabled)}
                  />
                }
              />
            )}
            {settings.trackers.habits && windDownEnabled && (
              <SettingsRow
                icon={<Icon name="bell" size={22} color={c.textPrimary} />}
                title="Nudge time"
                subtitle={formatHourLabel(windDownHour)}
                onPress={() => setShowWindDownSheet(true)}
              />
            )}
            <SettingsRow
              icon={<Moon size={22} color={c.textPrimary} />}
              title="Day ends at"
              subtitle={formatRolloverLabel(settings.dayRolloverHour)}
              onPress={() => setShowRolloverSheet(true)}
            />
          </View>
        </View>

        {/* Your Data Section */}
        <View style={styles.section}>
          <Text family="sansSemibold" variant="sm" style={[styles.sectionTitle, { color: c.textSecondary }]}>Your data</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Download size={22} color={c.textPrimary} />}
              title="Export entries"
              subtitle="Download as text or JSON"
              onPress={showExportOptions}
            />
            <SettingsRow
              icon={<Icon name="lock" size={22} color={c.textSecondary} />}
              title="Encryption"
              subtitle="Encrypted in transit and at rest"
              showChevron={false}
            />
            {aiEnabled && reflectionCount > 0 && (
              <SettingsRow
                icon={<Trash2 size={22} color={c.warn} />}
                title="Delete all reflections"
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
          <Text family="sansSemibold" variant="sm" style={[styles.sectionTitle, { color: c.textSecondary }]}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Icon name="edit" size={22} color={c.textPrimary} />}
              title="Edit profile"
              onPress={() => router.push('/(tabs)/profile')}
            />
            <SettingsRow
              icon={<LogOut size={22} color={c.warn} />}
              title="Sign out"
              onPress={handleSignOut}
              destructive
              showChevron={false}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text family="sansSemibold" variant="sm" style={[styles.sectionTitle, { color: c.textSecondary }]}>About</Text>
          <View style={[styles.principleCard, { backgroundColor: c.surface, borderColor: c.frame }]}>
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              The 363 Way
            </Text>
            <Text serif variant="sm" style={{ color: c.textSecondary, lineHeight: 22 }}>
              Commit to 363 days out of 365. Missed days are simply empty — not failures, not broken streaks. Return when you return, without shame.
            </Text>
          </View>
          <View style={[styles.principleCard, { backgroundColor: c.surface, borderColor: c.frame }]}>
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              Presence Over Perfection
            </Text>
            <Text serif variant="sm" style={{ color: c.textSecondary, lineHeight: 22 }}>
              Three sentences, locked when your day ends. No deletions. Your words stand as written, capturing how you felt in the moment.
            </Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Shield size={22} color={c.textPrimary} />}
              title="Privacy policy"
              onPress={() => openLink(PRIVACY_URL)}
            />
            <SettingsRow
              icon={<FileText size={22} color={c.textPrimary} />}
              title="Terms of use"
              onPress={() => openLink(TERMS_URL)}
            />
            <SettingsRow
              icon={<Mail size={22} color={c.textPrimary} />}
              title="Contact support"
              subtitle={SUPPORT_EMAIL}
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => showToast('info', `Email us at ${SUPPORT_EMAIL}`))}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text family="sansSemibold" variant="sm" style={[styles.sectionTitle, { color: c.textSecondary }]}>Danger zone</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Trash2 size={22} color={c.warn} />}
              title="Delete account"
              subtitle="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              destructive
              showChevron={false}
            />
          </View>
        </View>

        {/* Footer */}
        <Pressable style={styles.footer} onPress={() => {
          showToast('info', 'ThreeSixtyThree™ v1.0.0 — "Show up. Do the work. Let go of perfection."', 5000);
        }}>
          <Text variant="xs" centered style={{ color: c.textSecondary }}>Three Sentences · v1.0.0</Text>
          <Text variant="xs" centered style={{ color: c.textSecondary, marginTop: spacing[1] }}>Be better. Do better.</Text>
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

      <HabitSetupSheet
        visible={showHabitSetup}
        onClose={() => setShowHabitSetup(false)}
        habits={checkIn.habits}
        suggestions={suggestHabits(userProfile?.interests ?? [], checkIn.habits.map((h) => h.name))}
        onAdd={checkIn.addHabit}
        onRemove={checkIn.removeHabit}
      />

      {/* Scrolls so the seven options never clip (667pt screens, large Dynamic Type). */}
      <BottomSheet visible={showRolloverSheet} onClose={() => setShowRolloverSheet(false)} maxHeight={0.75}>
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.exportSheet}>
          <Text family="sansSemibold" variant="lg" style={{ color: c.textPrimary, marginBottom: spacing[1] }}>
            Day ends at
          </Text>
          <Text family="sans" variant="sm" style={{ color: c.textSecondary, marginBottom: spacing[4] }}>
            Entries lock and a new day begins at this hour.
          </Text>
          {DAY_ROLLOVER_OPTIONS.map((hour) => {
            const selected = hour === settings.dayRolloverHour;
            const label = formatRolloverLabel(hour);
            return (
              <Pressable
                key={hour}
                style={styles.rolloverOption}
                onPress={() => handleRolloverSelect(hour)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Day ends at ${label}`}
              >
                <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, flex: 1 }}>{label}</Text>
                {selected && <Icon name="check" size={20} color={c.textPrimary} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={showWindDownSheet} onClose={() => setShowWindDownSheet(false)} maxHeight={0.5}>
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.exportSheet}>
          <Text family="sansSemibold" variant="lg" style={{ color: c.textPrimary, marginBottom: spacing[1] }}>
            Nudge time
          </Text>
          <Text family="sans" variant="sm" style={{ color: c.textSecondary, marginBottom: spacing[4] }}>
            A gentle reminder to start winding down. Pick the hour that works for you.
          </Text>
          {WIND_DOWN_HOURS.map((hour) => {
            const selected = hour === windDownHour;
            const label = formatHourLabel(hour);
            return (
              <Pressable
                key={hour}
                style={styles.rolloverOption}
                onPress={() => handleWindDownSelect(hour)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Nudge at ${label}`}
              >
                <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, flex: 1 }}>{label}</Text>
                {selected && <Icon name="check" size={20} color={c.textPrimary} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>

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
  sheetScroll: {
    flex: 1,
  },
  exportOption: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },

  rolloverOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
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
  principleCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: spacing[4], marginBottom: spacing[3] },
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
