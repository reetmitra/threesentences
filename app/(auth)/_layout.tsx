import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.dark.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="login" options={{ animation: 'fade' }} />
            <Stack.Screen name="signup" options={{ animation: 'fade' }} />
            <Stack.Screen name="reset-password" options={{ animation: 'fade' }} />
            <Stack.Screen name="interests" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="profile-setup" options={{ animation: 'slide_from_right' }} />
        </Stack>
    );
}
