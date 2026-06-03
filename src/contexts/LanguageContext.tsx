import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.joinUs': 'Join Us',
    'auth.enterCredentials': 'Enter your credentials to continue',
    'auth.createAccount': 'Create an account to get started',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.createAccountBtn': 'Create Account',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': "Already have an account?",
    'auth.loginSuccess': 'Login successful',
    'auth.regSuccess': 'Registration successful! Please login.',
    'auth.passMismatch': 'Passwords do not match',
    'auth.enterId': 'Enter User ID',
    'auth.enterUsername': 'Enter Username',
    'auth.loginPlaceholder': 'User ID',
    'auth.registerPlaceholder': 'Username',

    // Sidebar & Navigation
    'nav.chats': 'Chats',
    'nav.friends': 'Friends',
    'nav.profile': 'Profile',
    'sidebar.myStatus': 'My Status',
    'sidebar.searchPlaceholder': 'Search chats...',
    'sidebar.noFriends': 'No friends yet',
    'sidebar.addSomeone': 'Add someone',
    'sidebar.startConversation': 'Start conversation',

    // Chat Area
    'chat.welcomeTitle': 'Welcome to Chat',
    'chat.welcomeDesc': 'Select a friend to start messaging.',
    'chat.typing': 'typing...',
    'chat.loadingHistory': 'Loading history...',
    'chat.typeMessage': 'Type a message...',
    'chat.holdRecord': 'Hold to Record',
    'chat.recording': 'Recording...',
    'chat.recalled': 'Message recalled',
    'chat.youRecalled': 'You recalled a message',
    'chat.imageNotFound': 'Image not available',

    // Modals & Profile
    'modal.addFriend': 'Add New Friend',
    'modal.friendRequests': 'Friend Requests',
    'modal.myProfile': 'My Profile',
    'modal.results': 'Results',
    'modal.noResults': 'No users found.',
    'modal.noRequests': 'No pending requests',
    'modal.wantsFriend': 'Wants to be friends',
    'modal.online': 'Online',
    'modal.offline': 'Offline',
    'modal.darkMode': 'Dark Mode',
    'modal.lightMode': 'Light Mode',
    'modal.language': 'Language',
    'modal.languageSettings': 'Language Settings',
    'modal.userId': 'User ID',
    'modal.logout': 'Log Out',
    'modal.avatarUpdated': 'Avatar updated successfully',
    'modal.logoutConfirm': 'Are you sure you want to logout?',
    'modal.confirm': 'Confirm',
    'modal.cancel': 'Cancel',

    // Actions
    'action.add': 'Add',
    'action.sent': 'Request sent successfully',
    'action.accepted': 'Friend added!',
    'action.recall': 'Recall',
    'action.delete': 'Delete',
    'action.deleted': 'Message deleted',
    'action.deleteFailed': 'Failed to delete message',
    'action.failed': 'Action failed',
    'action.send': 'Send',
    'action.cancel': 'Cancel',
    'action.reject': 'Reject',
    'action.accept': 'Accept',
    'action.save': 'Save',
    'action.search': 'Search',
    'action.photo': 'Photo',
    'action.camera': 'Camera',

    // Friends
    'friends.myFriends': 'My Friends',
    'friends.noFriends': 'No friends yet',
    'friends.addFriend': 'Add Friend',
    'friends.sendRequest': 'Send Request',
    'friends.searchUser': 'Search User',
    'friends.searchPlaceholder': 'Search by username or ID',
    'friends.requestSent': 'Friend request sent',
    'friends.alreadyFriends': 'Already friends',

    // Messages
    'msg.you': 'You',
    'msg.today': 'Today',
    'msg.yesterday': 'Yesterday',
    'msg.image': '[Image]',
    'msg.voice': '[Voice]',
    'msg.system': 'System Message',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.ok': 'OK',
  },
  zh: {
    // Auth
    'auth.welcomeBack': '欢迎回来',
    'auth.joinUs': '加入我们',
    'auth.enterCredentials': '输入您的凭据以继续',
    'auth.createAccount': '创建一个新账户以开始',
    'auth.username': '用户名',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.createAccountBtn': '创建账户',
    'auth.noAccount': '还没有账户？',
    'auth.hasAccount': '已经有账户了？',
    'auth.loginSuccess': '登录成功',
    'auth.regSuccess': '注册成功！请登录。',
    'auth.passMismatch': '两次输入的密码不一致',
    'auth.enterId': '请输入用户 ID',
    'auth.enterUsername': '请输入用户名',
    'auth.loginPlaceholder': '用户 ID',
    'auth.registerPlaceholder': '用户名',

    // Sidebar & Navigation
    'nav.chats': '聊天',
    'nav.friends': '好友',
    'nav.profile': '我的',
    'sidebar.myStatus': '我的状态',
    'sidebar.searchPlaceholder': '搜索聊天...',
    'sidebar.noFriends': '暂无好友',
    'sidebar.addSomeone': '添加好友',
    'sidebar.startConversation': '开始对话',

    // Chat Area
    'chat.welcomeTitle': '欢迎使用聊天',
    'chat.welcomeDesc': '选择好友开始聊天',
    'chat.typing': '正在输入...',
    'chat.loadingHistory': '加载历史消息...',
    'chat.typeMessage': '输入消息...',
    'chat.holdRecord': '按住 录音',
    'chat.recording': '正在录音...',
    'chat.recalled': '撤回了一条消息',
    'chat.youRecalled': '你撤回了一条消息',
    'chat.imageNotFound': '图片不可用',

    // Modals & Profile
    'modal.addFriend': '添加新好友',
    'modal.friendRequests': '好友请求',
    'modal.myProfile': '个人资料',
    'modal.results': '搜索结果',
    'modal.noResults': '未找到用户',
    'modal.noRequests': '暂无好友请求',
    'modal.wantsFriend': '请求添加好友',
    'modal.online': '在线',
    'modal.offline': '离线',
    'modal.darkMode': '暗黑模式',
    'modal.lightMode': '明亮模式',
    'modal.language': '语言',
    'modal.languageSettings': '语言设置',
    'modal.userId': '用户 ID',
    'modal.logout': '退出登录',
    'modal.avatarUpdated': '头像更新成功',
    'modal.logoutConfirm': '确定要退出登录吗？',
    'modal.confirm': '确定',
    'modal.cancel': '取消',

    // Actions
    'action.add': '添加',
    'action.sent': '请求已发送',
    'action.accepted': '已添加好友！',
    'action.recall': '撤回',
    'action.delete': '删除',
    'action.deleted': '消息已删除',
    'action.deleteFailed': '删除消息失败',
    'action.failed': '操作失败',
    'action.send': '发送',
    'action.cancel': '取消',
    'action.reject': '拒绝',
    'action.accept': '接受',
    'action.save': '保存',
    'action.search': '搜索',
    'action.photo': '相册',
    'action.camera': '拍照',

    // Friends
    'friends.myFriends': '我的好友',
    'friends.noFriends': '暂无好友',
    'friends.addFriend': '添加好友',
    'friends.sendRequest': '发送请求',
    'friends.searchUser': '搜索用户',
    'friends.searchPlaceholder': '搜索用户名或 ID',
    'friends.requestSent': '好友请求已发送',
    'friends.alreadyFriends': '已经是好友',

    // Messages
    'msg.you': '你',
    'msg.today': '今天',
    'msg.yesterday': '昨天',
    'msg.image': '[图片]',
    'msg.voice': '[语音]',
    'msg.system': '系统消息',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.retry': '重试',
    'common.close': '关闭',
    'common.ok': '确定',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang === 'en' || savedLang === 'zh') {
        setLanguageState(savedLang);
      }
    } catch (error) {
      console.error('加载语言设置失败:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('app_language', lang);

      // Android 需要重启应用才能 RTL 生效，这里只做标记
      // iOS 支持 RTL 切换
    } catch (error) {
      console.error('保存语言设置失败:', error);
    }
  };

  const t = (key: string): string => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
