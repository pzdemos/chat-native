import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Friend } from '../../types';

export const ChatsScreen: React.FC = () => {
  const { friends, isLoadingFriends, loadFriends, setActiveChat } = useChat();
  const { colors } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    loadFriends();
  }, []);

  const renderFriend = useCallback(({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        style={[styles.friendItem, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}
        onPress={() => {
          setActiveChat(item);
          // @ts-ignore
          navigation.navigate('Chat', { friend: item });
        }}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.friendInfo}>
          <View style={styles.friendHeader}>
            <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>
              {item.username}
            </Text>
            {item.lastMessage && (
              <Text style={[styles.messageTime, { color: colors.textLight }]}>
                {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>

          <View style={styles.friendFooter}>
            <Text style={[styles.lastMessage, { color: colors.text }]} numberOfLines={1}>
              {item.lastMessage?.isRecalled
                ? '[消息已撤回]'
                : item.lastMessage?.content || '暂无消息'}
            </Text>

            {item.unreadCount && item.unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, setActiveChat, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.borderLight }]}>
      {friends.length === 0 && !isLoadingFriends ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
          <Text style={[styles.emptyText, { color: colors.text }]}>暂无聊天</Text>
          <Text style={[styles.emptySubtext, { color: colors.textLight }]}>添加好友开始聊天吧</Text>
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
  },
  friendItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
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
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  friendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
