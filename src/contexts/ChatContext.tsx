import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Friend, Message } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

interface ChatContextData {
  userId: string | null;
  friends: Friend[];
  messages: Message[];
  activeChat: Friend | null;
  isLoadingFriends: boolean;
  typingUsers: string[];
  loadFriends: () => Promise<void>;
  loadMessages: (friendUserId: string) => Promise<void>;
  sendMessage: (content: string, type: 'text') => void;
  sendImage: (uri: string, fileName: string) => Promise<void>;
  sendVoice: (uri: string, duration: number) => Promise<void>;
  recallMessage: (messageId: string, targetUserId: string) => void;
  deleteMessage: (messageId: string) => void;
  setActiveChat: (friend: Friend | null) => void;
  markAsRead: (friendUserId: string) => void;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Friend | null>(null);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    setupSocketListeners();
    return () => {
      socketService.off('receiveMessage');
      socketService.off('messageSent');
      socketService.off('messageRecalled');
      socketService.off('messageDeleted');
      socketService.off('messagesRead');
      socketService.off('messagesDelivered');
      socketService.off('userTyping');
      socketService.off('userStopTyping');
    };
  }, []);

  const setupSocketListeners = () => {
    // 接收消息
    socketService.on('receiveMessage', (data: Message) => {
      setMessages(prev => [...prev, { ...data, status: 'sent' }]);

      // 更新好友列表的最后消息
      setFriends(prev => prev.map(friend =>
        friend.userId === data.fromUserId || friend.userId === data.toUserId
          ? { ...friend, lastMessage: data }
          : friend
      ));
    });

    // 消息发送成功
    socketService.on('messageSent', (data: Message) => {
      setMessages(prev => prev.map(msg =>
        msg._id === 'temp' ? { ...data, status: 'sent' } : msg
      ));
    });

    // 消息撤回
    socketService.on('messageRecalled', (data: { messageId: string }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, isRecalled: true, content: '[消息已撤回]' }
          : msg
      ));
    });

    // 消息删除
    socketService.on('messageDeleted', (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // 消息已读
    socketService.on('messagesRead', (data: { byUserId: string }) => {
      setMessages(prev => prev.map(msg =>
        msg.toUserId === data.byUserId ? { ...msg, isRead: true, deliveryStatus: 'read' } : msg
      ));
    });

    // 消息送达
    socketService.on('messagesDelivered', (data: { messageIds: string[] }) => {
      setMessages(prev => prev.map(msg =>
        data.messageIds.includes(msg._id || '')
          ? { ...msg, deliveryStatus: 'delivered' }
          : msg
      ));
    });

    // 正在输入
    socketService.on('userTyping', (data: { fromUserId: string }) => {
      setTypingUsers(prev => [...prev, data.fromUserId]);
    });

    // 停止输入
    socketService.on('userStopTyping', (data: { fromUserId: string }) => {
      setTypingUsers(prev => prev.filter(id => id !== data.fromUserId));
    });
  };

  const loadFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const data = await api.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('加载好友列表失败:', error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const loadMessages = async (friendUserId: string) => {
    try {
      const { messages: msgs } = await api.getChatHistory(friendUserId);
      setMessages(msgs);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  const sendMessage = useCallback((content: string, type: 'text') => {
    if (!activeChat || !userId) return;

    const tempId = 'temp';
    const tempMessage: Message = {
      _id: tempId,
      fromUserId: userId,
      toUserId: activeChat.userId,
      content,
      messageType: type,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, tempMessage]);

    socketService.sendMessage({
      fromUserId: userId,
      toUserId: activeChat.userId,
      content,
      messageType: type,
    });
  }, [activeChat, userId]);

  const sendImage = async (uri: string, fileName: string) => {
    if (!activeChat || !userId) return;

    const tempId = 'temp';
    const tempMessage: Message = {
      _id: tempId,
      fromUserId: userId,
      toUserId: activeChat.userId,
      content: '[图片]',
      messageType: 'image',
      imageUrl: uri,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const result = await api.uploadImage(uri, fileName);

      socketService.sendMessage({
        fromUserId: userId,
        toUserId: activeChat.userId,
        messageType: 'image',
        imageUrl: result.imageUrl,
        webpUrl: result.webpUrl,
        fallbackUrl: result.fallbackUrl,
        thumbnailWebpUrl: result.thumbnailWebpUrl,
        thumbnailFallbackUrl: result.thumbnailFallbackUrl,
      });
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  const sendVoice = async (uri: string, duration: number) => {
    if (!activeChat || !userId) return;

    const tempId = 'temp';
    const tempMessage: Message = {
      _id: tempId,
      fromUserId: userId,
      toUserId: activeChat.userId,
      content: '[语音]',
      messageType: 'voice',
      voiceUrl: uri,
      voiceDuration: duration,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const result = await api.uploadAudio(uri, duration);

      socketService.sendMessage({
        fromUserId: userId,
        toUserId: activeChat.userId,
        messageType: 'voice',
        voiceUrl: result.voiceUrl,
        voiceDuration: duration,
        voiceSize: result.voiceSize,
      });
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  const recallMessage = (messageId: string, targetUserId: string) => {
    if (!userId) return;

    socketService.recallMessage({ messageId, userId, targetUserId });
  };

  const deleteMessage = (messageId: string) => {
    if (!userId) return;

    socketService.deleteMessage({ messageId, userId });
  };

  const markAsRead = (friendUserId: string) => {
    if (!userId) return;

    socketService.markAsRead({ userId, friendUserId });

    // 更新本地消息状态
    setMessages(prev => prev.map(msg =>
      msg.fromUserId === friendUserId ? { ...msg, isRead: true, deliveryStatus: 'read' } : msg
    ));

    // 清除未读数
    setFriends(prev => prev.map(friend =>
      friend.userId === friendUserId ? { ...friend, unreadCount: 0 } : friend
    ));
  };

  return (
    <ChatContext.Provider
      value={{
        userId,
        friends,
        messages,
        activeChat,
        isLoadingFriends,
        typingUsers,
        loadFriends,
        loadMessages,
        sendMessage,
        sendImage,
        sendVoice,
        recallMessage,
        deleteMessage,
        setActiveChat,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
