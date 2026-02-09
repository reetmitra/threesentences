/**
 * Three™ - Clerk Token Cache
 * 
 * Secure token storage for Clerk using expo-secure-store.
 * This ensures authentication tokens persist securely across app restarts.
 */

import * as SecureStore from 'expo-secure-store';
import { TokenCache } from '@clerk/clerk-expo';

export const tokenCache: TokenCache = {
    async getToken(key: string) {
        try {
            const item = await SecureStore.getItemAsync(key);
            return item;
        } catch (error) {
            console.error('SecureStore get item error:', error);
            await SecureStore.deleteItemAsync(key);
            return null;
        }
    },
    async saveToken(key: string, value: string) {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error('SecureStore save item error:', error);
        }
    },
};
