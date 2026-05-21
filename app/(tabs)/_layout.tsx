import { useEffect } from 'react';
import { View, StyleSheet, Easing } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing as ReanimatedEasing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { Calendar, Settings } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const c = colors.dark;

function OfflineBanner() {
  const isConnected = useNetworkStatus();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-8);
  const EASE_OUT = ReanimatedEasing.out(ReanimatedEasing.ease);

  useEffect(() => {
    const dur = reduced ? 0 : 200;
    if (!isConnected) {
      opacity.value = withTiming(1, { duration: dur, easing: EASE_OUT });
      translateY.value = withTiming(0, { duration: dur, easing: EASE_OUT });
    } else {
      opacity.value = withTiming(0, { duration: dur, easing: EASE_OUT });
      translateY.value = withTiming(-8, { duration: dur, easing: EASE_OUT });
    }
  }, [isConnected, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.offlineBanner, style]} pointerEvents="none">
      <Text family="monoMedium" variant="xs" uppercase style={{ color: '#F59E0B', letterSpacing: 1 }}>
        · Offline · drafts saved locally
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: c.background,
            borderTopWidth: 0,
            elevation: 0,
            paddingTop: 10,
            paddingBottom: 10,
            height: 64,
          },
          tabBarActiveTintColor: c.textBright,
          tabBarInactiveTintColor: c.textSecondary,
          tabBarShowLabel: false,
          // pt-screen-in: opacity 0→1, 280ms ease-out (spec §1.6)
          animation: 'fade',
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: 280,
              easing: Easing.out(Easing.ease),
            },
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <Icon name="edit" color={color} size={24} strokeWidth={1.5} />,
            tabBarAccessibilityLabel: 'Today — write your entry',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <Calendar color={color} size={24} strokeWidth={1.5} />,
            tabBarAccessibilityLabel: 'History — past entries',
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: 'The Circle',
            tabBarIcon: ({ color }) => <Icon name="chat" color={color} size={24} strokeWidth={1.5} />,
            tabBarAccessibilityLabel: 'The Circle — friends',
          }}
        />
        <Tabs.Screen
          name="guide"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color }) => <Icon name="flame" color={color} size={24} strokeWidth={1.5} />,
            tabBarAccessibilityLabel: 'Insights — streaks and progress',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings color={color} size={24} strokeWidth={1.5} />,
            tabBarAccessibilityLabel: 'Settings — preferences',
          }}
        />
        {/* Hidden screens */}
        <Tabs.Screen name="profile" options={{ href: null, title: 'Profile' }} />
        <Tabs.Screen name="reflect" options={{ href: null, title: 'Reflect' }} />
        <Tabs.Screen name="conversations" options={{ href: null, title: 'Messages' }} />
        <Tabs.Screen name="chat" options={{ href: null, title: 'Chat' }} />
      </Tabs>
      <OfflineBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,158,11,0.2)',
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 100,
  },
});
