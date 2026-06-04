import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import type { ChatScreenProps } from '../../navigation/MainNavigator';
import { socketService } from '../../services/socket';

export const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { friend } = route.params;
  const navigation = useNavigation();
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
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [bottomInset, setBottomInset] = useState(24);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isTyping = typingUsers.includes(friend.userId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{friend.username}</Text>
          {isTyping && (
            <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>正在输入...</Text>
          )}
        </View>
      ),
    });
  }, [navigation, friend.username, isTyping, colors]);

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
    markAsRead(friend.userId);
  }, [friend.userId]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const show = Keyboard.addListener('keyboardWillShow', e => {
        setBottomInset(e.endCoordinates.height);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
      });
      const hide = Keyboard.addListener('keyboardWillHide', () => setBottomInset(24));
      return () => { show.remove(); hide.remove(); };
    } else {
      // Android: keyboardDidShow 用于确保消息列表滚动到底部
      const show = Keyboard.addListener('keyboardDidShow', () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      });
      return () => show.remove();
    }
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim(), 'text');
      setInputText('');
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

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

  const content = (
    <>
      <View style={[styles.messagesWrapper, { backgroundColor: colors.borderLight }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id || item.timestamp}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={<View style={{ height: 8 }} />}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          style={styles.flatList}
        />
      </View>

      <View style={[{ backgroundColor: colors.card }, Platform.OS === 'ios' && { paddingBottom: bottomInset }]}>
        <ChatInput
          value={inputText}
          onChangeText={handleInputChange}
          onSend={handleSend}
          onImageSend={handleImageSend}
          onVoiceSend={handleVoiceSend}
          enterKeySends={enterKeySends}
        />
      </View>
    </>
  );

  if (Platform.OS === 'android') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesWrapper: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
});
