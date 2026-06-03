import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: typeof lightColors;
}

const lightColors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#8b5cf6',

  background: '#f8fafc',
  card: '#ffffff',

  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',

  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  white: '#ffffff',
  black: '#000000',

  // Chat specific
  bubbleMe: '#3b82f6',
  bubbleOther: '#ffffff',
  bubbleTextMe: '#ffffff',
  bubbleTextOther: '#1e293b',

  offline: '#94a3b8',
  online: '#22c55e',
};

const darkColors = {
  primary: '#60a5fa',
  primaryDark: '#3b82f6',
  secondary: '#a78bfa',

  background: '#0f172a',
  card: '#1e293b',

  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textLight: '#64748b',

  border: '#334155',
  borderLight: '#1e293b',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  white: '#ffffff',
  black: '#000000',

  // Chat specific
  bubbleMe: '#3b82f6',
  bubbleOther: '#1e293b',
  bubbleTextMe: '#ffffff',
  bubbleTextOther: '#f1f5f9',

  offline: '#64748b',
  online: '#22c55e',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      } else if (systemTheme) {
        setTheme(systemTheme);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('加载主题设置失败:', error);
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) {
    return null; // 或者显示加载屏幕
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
