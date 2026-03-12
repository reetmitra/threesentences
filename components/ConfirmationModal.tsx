/**
 * ThreeSixtyThree™ Three Sentences - Confirmation Modal
 *
 * Displays before final submission with 363 philosophy messaging.
 * "Presence over perfection."
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

interface ConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  loading = false,
}: ConfirmationModalProps) {
  const activeColors = colors.dark;

  const handleConfirm = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  return (
    <BottomSheet visible={visible} onClose={onCancel} maxHeight={0.5}>
      <View style={styles.content}>
        <Text variant="xl" weight="bold" style={styles.title}>
          Submit Entry
        </Text>

        <Text variant="base" color="secondary" style={styles.message}>
          Once submitted, this entry cannot be edited or deleted. Your words
          will stand as written, capturing how you felt in this moment.
        </Text>

        <View style={[styles.philosophy, { backgroundColor: activeColors.surfaceHover }]}>
          <Text variant="base" color="secondary" style={styles.philosophyText}>
            This is the ThreeSixtyThree™ way:
          </Text>
          <Text
            variant="lg"
            weight="semibold"
            style={[styles.philosophyHighlight, { color: activeColors.textPrimary }]}
          >
            Presence over perfection.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={onCancel}
            style={styles.cancelButton}
          />
          <Button
            title="Submit"
            variant="primary"
            onPress={handleConfirm}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[2],
  },
  title: {
    marginBottom: spacing[3],
  },
  message: {
    marginBottom: spacing[4],
    lineHeight: 24,
  },
  philosophy: {
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[5],
  },
  philosophyText: {
    marginBottom: spacing[1],
  },
  philosophyHighlight: {
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
