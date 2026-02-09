/**
 * Three™ - Signup Screen
 *
 * Create account using Clerk authentication.
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
import { useSignUp, useSSO } from '@clerk/clerk-expo';
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

export default function SignupScreen() {
    const { signUp, setActive, isLoaded } = useSignUp();
    const { startSSOFlow } = useSSO();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    const handleSignup = useCallback(async () => {
        if (!isLoaded || !signUp) return;

        if (!email || !password || !name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);

            // Create the user
            await signUp.create({
                emailAddress: email,
                password,
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || undefined,
            });

            // Send email verification
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setPendingVerification(true);
        } catch (error: any) {
            console.error('Sign up error:', error);
            Alert.alert(
                'Signup Failed',
                error.errors?.[0]?.message || error.message || 'An error occurred'
            );
        } finally {
            setLoading(false);
        }
    }, [isLoaded, signUp, email, password, name]);

    const handleVerification = useCallback(async () => {
        if (!isLoaded || !signUp) return;

        try {
            setLoading(true);

            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                // Navigate to interest selection
                router.push({
                    pathname: '/(auth)/interests',
                    params: { name },
                });
            } else {
                console.log('Verification incomplete:', signUpAttempt.status);
                Alert.alert('Verification', 'Please check your verification code');
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            Alert.alert(
                'Verification Failed',
                error.errors?.[0]?.message || error.message || 'Invalid code'
            );
        } finally {
            setLoading(false);
        }
    }, [isLoaded, signUp, setActive, code, name]);

    const handleAppleSignIn = useCallback(async () => {
        if (!isLoaded) return;

        try {
            const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
                strategy: 'oauth_apple',
            });

            if (createdSessionId) {
                await ssoSetActive!({ session: createdSessionId });
                router.replace('/');
            }
        } catch (error: any) {
            console.error('Apple sign up error:', error);
            if (error.message !== 'Sign in was cancelled') {
                Alert.alert(
                    'Apple Sign In Failed',
                    error.errors?.[0]?.message || error.message || 'An error occurred'
                );
            }
        }
    }, [isLoaded, startSSOFlow]);

    // Verification code screen
    if (pendingVerification) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Logo size={60} animated={false} />
                        <Text variant="2xl" weight="bold" style={styles.title}>
                            Verify Email
                        </Text>
                        <Text variant="base" color="secondary" style={styles.subtitle}>
                            We sent a code to {email}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                            autoCapitalize="none"
                        />

                        <View style={styles.divider} />

                        <Button
                            title="Verify"
                            onPress={handleVerification}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => setPendingVerification(false)}>
                                <Text variant="sm" color="secondary">
                                    Go back
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    // Signup form
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
                    {Platform.OS === 'ios' && (
                        <>
                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                                cornerRadius={12}
                                style={styles.appleButton}
                                onPress={handleAppleSignIn}
                            />

                            <View style={styles.orDivider}>
                                <View style={styles.dividerLine} />
                                <Text variant="sm" color="secondary" style={styles.dividerText}>
                                    or
                                </Text>
                                <View style={styles.dividerLine} />
                            </View>
                        </>
                    )}

                    <Input
                        label="Name"
                        placeholder="Bruce Wayne"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <View style={styles.spacer} />
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

                    <View style={styles.divider} />

                    <Button
                        title="Sign Up"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={!isLoaded}
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
    orDivider: {
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
    button: {
        marginTop: spacing[2],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing[6],
    },
});
