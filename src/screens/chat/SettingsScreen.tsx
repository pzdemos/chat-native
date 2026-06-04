import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen: React.FC = () => {
  const { user, logout, enterKeySends, setEnterKeySends } = useAuth();
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* 用户信息卡片 */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>{user?.username}</Text>
        <Text style={[styles.userId, { color: colors.textSecondary }]}>
          ID: {user?.userId}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 聊天设置 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>聊天设置</Text>
          <MenuItem
            icon="return-down-forward-outline"
            title="回车键行为"
            value={enterKeySends ? '发送消息' : '换行'}
            onPress={() => setEnterKeySends(!enterKeySends)}
            colors={colors}
            showArrow
          />
        </View>

        {/* 通用设置 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>通用</Text>
          <MenuItem
            icon={isDark ? 'moon-outline' : 'sunny-outline'}
            title={isDark ? '暗黑模式' : '明亮模式'}
            onPress={toggleTheme}
            colors={colors}
          />
          <MenuItem
            icon="language-outline"
            title="语言"
            value={language === 'zh' ? '中文' : 'English'}
            onPress={() => setShowLanguageModal(true)}
            colors={colors}
            showArrow
          />
        </View>

        {/* 关于 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>关于</Text>
          <MenuItem
            icon="information-circle-outline"
            title="版本"
            value="1.0.0"
            onPress={() => {}}
            colors={colors}
          />
        </View>

        {/* 退出登录 */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 语言选择弹窗 */}
      {showLanguageModal ? (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>选择语言</Text>
              <LanguageOption
                title="中文"
                selected={language === 'zh'}
                onPress={() => {
                  setLanguage('zh');
                  setShowLanguageModal(false);
                }}
                colors={colors}
              />
              <LanguageOption
                title="English"
                selected={language === 'en'}
                onPress={() => {
                  setLanguage('en');
                  setShowLanguageModal(false);
                }}
                colors={colors}
              />
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  colors: any;
  value?: string;
  showArrow?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  colors,
  value,
  showArrow = true,
}) => {
  return (
    <TouchableOpacity
      style={[menuItemStyles.menuItem, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
    >
      <View style={menuItemStyles.menuItemLeft}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
        <Text style={[menuItemStyles.menuTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={menuItemStyles.menuItemRight}>
        {value && <Text style={[menuItemStyles.menuValue, { color: colors.textLight }]}>{value}</Text>}
        {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.border} />}
      </View>
    </TouchableOpacity>
  );
};

interface LanguageOptionProps {
  title: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}

const LanguageOption: React.FC<LanguageOptionProps> = ({ title, selected, onPress, colors }) => {
  return (
    <TouchableOpacity
      style={[languageOptionStyles.languageOption, selected && { backgroundColor: colors.primary }]}
      onPress={onPress}
    >
      <Text style={[languageOptionStyles.languageOptionText, selected && { color: '#fff' }, !selected && { color: colors.text }]}>
        {title}
      </Text>
      {selected && <Ionicons name="checkmark" size={20} color="#fff" />}
    </TouchableOpacity>
  );
};

const menuItemStyles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    marginRight: 8,
  },
});

const languageOptionStyles = StyleSheet.create({
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    marginBottom: 4,
    color: '#1e293b',
  },
  userId: {
    fontSize: 14,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: '#ffffff',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
});
