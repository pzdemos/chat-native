import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { AppNavigator } from './src/navigation/AuthNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <ChatProvider>
          <AppNavigator />
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
