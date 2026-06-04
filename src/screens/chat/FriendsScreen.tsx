import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Friend, FriendRequest } from '../../types';
import { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export const FriendsScreen: React.FC = () => {
  const { friends, loadFriends, setActiveChat } = useChat();
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackScreenProps<RootStackParamList, 'Chat'>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getFriendRequests(user?.userId || '');
      setRequests(data.filter((r: FriendRequest) => r.status === 'pending'));
    } catch (error) {
      console.error('加载好友请求失败:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await api.searchUsers(searchQuery);
      // 过滤掉自己和已是好友的用户
      const filtered = results.filter(
        (u) =>
          u.userId !== user?.userId &&
          !friends.some((f) => f.userId === u.userId)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('搜索用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (toUserId: string, toUsername: string) => {
    try {
      await api.sendFriendRequest(user?.userId || '', toUserId);
      Alert.alert('成功', `已向 ${toUsername} 发送好友请求`);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      Alert.alert('失败', error.message || '发送请求失败');
    }
  };

  const handleRespondRequest = async (requestId: string, accept: boolean) => {
    try {
      const action = accept ? 'accept' : 'reject';
      await api.respondToRequest(requestId, action);
      await loadRequests();
      await loadFriends();
      Alert.alert('成功', accept ? '已添加好友' : '已拒绝请求');
    } catch (error: any) {
      Alert.alert('失败', error.message || '操作失败');
    }
  };

  const renderFriend = useCallback(({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        style={[styles.friendItem, { borderBottomColor: colors.borderLight }]}
        onPress={() => {
          setActiveChat(item);
          navigation.navigate('Chat', { friend: item });
        }}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.friendName, { color: colors.text }]}>{item.username}</Text>
      </TouchableOpacity>
    );
  }, [navigation, setActiveChat, colors]);

  const renderSearchResult = useCallback(({ item }: { item: Friend }) => {
    return (
      <View style={[styles.searchItem, { borderBottomColor: colors.borderLight }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.searchInfo}>
          <Text style={[styles.searchName, { color: colors.text }]}>{item.username}</Text>
          <Text style={[styles.searchId, { color: colors.textLight }]}>ID: {item.userId}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.borderLight }]}
          onPress={() => handleSendRequest(item.userId, item.username)}
        >
          <Ionicons name="person-add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }, [colors, handleSendRequest]);

  const renderRequest = useCallback(({ item }: { item: FriendRequest }) => {
    return (
      <View style={[styles.requestItem, { borderBottomColor: colors.borderLight }]}>
        <View style={styles.requestLeft}>
          <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarTextSmall}>
              {item.fromUsername.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.requestName, { color: colors.text }]}>{item.fromUsername}</Text>
            <Text style={[styles.requestText, { color: colors.textSecondary }]}>请求添加你为好友</Text>
          </View>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={() => handleRespondRequest(item._id, true)}
          >
            <Text style={styles.acceptButtonText}>接受</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: colors.borderLight }]}
            onPress={() => handleRespondRequest(item._id, false)}
          >
            <Text style={[styles.rejectButtonText, { color: colors.textSecondary }]}>拒绝</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, handleRespondRequest]);

  return (
    <View style={[styles.container, { backgroundColor: colors.borderLight }]}>
      {/* 好友请求列表 */}
      {requests.length > 0 && (
        <View style={[styles.requestsSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            好友请求 ({requests.length})
          </Text>
          <FlatList
            data={requests}
            renderItem={renderRequest}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* 好友列表 */}
      <View style={[styles.friendsSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>我的好友 ({friends.length})</Text>
        {friends.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>暂无好友</Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.userId}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* 添加好友按钮 */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 搜索用户弹窗 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>添加好友</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.borderLight, color: colors.text }]}
                placeholder="搜索用户名或 ID"
                placeholderTextColor={colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={[styles.searchButton, { backgroundColor: colors.primary }]}
                onPress={handleSearch}
              >
                {loading ? (
                  <Text style={styles.searchButtonText}>...</Text>
                ) : (
                  <Ionicons name="search" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.userId}
              style={styles.searchResults}
              ListEmptyComponent={
                searchQuery.length > 0 ? (
                  <Text style={[styles.noResults, { color: colors.textLight }]}>无搜索结果</Text>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  requestsSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f1f5f9',
  },
  friendsSection: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    padding: 16,
    paddingBottom: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3AA882',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3AA882',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextSmall: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  friendName: {
    fontSize: 16,
    color: '#1e293b',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  requestText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#3AA882',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3AA882',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3AA882',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
  },
  searchResults: {
    flex: 1,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchId: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
});
