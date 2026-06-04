import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AppNavigator } from './src/navigation/AuthNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ChatProvider>
              <AppNavigatorWithStatusBar />
            </ChatProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// 内部组件：使用主题状态设置 StatusBar
const AppNavigatorWithStatusBar = () => {
  const { isDark } = require('./src/contexts/ThemeContext').useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#ffffff' }} edges={['top', 'left', 'right']}>
        <AppNavigator />
      </SafeAreaView>
    </>
  );
};
