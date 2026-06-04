import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
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

  // iOS 需要 top safe area，Android 不需要
  const safeEdges = Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right'];

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }} edges={safeEdges}>
        <AppNavigator />
      </SafeAreaView>
    </>
  );
};
