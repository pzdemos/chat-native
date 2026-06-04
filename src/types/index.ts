// 用户类型
export interface User {
  userId: string;
  username: string;
  avatar?: string;
  token?: string;
}

// 好友类型
export interface Friend {
  userId: string;
  username: string;
  avatar?: string;
  unreadCount?: number;
  lastMessage?: Message;
  online?: boolean;
}

// 好友请求类型
export interface FriendRequest {
  _id: string;
  fromUserId: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// 消息类型
export type MessageType = 'text' | 'image' | 'voice';

export interface Message {
  _id?: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  messageType: MessageType;
  imageUrl?: string;
  webpUrl?: string;
  fallbackUrl?: string;
  thumbnailUrl?: string;
  thumbnailWebpUrl?: string;
  thumbnailFallbackUrl?: string;
  voiceUrl?: string;
  blobUrl?: string;
  voiceDuration?: number;
  timestamp: string;
  status?: MessageStatus;
  isRead?: boolean;
  isRecalled?: boolean;
  deliveryStatus?: DeliveryStatus;
  deletedBy?: DeletedBy[];
}

export type MessageStatus = 'sending' | 'sent' | 'error';
export type DeliveryStatus = 'pending' | 'delivered' | 'read';

export interface DeletedBy {
  userId: string;
  deletedAt: string;
}

// 导航参数类型
export type RootStackParamList = {
  Loading: undefined;
  Auth: undefined;
  MainTabs: undefined;
  Chat: { friend: Friend };
};

export type MainTabParamList = {
  Chats: undefined;
  Friends: undefined;
  Settings: undefined;
};

import type { RouteProp, NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
export type ChatNavigationProp = NavigationProp<RootStackParamList, 'Chat'>;
export type MainTabsNavigationProp = NavigationProp<MainTabParamList>;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
