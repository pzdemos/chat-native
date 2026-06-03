import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types';
import { ImageViewer } from './ImageViewer';
import { VoicePlayer } from './VoicePlayer';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onRecall: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onRecall,
  onDelete,
}) => {
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = () => {
    setShowMenu(true);
    // 触觉反馈
    if (Platform.OS === 'ios') {
      // iOS 震动反馈（如果支持）
    }
  };

  const handleRecall = () => {
    setShowMenu(false);
    Alert.alert('撤回消息', '确定要撤回这条消息吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '撤回',
        style: 'destructive',
        onPress: () => onRecall(message._id || ''),
      },
    ]);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete(message._id || '');
  };

  // 撤回的消息 - H5 风格：居中显示，小圆角边框
  if (message.isRecalled) {
    return (
      <View style={styles.recalledContainer}>
        <Text style={styles.recalledText}>
          {isMe ? '你撤回了一条消息' : '对方撤回了一条消息'}
        </Text>
      </View>
    );
  }

  const formatTime = () => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    switch (message.messageType) {
      case 'text':
        return (
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {message.content}
          </Text>
        );

      case 'image':
        return (
          <Pressable onPress={() => setImageViewerVisible(true)}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: message.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              {message.status === 'sending' && (
                <View style={styles.imageLoading}>
                  <Ionicons name="reload" size={24} color="#94a3b8" />
                </View>
              )}
            </View>
          </Pressable>
        );

      case 'voice':
        return (
          <VoicePlayer
            uri={message.voiceUrl || message.blobUrl || ''}
            duration={message.voiceDuration || 0}
            isMe={isMe}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
        {/* 长按菜单 */}
        {showMenu && (
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setShowMenu(false)}
          >
            <View style={[styles.contextMenu, isMe ? styles.menuRight : styles.menuLeft]}>
              {isMe && message.status === 'sent' && (
                <TouchableOpacity style={styles.menuItem} onPress={handleRecall}>
                  <Ionicons name="undo" size={16} color="#475569" />
                  <Text style={styles.menuItemText}>撤回</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text style={[styles.menuItemText, styles.menuItemTextDelete]}>删除</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        )}

        {/* 消息气泡 */}
        <Pressable
          style={styles.bubbleWrapper}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          <View
            style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
              message.messageType === 'image' && styles.bubbleImage,
              message.messageType === 'voice' && styles.bubbleVoice,
              message.status === 'sending' && styles.bubbleSending,
            ]}
          >
            {renderContent()}
          </View>

          {/* 时间戳 */}
          <View style={[styles.footer, isMe ? styles.footerMe : styles.footerOther]}>
            {message.status === 'sending' && isMe && (
              <Ionicons name="reload" size={10} color="#94a3b8" style={styles.statusIcon} />
            )}
            {message.status === 'error' && isMe && (
              <Ionicons name="alert-circle" size={10} color="#ef4444" style={styles.statusIcon} />
            )}
            <Text style={styles.time}>{formatTime()}</Text>
          </View>
        </Pressable>
      </View>

      {/* 图片预览 */}
      <ImageViewer
        visible={imageViewerVisible}
        uri={message.imageUrl || ''}
        onClose={() => setImageViewerVisible(false)}
      />
    </>
  );
};

// 与 H5 版本匹配的颜色和样式
const colors = {
  primary: '#3b82f6',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate800: '#1e293b',
  white: '#ffffff',
  red400: '#f87171',
  red500: '#ef4444',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  containerMe: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  // 接收方气泡：白色背景，左侧直角
  bubbleOther: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  // 发送方气泡：蓝色背景，右侧直角
  bubbleMe: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleImage: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  bubbleVoice: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  bubbleSending: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 15,
    color: colors.slate800,
    lineHeight: 21,
  },
  messageTextMe: {
    color: colors.white,
  },
  // 图片容器 - 匹配 H5 的 max-w-[240px]
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.slate50,
    minWidth: 150,
    minHeight: 150,
  },
  image: {
    width: 240,
    height: 240,
  },
  imageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 时间戳样式
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  footerMe: {
    justifyContent: 'flex-end',
  },
  footerOther: {
    justifyContent: 'flex-start',
  },
  statusIcon: {
    marginRight: 2,
  },
  time: {
    fontSize: 10,
    color: colors.slate400,
  },
  // 撤回消息样式 - 匹配 H5 的居中显示
  recalledContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  recalledText: {
    fontSize: 12,
    color: colors.slate400,
    backgroundColor: colors.slate100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  // 长按菜单样式
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 100,
    top: -40,
  },
  menuLeft: {
    left: 0,
  },
  menuRight: {
    right: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.slate800,
  },
  menuItemTextDelete: {
    color: colors.red400,
  },
});

import { Platform } from 'react-native';
