/**
 * ThreeSixtyThree™ Three Sentences - Confirmation Modal
 * 
 * Displays before final submission with 363 philosophy messaging.
 * "Presence over perfection."
 */

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: 'rgba(6, 20, 27, 0.9)' }]}
        onPress={onCancel}
        accessibilityLabel="Close modal"
      >
        <Pressable
          style={[styles.content, { backgroundColor: activeColors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: spacing[6],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
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
