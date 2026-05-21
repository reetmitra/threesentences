import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { Edit3, Calendar, MessageCircle, Flame, Settings } from 'lucide-react-native';

const c = colors.dark;

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
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <Edit3 color={color} size={24} strokeWidth={1.5} />,
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
            tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} strokeWidth={1.5} />,
            tabBarAccessibilityLabel: 'The Circle — friends',
          }}
        />
        <Tabs.Screen
          name="guide"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color }) => <Flame color={color} size={24} strokeWidth={1.5} />,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
});
