import { View, StyleSheet, Easing } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { Calendar, Settings } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
});
