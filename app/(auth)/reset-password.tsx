import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { colors } from '@/theme/colors';
import { spacing, edgePadding } from '@/theme/spacing';
import { supabase } from '@/config/supabase';

export default function ResetPasswordScreen() {
  const c = colors.dark;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = useCallback(async () => {
    if (!password || !confirm) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert('Password updated', 'You can now sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  }, [password, confirm]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <Logo size={52} />
            <Text family="serifItalic" variant="2xl" style={{ color: c.textPrimary, marginTop: spacing[4] }}>
              New password
            </Text>
            <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginTop: spacing[1] }}>
              Choose something memorable
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="New password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <View style={{ height: spacing[4] }} />
            <Input
              label="Confirm password"
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="new-password"
            />
            <View style={{ height: spacing[6] }} />
            <Button title="Update password" onPress={handleReset} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scrollContent: { paddingHorizontal: edgePadding.content, paddingTop: spacing[12], paddingBottom: spacing[8] },
  logoSection: { alignItems: 'center', marginBottom: spacing[10] },
  form: {},
});
