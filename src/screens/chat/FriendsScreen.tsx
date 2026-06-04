import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Friend, FriendRequest, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const FriendsScreen: React.FC = () => {
  const { friends, loadFriends, setActiveChat } = useChat();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

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
            {(item.username || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.friendName, { color: colors.text }]}>{item.username || 'Unknown'}</Text>
      </TouchableOpacity>
    );
  }, [navigation, setActiveChat, colors]);

  const renderSearchResult = useCallback(({ item }: { item: Friend }) => {
    return (
      <View style={[styles.searchItem, { borderBottomColor: colors.borderLight }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {(item.username || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.searchInfo}>
          <Text style={[styles.searchName, { color: colors.text }]}>{item.username || 'Unknown'}</Text>
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
              {(item.fromUsername || '?').charAt(0).toUpperCase()}
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.borderLight }]} edges={Platform.OS === 'android' ? ['top'] : []}>
      {/* 顶部栏 */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>好友</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.addTopButton}
        >
          <Ionicons name="person-add-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
                  <Ionicons name="search" size={20} color={colors.white} />
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
    </SafeAreaView>
  );
};

type FriendsColors = {
  primary: string; text: string; textSecondary: string; textLight: string;
  card: string; border: string; borderLight: string; white: string;
};

const createStyles = (c: FriendsColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.borderLight,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  addTopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestsSection: {
    backgroundColor: c.card,
    borderBottomWidth: 8,
    borderBottomColor: c.borderLight,
  },
  friendsSection: {
    flex: 1,
    backgroundColor: c.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
    padding: 16,
    paddingBottom: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: c.white,
    fontSize: 18,
    fontWeight: '600',
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextSmall: {
    color: c.white,
    fontSize: 16,
    fontWeight: '600',
  },
  friendName: {
    fontSize: 16,
    color: c.text,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  requestText: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: c.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: c.white,
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: c.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: c.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: c.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: c.card,
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
    color: c.text,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: c.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: c.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: c.white,
  },
  searchResults: {
    flex: 1,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  searchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchName: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  searchId: {
    fontSize: 14,
    color: c.textLight,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: c.borderLight,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: c.textLight,
    marginTop: 40,
  },
});
