/**
 * Three™ - Habit Setup Sheet
 *
 * Choose up to three habits: remove active ones, type your own, or tap a
 * suggestion. Input and suggestions hide once three are active.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';
import { HABIT_NAME_MAX, Habit, MAX_ACTIVE_HABITS } from '@/types/tracking';

const c = colors.dark;

interface HabitSetupSheetProps {
  visible: boolean;
  onClose: () => void;
  habits: Habit[];
  suggestions: string[];
  /** Resolves to a readable error message, or null on success. */
  onAdd: (name: string) => Promise<string | null>;
  onRemove: (id: string) => void;
}

export function HabitSetupSheet({
  visible,
  onClose,
  habits,
  suggestions,
  onAdd,
  onRemove,
}: HabitSetupSheetProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<Habit | null>(null);
  const full = habits.length >= MAX_ACTIVE_HABITS;

  const add = async (raw: string): Promise<boolean> => {
    if (adding) return false;
    setAdding(true);
    const message = await onAdd(raw);
    setAdding(false);
    setError(message);
    return message === null;
  };

  const addTyped = async () => {
    if (await add(name)) setName('');
  };

  const close = () => {
    setError(null);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={close} maxHeight={0.7}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text family="sansSemibold" variant="lg" style={styles.title}>
          Your three
        </Text>

        {habits.map((habit) => (
          <View key={habit.id} style={styles.habitRow}>
            <Text variant="base" style={styles.habitName} numberOfLines={2}>
              {habit.name}
            </Text>
            <Pressable
              onPress={() => setPendingRemove(habit)}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${habit.name}`}
            >
              <Text variant="sm" style={styles.removeText}>
                Remove
              </Text>
            </Pressable>
          </View>
        ))}

        {!full && (
          <>
            <View style={styles.addRow}>
              <Input
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError(null);
                }}
                placeholder="Add your own"
                maxLength={HABIT_NAME_MAX}
                returnKeyType="done"
                onSubmitEditing={addTyped}
                accessibilityLabel="New habit name"
                containerStyle={styles.inputContainer}
              />
              <Button
                title="Add"
                onPress={addTyped}
                disabled={!name.trim()}
                loading={adding}
                style={styles.addButton}
              />
            </View>
            {error && (
              <Text variant="sm" style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
            {suggestions.length > 0 && (
              <View style={styles.chips}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => add(s)}
                    style={styles.chip}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${s}`}
                  >
                    <Text variant="sm" style={styles.chipText}>
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Nested inside the sheet's Modal so iOS can present it on top. */}
      {pendingRemove && (
        <ConfirmationModal
          visible
          title={`Remove "${pendingRemove.name}"?`}
          message="Its past check-ins stay in your history."
          confirmLabel="Remove"
          onCancel={() => setPendingRemove(null)}
          onConfirm={() => {
            onRemove(pendingRemove.id);
            setPendingRemove(null);
          }}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[6], paddingTop: spacing[2], paddingBottom: spacing[6] },
  title: { color: c.textPrimary, marginBottom: spacing[3] },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.frame,
  },
  habitName: { flex: 1, color: c.textPrimary },
  removeButton: { minHeight: 44, minWidth: 44, paddingHorizontal: spacing[2], justifyContent: 'center' },
  removeText: { color: c.textSecondary },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[4] },
  inputContainer: { flex: 1 },
  addButton: { width: 88 },
  error: { color: c.warn, marginTop: spacing[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[4] },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing[4],
    borderRadius: componentRadius.chip,
    backgroundColor: c.surfaceHi,
    justifyContent: 'center',
  },
  chipText: { color: c.textPrimary },
});
