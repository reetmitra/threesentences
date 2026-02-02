/**
 * ThreeSixtyThree™ Three Sentences - AI Opt-In Modal
 * 
 * Per PRD FR-AI-02: Clear explanation of data usage before opt-in.
 */

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  useColorScheme,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface AIOptInModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AIOptInModal({
  visible,
  onCancel,
  onConfirm,
}: AIOptInModalProps) {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={onCancel}
        accessibilityLabel="Close modal"
      >
        <Pressable
          style={[styles.content, { backgroundColor: activeColors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="xl" weight="bold" style={styles.title}>
              Enable AI Reflection?
            </Text>

            <Text variant="base" color="secondary" style={styles.intro}>
              Before enabling, please understand how your data will be used:
            </Text>

            {/* Data usage explanation */}
            <View style={styles.section}>
              <Text variant="base" weight="semibold" style={styles.sectionTitle}>
                What happens to your entries
              </Text>
              <Text variant="sm" color="secondary" style={styles.sectionText}>
                When you request a reflection, your journal entries for the selected time period 
                are sent to an AI service for analysis. The AI reads your entries to identify 
                themes and patterns.
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="base" weight="semibold" style={styles.sectionTitle}>
                Your privacy
              </Text>
              <Text variant="sm" color="secondary" style={styles.sectionText}>
                • Entries are decrypted only when you request a reflection{'\n'}
                • Entries are not stored by the AI service{'\n'}
                • Analysis happens on-demand, not automatically{'\n'}
                • You can delete all reflections at any time{'\n'}
                • You can disable this feature at any time
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="base" weight="semibold" style={styles.sectionTitle}>
                What AI Reflection is NOT
              </Text>
              <Text variant="sm" color="secondary" style={styles.sectionText}>
                AI Reflection is not therapy and does not provide mental health diagnoses 
                or treatment recommendations. It simply observes patterns in your writing 
                to help you reflect.
              </Text>
            </View>

            {/* Warning box */}
            <View style={[styles.warningBox, { backgroundColor: activeColors.accentSubtle }]}>
              <Text variant="sm" style={{ color: activeColors.accent }}>
                By enabling this feature, you consent to having your journal entries 
                analyzed by AI when you request a reflection.
              </Text>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={onCancel}
              style={styles.button}
            />
            <Button
              title="Enable AI Reflection"
              variant="primary"
              onPress={onConfirm}
              style={styles.button}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: spacing[5],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    marginBottom: spacing[3],
  },
  intro: {
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[2],
  },
  sectionText: {
    lineHeight: 22,
  },
  warningBox: {
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  button: {
    flex: 1,
  },
});
