/**
 * Three™ - Login Screen
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/config/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
            Alert.alert('Login Failed', error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [email, password]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Logo size={60} animated={false} />
                    <Text variant="2xl" weight="bold" style={styles.title}>
                        Welcome Back
                    </Text>
                    <Text variant="base" color="secondary" style={styles.subtitle}>
                        Sign in to continue
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="enter@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                    <View style={styles.spacer} />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                    />

                    <View style={styles.divider} />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text variant="sm" color="secondary">
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <Text variant="sm" weight="bold" color="primary">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing[6],
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing[8],
    },
    title: {
        marginTop: spacing[6],
        marginBottom: spacing[2],
    },
    subtitle: {
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    spacer: {
        height: spacing[4],
    },
    divider: {
        height: spacing[8],
    },
    button: {
        marginTop: spacing[2],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing[6],
    },
});
