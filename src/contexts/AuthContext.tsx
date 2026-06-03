import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { storage, api } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextData {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  login: (userId?: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 使用 useMemo 派生 userId
  const userId = useMemo(() => user?.userId || null, [user]);

  useEffect(() => {
    loadStoredUser();
  }, []);

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

  const login = async (userId?: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(userId || '');
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

  const register = async (username: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(username);
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
    <AuthContext.Provider value={{ user, userId, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
