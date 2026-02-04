/**
 * ThreeSixtyThree™ Three Sentences - Chat Layout
 *
 * Stack navigator for chat screens.
 */

import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function ChatLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.dark.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
