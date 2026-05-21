import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
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

export default function LoginScreen() {
  const c = colors.dark;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      Alert.alert('Enter your email', 'Type your email address above, then tap "Forgot password?"');
      return;
    }
    try {
      setResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'threesentences://reset-password',
      });
      if (error) throw error;
      Alert.alert('Check your email', 'A password reset link has been sent to ' + email);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not send reset email');
    } finally {
      setResetLoading(false);
    }
  }, [email]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Sign in failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <Logo size={52} />
            <Text family="serifItalic" variant="2xl" style={{ color: c.textPrimary, marginTop: spacing[4] }}>
              Three Sentences
            </Text>
            <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginTop: spacing[1] }}>
              Welcome back
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View style={{ height: spacing[4] }} />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            <View style={{ height: spacing[6] }} />
            <Button title="Sign in" onPress={handleLogin} loading={loading} />
            <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading} style={{ marginTop: spacing[4], alignItems: 'center' }}>
              <Text family="mono" variant="xs" style={{ color: c.textSecondary, letterSpacing: 0.5 }}>
                {resetLoading ? 'Sending…' : 'Forgot password?'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text family="mono" variant="xs" centered style={{ color: c.textSecondary, letterSpacing: 0.5 }}>
                No account?{' '}
                <Text family="mono" variant="xs" style={{ color: c.textBright }}>
                  Sign up
                </Text>
              </Text>
            </TouchableOpacity>
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
  footer: { marginTop: spacing[8] },
});
