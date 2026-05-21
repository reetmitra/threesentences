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

export default function SignupScreen() {
  const c = colors.dark;
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = useCallback(async () => {
    if (!email || !password || !name || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username } },
      });
      if (error) throw error;
      if (data.session) {
        router.replace('/');
      } else {
        Alert.alert(
          'Check your email',
          `Confirmation link sent to ${email}. Click it then sign in.`,
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Sign up failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [email, password, name, username]);

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
            <Input label="Username" placeholder="@handle" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
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
