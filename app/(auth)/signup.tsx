import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
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
import { useToast } from '@/contexts/ToastContext';
import { normalizeUsername } from '@/types/profile';

export default function SignupScreen() {
  const c = colors.dark;
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = useCallback(async () => {
    if (!email || !password || !name || !username) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    const normalized = normalizeUsername(username);
    if (normalized.length < 3) {
      setUsernameError('Username must be at least 3 characters (letters, numbers, _)');
      return;
    }

    try {
      setLoading(true);

      const { data: taken, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', normalized)
        .maybeSingle();
      if (!checkError && taken) {
        setUsernameError(`@${normalized} is taken — try another`);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username: normalized } },
      });
      if (error) throw error;
      if (data.session) {
        router.replace('/');
      } else {
        showToast('info', `Confirmation link sent to ${email}. Click it, then sign in.`, 6000);
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      showToast('error', error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, name, username, showToast]);

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
              Create account
            </Text>
          </View>

          <View style={styles.form}>
            <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
            <View style={{ height: spacing[4] }} />
            <Input
              label="Username"
              placeholder="@handle"
              value={username}
              onChangeText={(v) => { setUsername(v); setUsernameError(null); }}
              autoCapitalize="none"
              autoCorrect={false}
              error={!!usernameError}
            />
            {usernameError && (
              <Text family="mono" variant="xs" style={{ color: c.warn, marginTop: spacing[1] }}>
                {usernameError}
              </Text>
            )}
            <View style={{ height: spacing[4] }} />
            <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <View style={{ height: spacing[4] }} />
            <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            <View style={{ height: spacing[6] }} />
            <Button title="Create account" onPress={handleSignup} loading={loading} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text family="mono" variant="xs" centered style={{ color: c.textSecondary, letterSpacing: 0.5 }}>
                Already have an account?{' '}
                <Text family="mono" variant="xs" style={{ color: c.textBright }}>Sign in</Text>
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
  scrollContent: { paddingHorizontal: edgePadding.content, paddingTop: spacing[10], paddingBottom: spacing[8] },
  logoSection: { alignItems: 'center', marginBottom: spacing[8] },
  form: {},
  footer: { marginTop: spacing[8] },
});
