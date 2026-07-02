import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';

interface ConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Amber-tinted confirm button for irreversible actions */
  destructive?: boolean;
}

export function ConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  loading,
  title = 'Submit entry?',
  message = 'You can refine your three sentences until midnight. After that, they stand as written.',
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  destructive = false,
}: ConfirmationModalProps) {
  const c = colors.dark;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View
          style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.frame }]}
          onStartShouldSetResponder={() => true}
        >
          <Text family="sansSemibold" variant="lg" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
            {title}
          </Text>
          <Text serif variant="base" style={{ color: c.textSecondary, lineHeight: 26, marginBottom: spacing[6] }}>
            {message}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.ghostButton, { borderColor: c.frame }]}
            >
              <Text family="sansSemibold" variant="base" style={{ color: c.textSecondary }}>{cancelLabel}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              {destructive ? (
                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={loading}
                  style={[styles.destructiveButton, { borderColor: c.warn }]}
                >
                  <Text family="sansSemibold" variant="base" style={{ color: c.warn }}>
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Button title={confirmLabel} onPress={onConfirm} loading={loading} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: componentRadius.bottomSheet,
    borderTopRightRadius: componentRadius.bottomSheet,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: spacing[6],
    paddingBottom: spacing[8],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  ghostButton: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButton: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
