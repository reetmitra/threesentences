import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { signUp, signInWithApple, isAppleSignInAvailable } from '@/store/auth';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [appleAvailable, setAppleAvailable] = useState(false);

    useEffect(() => {
        isAppleSignInAvailable().then(setAppleAvailable);
    }, []);

    const handleSignup = async () => {
        if (!email || !password || !name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await signUp(email, password, name);
            setLoading(false);
            // Navigate to interest selection
            router.push({
                pathname: '/(auth)/interests',
                params: { name },
            });
        } catch (error) {
            setLoading(false);
            Alert.alert('Signup Failed', (error as Error).message);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await signInWithApple();
            router.replace('/');
        } catch (error) {
            const message = (error as Error).message;
            if (message !== 'Sign in was cancelled') {
                Alert.alert('Apple Sign In Failed', message);
            }
        }
    };

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
                        Join the 363 movement
                    </Text>
                </View>

                <View style={styles.form}>
                    {appleAvailable && (
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
                                <Text variant="sm" color="secondary" style={styles.dividerText}>or</Text>
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
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text variant="sm" color="secondary">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text variant="sm" weight="bold" color="primary">Sign In</Text>
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
