import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { user, logout, enterKeySends, setEnterKeySends } = useAuth();
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(t('modal.logout'), t('modal.logoutConfirm'), [
      { text: t('action.cancel'), style: 'cancel' },
      {
        text: t('modal.confirm'),
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const styles = createStyles(colors);

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

      {/* 功能列表 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <MenuItem
          icon={isDark ? 'moon-outline' : 'sunny-outline'}
          title={isDark ? t('modal.darkMode') : t('modal.lightMode')}
          onPress={toggleTheme}
          colors={colors}
        />
        <MenuItem
          icon="language-outline"
          title={t('modal.language')}
          value={language === 'zh' ? '中文' : 'English'}
          onPress={() => setShowLanguageModal(true)}
          colors={colors}
          showArrow
        />
        <MenuItem
          icon="return-down-forward-outline"
          title={enterKeySends ? '回车发送' : '回车换行'}
          value={enterKeySends ? '发送' : '换行'}
          onPress={() => setEnterKeySends(!enterKeySends)}
          colors={colors}
          showArrow
        />
        <MenuItem
          icon="person-outline"
          title={t('modal.myProfile')}
          onPress={() => {}}
          colors={colors}
        />
        <MenuItem
          icon="notifications-outline"
          title={t('modal.notifications') || '通知设置'}
          onPress={() => {}}
          colors={colors}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <MenuItem
          icon="help-circle-outline"
          title={t('modal.help') || '帮助与反馈'}
          onPress={() => {}}
          colors={colors}
        />
        <MenuItem
          icon="information-circle-outline"
          title={t('modal.about') || '关于'}
          onPress={() => {}}
          colors={colors}
        />
      </View>

      {/* 退出登录 */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.card }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>{t('modal.logout')}</Text>
      </TouchableOpacity>

      {/* 语言选择弹窗 */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('modal.languageSettings')}
            </Text>
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
      </Modal>
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
      <Ionicons name={icon as any} size={24} color={colors.textSecondary} />
      <Text style={[menuItemStyles.menuTitle, { color: colors.text }]}>{title}</Text>
      {value && <Text style={[menuItemStyles.menuValue, { color: colors.textLight }]}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.border} />}
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    },
    userId: {
      fontSize: 14,
    },
    section: {
      marginBottom: 16,
    },
    logoutButton: {
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    logoutText: {
      fontSize: 16,
      color: colors.error,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
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

const menuItemStyles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
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
