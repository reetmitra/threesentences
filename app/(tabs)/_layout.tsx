/**
 * ThreeSixtyThree™ Three Sentences - Tab Layout
 * 
 * Three tabs: Today, History, Settings
 */

import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colors } from '@/theme/colors';
import { PenTool, Calendar, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

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
          height: 60,
        },
        tabBarActiveTintColor: activeColors.accent,
        tabBarInactiveTintColor: activeColors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <PenTool color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Today tab - write your daily entry',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'History tab - view past entries',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Settings tab - export data and preferences',
        }}
      />
    </Tabs>
  );
}
