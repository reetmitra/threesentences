/**
 * Three™ - Signup Screen
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

export default function SignupScreen() {
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
                options: {
                    data: { name, username },
                },
            });

            if (error) throw error;

            if (data.session) {
                // No email confirmation required — let index.tsx handle routing
                router.replace('/');
            } else {
                // Email confirmation required
                Alert.alert(
                    'Check your email',
                    'We sent a confirmation link to ' + email + '. Click it to activate your account, then sign in.',
                    [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
                );
            }
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [email, password, name, username]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Logo size={60} animated={false} />
                    <Text variant="2xl" weight="bold" style={styles.title}>
                        Create Account
                    </Text>
                    <Text variant="base" color="secondary" style={styles.subtitle}>
                        Join the Three elite network
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Name"
                        placeholder="Bruce Wayne"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <View style={styles.spacer} />
                    <Input
                        label="Username"
                        placeholder="brucewayne"
                        value={username}
                        onChangeText={(text) => setUsername(text.toLowerCase())}
                        autoCapitalize="none"
                    />
                    <View style={styles.spacer} />
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
                        autoComplete="new-password"
                    />

                    <View style={styles.divider} />

                    <Button
                        title="Sign Up"
                        onPress={handleSignup}
                        loading={loading}
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text variant="sm" color="secondary">
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text variant="sm" weight="bold" color="primary">
                                Sign In
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
