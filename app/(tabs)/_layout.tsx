/**
 * ThreeSixtyThree™ Three Sentences - Tab Layout
 * 
 * Four tabs: Today, History, Reflect (AI), Settings
 * Dark-only UI with white accents.
 */

import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { PenTool, Calendar, Settings, Sparkles } from 'lucide-react-native';

export default function TabLayout() {
  const activeColors = colors.dark;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: activeColors.surface,
          borderTopColor: activeColors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: activeColors.accent,
        tabBarInactiveTintColor: activeColors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <PenTool color={color} size={size - 2} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Today tab - write your daily entry',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size - 2} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'History tab - view past entries',
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ color, size }) => (
            <Sparkles color={color} size={size - 2} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Reflect tab - AI-powered insights',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size - 2} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Settings tab - export data and preferences',
        }}
      />
    </Tabs>
  );
}
