/**
 * ThreeSixtyThree™ Three Sentences - Tab Layout
 * 
 * Four tabs: Today, History, Reflect (AI), Settings
 * Dark-only UI with white accents.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { PenTool, Calendar, Settings, Sparkles, Compass } from 'lucide-react-native';

export default function TabLayout() {
  const activeColors = colors.dark;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: activeColors.background, // Match screen background for seamless flow
            borderTopWidth: 0, // Remove top border separator
            elevation: 0, // Remove shadow on Android
            paddingTop: 8,
            paddingBottom: 8,
            height: 64,
          },
          tabBarActiveTintColor: '#FFFFFF', // Pure White for active
          tabBarInactiveTintColor: '#888888', // Off-white/Gray for inactive
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
          name="guide"
          options={{
            title: 'Guide',
            tabBarIcon: ({ color }) => (
              <Compass color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'Guide tab - philosophy and motivation',
          }}
        />
        <Tabs.Screen
          name="reflect"
          options={{
            title: 'Reflect',
            tabBarIcon: ({ color }) => (
              <Sparkles color={color} size={24} strokeWidth={1.5} />
            ),
            tabBarAccessibilityLabel: 'Reflect tab - AI-powered insights',
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
    backgroundColor: '#000000', // Ensure background prevents white flashes
  },
  brandingContainer: {
    position: 'absolute',
    bottom: 64, // Just above the tab bar height (64)
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  brandingText: {
    color: '#333333', // Very dark gray for subtle visibility
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
