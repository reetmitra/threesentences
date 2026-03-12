/**
 * ThreeSixtyThree™ Three Sentences - Tab Layout
 * 
 * Five tabs: Today, History, Social, Guide, Settings
 * Dark-only UI with white accents.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { PenTool, Calendar, Settings, BarChart3, Users } from 'lucide-react-native';

export default function TabLayout() {
  const activeColors = colors.dark;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: activeColors.background,
            borderTopWidth: 0,
            elevation: 0,
            paddingTop: 8,
            paddingBottom: 8,
            height: 64,
          },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#888888',
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => (
              <PenTool color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'Today tab - write your daily entry',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => (
              <Calendar color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'History tab - view past entries',
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: 'Social',
            tabBarIcon: ({ color }) => (
              <Users color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'Social tab - friends and chat',
          }}
        />
        <Tabs.Screen
          name="guide"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color }) => (
              <BarChart3 color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'Insights tab - streaks, prompts, and progress',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Settings color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'Settings tab - export data and preferences',
          }}
        />
        {/* Hidden screens - accessed via navigation */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            title: 'Profile',
          }}
        />
        <Tabs.Screen
          name="reflect"
          options={{
            href: null,
            title: 'Reflect',
          }}
        />
        <Tabs.Screen
          name="conversations"
          options={{
            href: null,
            title: 'Messages',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            href: null,
            title: 'Chat',
          }}
        />
      </Tabs>
      <View style={styles.brandingContainer} pointerEvents="none">
        <Text style={styles.brandingText}>by @363v1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  brandingContainer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  brandingText: {
    color: '#333333',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
  },
});

