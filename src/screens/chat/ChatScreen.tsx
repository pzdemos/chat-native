import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import type { ChatScreenProps } from '../../navigation/MainNavigator';
import { socketService } from '../../services/socket';

export const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { friend } = route.params;
  const {
    userId,
    messages,
    loadMessages,
    sendMessage,
    sendImage,
    sendVoice,
    recallMessage,
    deleteMessage,
    markAsRead,
    typingUsers,
  } = useChat();

  const { enterKeySends } = useAuth();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages(friend.userId);
  }, [friend.userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    // 进入聊天页面时标记消息为已读
    markAsRead(friend.userId);
  }, [friend.userId]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim(), 'text');
      setInputText('');
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    // 发送正在输入状态
    if (userId && text.length > 0) {
      socketService.emitTyping({ fromUserId: userId, toUserId: friend.userId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping({ fromUserId: userId, toUserId: friend.userId });
      }, 2000);
    } else if (userId && text.length === 0) {
      socketService.stopTyping({ fromUserId: userId, toUserId: friend.userId });
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleImageSend = async (uri: string) => {
    const fileName = `image_${Date.now()}.jpg`;
    await sendImage(uri, fileName);
  };

  const handleVoiceSend = async (uri: string, duration: number) => {
    await sendVoice(uri, duration);
  };

  const handleRecall = (messageId: string) => {
    Alert.alert('撤回消息', '确定要撤回这条消息吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => recallMessage(messageId, friend.userId),
      },
    ]);
  };

  const handleDelete = (messageId: string) => {
    Alert.alert('删除消息', '确定要删除这条消息吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => deleteMessage(messageId),
      },
    ]);
  };

  const isMe = useCallback((msg: Message) => {
    return msg.fromUserId === userId;
  }, [userId]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const amITheSender = isMe(item);
    return (
      <MessageBubble
        message={item}
        isMe={amITheSender}
        onRecall={handleRecall}
        onDelete={handleDelete}
      />
    );
  }, [isMe, handleRecall, handleDelete]);

  const renderTypingIndicator = () => {
    const isTyping = typingUsers.includes(friend.userId);
    if (!isTyping) return null;

    return (
      <View style={styles.typingIndicator}>
        <View style={styles.typingDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.typingText}>正在输入...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id || item.timestamp}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        style={styles.flatList}
      />

      <ChatInput
        value={inputText}
        onChangeText={handleInputChange}
        onSend={handleSend}
        onImageSend={handleImageSend}
        onVoiceSend={handleVoiceSend}
        enterKeySends={enterKeySends}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flatList: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
    marginRight: 4,
  },
  typingText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
