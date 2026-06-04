import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_DOMAIN = __DEV__
  ? 'https://www.haoaiganfan.top'
  : 'https://www.haoaiganfan.top';

const SOCKET_DOMAIN = __DEV__
  ? 'www.haoaiganfan.top'
  : 'www.haoaiganfan.top';

export const API_BASE_URL = `${API_DOMAIN}/ms/`;
export const SOCKET_URL = `https://${SOCKET_DOMAIN}`;

// 存储键
const STORAGE_KEYS = {
  USER_ID: '@chat_user_id',
  USERNAME: '@chat_username',
  TOKEN: '@chat_token',
};

// 用户存储管理
export const storage = {
  async saveUser(userId: string, username: string, token?: string) {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_ID, userId],
        [STORAGE_KEYS.USERNAME, username],
        ...(token ? [[STORAGE_KEYS.TOKEN, token]] : []),
      ]);
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  },

  async getUser() {
    try {
      const [[, userId], [, username], [, token]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USERNAME,
        STORAGE_KEYS.TOKEN,
      ]);
      if (userId && username) {
        return { userId, username, token };
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  async clearUser() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USERNAME,
        STORAGE_KEYS.TOKEN,
      ]);
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  },
};

// API 请求封装
class API {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.userId) {
      headers['x-user-id'] = this.userId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('API 请求错误:', endpoint, error);
      throw error;
    }
  }

  // 认证相关
  async login(username: string, password: string): Promise<{ userId: string; username: string }> {
    return this.request('users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string): Promise<{ userId: string; username: string }> {
    return this.request('users/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // 好友相关
  async searchUsers(query: string): Promise<User[]> {
    return this.request(`friends/search?q=${encodeURIComponent(query)}`);
  }

  async sendFriendRequest(toUserId: string): Promise<FriendRequest> {
    return this.request('friends/request', {
      method: 'POST',
      body: JSON.stringify({ toUserId }),
    });
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    return this.request('friends/requests');
  }

  async respondToRequest(
    requestId: string,
    accept: boolean
  ): Promise<{ success: boolean }> {
    return this.request('friends/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, accept }),
    });
  }

  async getFriends(): Promise<Friend[]> {
    return this.request('friends');
  }

  async deleteFriend(friendUserId: string): Promise<{ success: boolean }> {
    return this.request('friends/delete', {
      method: 'POST',
      body: JSON.stringify({ friendUserId }),
    });
  }

  // 消息相关
  async getChatHistory(
    friendUserId: string,
    limit = 100,
    skip = 0
  ): Promise<{
    messages: Message[];
    hasMore: boolean;
    totalCount: number;
  }> {
    return this.request(
      `messages/history/${this.userId}/${friendUserId}?limit=${limit}&skip=${skip}`
    );
  }

  async markAsRead(friendUserId: string): Promise<{ success: boolean }> {
    return this.request('messages/mark-read', {
      method: 'POST',
      body: JSON.stringify({ userId: this.userId, friendUserId }),
    });
  }

  // 文件上传
  async uploadImage(uri: string, fileName: string): Promise<{
    imageUrl: string;
    webpUrl: string;
    fallbackUrl: string;
    thumbnailWebpUrl: string;
    thumbnailFallbackUrl: string;
  }> {
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: fileName || 'photo.jpg',
    } as any);

    const response = await fetch(`${API_BASE_URL}upload/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.userId ? { 'x-user-id': this.userId } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || '上传失败');
    }
    return data;
  }

  async uploadAudio(uri: string, duration: number): Promise<{
    voiceUrl: string;
    voiceSize: number;
  }> {
    const formData = new FormData();
    formData.append('audio', {
      uri: uri,
      type: 'audio/wav',
      name: 'voice.wav',
    } as any);
    formData.append('duration', duration.toString());

    const response = await fetch(`${API_BASE_URL}upload/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.userId ? { 'x-user-id': this.userId } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || '上传失败');
    }
    return data;
  }
}

export const api = new API();

// 类型导入
import { User, Friend, FriendRequest, Message } from '../types';
