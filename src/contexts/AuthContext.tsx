import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { storage, api } from '../services/api';
import { socketService } from '../services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  enterKeySends: boolean;
  setEnterKeySends: (value: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enterKeySends, setEnterKeySendsState] = useState(true);

  // 使用 useMemo 派生 userId
  const userId = useMemo(() => user?.userId || null, [user]);

  useEffect(() => {
    loadStoredUser();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem('enter_key_sends');
      if (savedSetting !== null) {
        setEnterKeySendsState(savedSetting === 'true');
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const setEnterKeySends = async (value: boolean) => {
    setEnterKeySendsState(value);
    try {
      await AsyncStorage.setItem('enter_key_sends', value.toString());
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await storage.getUser();
      if (storedUser) {
        setUser(storedUser);
        api.setUserId(storedUser.userId);
        await socketService.connect(storedUser.userId);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(username, password);
      const userData = { userId: response.userId, username: response.username };

      setUser(userData);
      api.setUserId(userData.userId);
      await storage.saveUser(userData.userId, userData.username);

      await socketService.connect(userData.userId);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(username, password);
      const userData = { userId: response.userId, username: response.username };

      setUser(userData);
      api.setUserId(userData.userId);
      await storage.saveUser(userData.userId, userData.username);

      await socketService.connect(userData.userId);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    socketService.disconnect();
    await storage.clearUser();
    setUser(null);
    api.setUserId('');
  };

  return (
    <AuthContext.Provider value={{ user, userId, isLoading, enterKeySends, setEnterKeySends, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
