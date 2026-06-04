import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useChat } from '../../contexts/ChatContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Friend } from '../../types';

// 与 H5 版本匹配的颜色
const Colors = {
  primary: '#22c55e',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate400: '#94a3b8',
  slate700: '#64748b',
  slate800: '#1e293b',
  white: '#ffffff',
  red500: '#ef4444',
};

export const ChatsScreen: React.FC = () => {
  const { friends, isLoadingFriends, loadFriends, setActiveChat } = useChat();
  const navigation = useNavigation();

  useEffect(() => {
    loadFriends();
  }, []);

  const renderFriend = useCallback(({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => {
          setActiveChat(item);
          // @ts-ignore
          navigation.navigate('Chat', { friend: item });
        }}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.friendInfo}>
          <View style={styles.friendHeader}>
            <Text style={styles.friendName} numberOfLines={1}>
              {item.username}
            </Text>
            {item.lastMessage && (
              <Text style={styles.messageTime}>
                {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>

          <View style={styles.friendFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.isRecalled
                ? '[消息已撤回]'
                : item.lastMessage?.content || '暂无消息'}
            </Text>

            {item.unreadCount && item.unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, setActiveChat]);

  return (
    <View style={styles.container}>
      {friends.length === 0 && !isLoadingFriends ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.slate100} />
          <Text style={styles.emptyText}>暂无聊天</Text>
          <Text style={styles.emptySubtext}>添加好友开始聊天吧</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.userId}
          refreshing={isLoadingFriends}
          onRefresh={loadFriends}
          contentContainerStyle={friends.length === 0 ? styles.emptyList : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.slate50,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.slate100,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.slate800,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.slate400,
    marginLeft: 8,
  },
  friendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.slate700,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.red500,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.slate700,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.slate400,
    marginTop: 8,
  },
});
