import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    signInWithCredential,
    OAuthProvider,
    User as FirebaseUser,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { auth, isConfigured } from '@/config/firebase';
import { Platform } from 'react-native';

export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthSession {
    user: User;
}

/**
 * Convert Firebase user to app User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || undefined,
    };
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
}

/**
 * Check for existing session
 */
export async function getSession(): Promise<AuthSession | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            unsubscribe();
            if (firebaseUser) {
                resolve({ user: mapFirebaseUser(firebaseUser) });
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
        callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
}

/**
 * Sign In with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthSession> {
    if (!isConfigured) {
        throw new Error('Firebase is not configured. Please update config/firebase.ts');
    }

    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return { user: mapFirebaseUser(credential.user) };
    } catch (error: any) {
        const errorMessages: Record<string, string> = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid email or password',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        };
        throw new Error(errorMessages[error.code] || error.message);
    }
}

/**
 * Sign Up with email and password
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthSession> {
    if (!isConfigured) {
        throw new Error('Firebase is not configured. Please update config/firebase.ts');
    }

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        if (name) {
            await updateProfile(credential.user, { displayName: name });
        }

        return { user: mapFirebaseUser(credential.user) };
    } catch (error: any) {
        const errorMessages: Record<string, string> = {
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled',
            'auth/weak-password': 'Password is too weak. Use at least 6 characters',
        };
        throw new Error(errorMessages[error.code] || error.message);
    }
}

/**
 * Sign in with Apple (iOS only)
 */
export async function signInWithApple(): Promise<AuthSession> {
    if (!isConfigured) {
        throw new Error('Firebase is not configured. Please update config/firebase.ts');
    }

    if (Platform.OS !== 'ios') {
        throw new Error('Sign in with Apple is only available on iOS');
    }

    try {
        // Generate a secure nonce
        const nonce = Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            nonce
        );

        // Request Apple authentication
        const appleCredential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
            nonce: hashedNonce,
        });

        const { identityToken, fullName } = appleCredential;

        if (!identityToken) {
            throw new Error('No identity token received from Apple');
        }

        // Create Firebase credential
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
            idToken: identityToken,
            rawNonce: nonce,
        });

        // Sign in with Firebase
        const result = await signInWithCredential(auth, credential);

        // Update display name if provided (Apple only provides name on first sign-in)
        if (fullName?.givenName && !result.user.displayName) {
            const displayName = [fullName.givenName, fullName.familyName]
                .filter(Boolean)
                .join(' ');
            await updateProfile(result.user, { displayName });
        }

        return { user: mapFirebaseUser(result.user) };
    } catch (error: any) {
        if (error.code === 'ERR_REQUEST_CANCELED') {
            throw new Error('Sign in was cancelled');
        }
        throw new Error(error.message || 'Failed to sign in with Apple');
    }
}

/**
 * Check if Apple Sign-In is available
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        return false;
    }
    return await AppleAuthentication.isAvailableAsync();
}

/**
 * Sign Out
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}
