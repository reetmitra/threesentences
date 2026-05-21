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
}

export function ConfirmationModal({ visible, onCancel, onConfirm, loading }: ConfirmationModalProps) {
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
            Submit entry?
          </Text>
          <Text serif variant="base" style={{ color: c.textSecondary, lineHeight: 26, marginBottom: spacing[6] }}>
            Once submitted, your entry is permanent. Three sentences, locked.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.ghostButton, { borderColor: c.frame }]}
            >
              <Text family="sansSemibold" variant="base" style={{ color: c.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Button title="Submit" onPress={onConfirm} loading={loading} />
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
    backgroundColor: 'rgba(6,6,8,0.85)',
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
});
