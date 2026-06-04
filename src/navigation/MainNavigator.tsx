import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ChatsScreen } from '../screens/chat/ChatsScreen';
import { FriendsScreen } from '../screens/chat/FriendsScreen';
import { SettingsScreen } from '../screens/chat/SettingsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { MainTabParamList, RootStackParamList, Friend } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab 导航器
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 50,
          paddingBottom: 0,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: '聊天',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarLabel: '好友',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
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
          title: (route.params?.friend as Friend)?.username || '聊天',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerTintColor: '#22c55e',
        })}
      />
    </Stack.Navigator>
  );
};

export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
