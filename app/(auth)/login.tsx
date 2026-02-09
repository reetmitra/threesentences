/**
 * Three™ - Login Screen
 *
 * Sign in using Clerk authentication.
 * Supports email/password and OAuth (Apple, Google).
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
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// Warm up browser for OAuth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startSSOFlow } = useSSO();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);

    const handleLogin = useCallback(async () => {
        if (!isLoaded || !signIn) return;

        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);

            const signInAttempt = await signIn.create({
                identifier: email,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/');
            } else {
                // Handle additional steps if needed (e.g., 2FA)
                console.log('Sign in requires additional steps:', signInAttempt.status);
                Alert.alert('Sign In', 'Additional verification required');
            }
        } catch (error: any) {
            console.error('Sign in error:', error);
            Alert.alert(
                'Login Failed',
                error.errors?.[0]?.message || error.message || 'An error occurred'
            );
        } finally {
            setLoading(false);
        }
    }, [isLoaded, signIn, setActive, email, password]);

    const handleAppleSignIn = useCallback(async () => {
        if (!isLoaded) return;

        try {
            setAppleLoading(true);

            const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
                strategy: 'oauth_apple',
            });

            if (createdSessionId) {
                await ssoSetActive!({ session: createdSessionId });
                router.replace('/');
            }
        } catch (error: any) {
            console.error('Apple sign in error:', error);
            if (error.message !== 'Sign in was cancelled') {
                Alert.alert(
                    'Apple Sign In Failed',
                    error.errors?.[0]?.message || error.message || 'An error occurred'
                );
            }
        } finally {
            setAppleLoading(false);
        }
    }, [isLoaded, startSSOFlow]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Logo size={80} animated={true} />
                    <Text variant="2xl" weight="bold" style={styles.title}>
                        Welcome Back
                    </Text>
                    <Text variant="base" color="secondary" style={styles.subtitle}>
                        Sign in to continue your journey
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
                    />
                    <View style={styles.spacer} />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.forgotPassword}>
                        <TouchableOpacity>
                            <Text variant="sm" color="secondary">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={!isLoaded}
                        style={styles.button}
                    />

                    {Platform.OS === 'ios' && (
                        <>
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text variant="sm" color="secondary" style={styles.dividerText}>
                                    or
                                </Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                                cornerRadius={12}
                                style={styles.appleButton}
                                onPress={handleAppleSignIn}
                            />
                        </>
                    )}

                    <View style={styles.footer}>
                        <Text variant="sm" color="secondary">
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/signup')}>
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
    forgotPassword: {
        alignItems: 'flex-end',
        marginTop: spacing[3],
        marginBottom: spacing[6],
    },
    button: {
        marginTop: spacing[2],
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing[6],
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.dark.border,
    },
    dividerText: {
        marginHorizontal: spacing[4],
    },
    appleButton: {
        width: '100%',
        height: 50,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing[6],
    },
});
