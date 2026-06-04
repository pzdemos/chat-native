import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { ChatsScreen } from '../screens/chat/ChatsScreen';
import { FriendsScreen } from '../screens/chat/FriendsScreen';
import { SettingsScreen } from '../screens/chat/SettingsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { useTheme } from '../contexts/ThemeContext';
import { MainTabParamList, RootStackParamList, Friend } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab 导航器
const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 主导航器 (包含 Tab 和 Chat 页面)
export const MainNavigator: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          headerBackTitleVisible: false,
          title: (route.params?.friend as Friend)?.username || '聊天',
          headerStyle: Platform.OS === 'android'
            ? { backgroundColor: colors.background, height: 56 }
            : { backgroundColor: colors.background },
          headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.text },
          headerTintColor: colors.primary,
        })}
      />
    </Stack.Navigator>
  );
};

export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
