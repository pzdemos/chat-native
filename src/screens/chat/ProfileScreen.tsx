import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 用户信息卡片 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.userId}>ID: {user?.userId}</Text>
      </View>

      {/* 功能列表 */}
      <View style={styles.section}>
        <MenuItem
          icon="person-outline"
          title="个人资料"
          onPress={() => {}}
        />
        <MenuItem
          icon="notifications-outline"
          title="通知设置"
          onPress={() => {}}
        />
        <MenuItem
          icon="lock-closed-outline"
          title="隐私设置"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <MenuItem
          icon="help-circle-outline"
          title="帮助与反馈"
          onPress={() => {}}
        />
        <MenuItem
          icon="information-circle-outline"
          title="关于"
          onPress={() => {}}
        />
      </View>

      {/* 退出登录 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
};

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#64748b" />
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});
