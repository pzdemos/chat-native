import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RootStackParamList, Friend } from '../types';

type ChatNavProps = NativeStackNavigationProp<RootStackParamList>;

interface ChatNavigatorProps {
  friend: Friend;
}

export const ChatNavigator: React.FC<ChatNavigatorProps> = ({ friend }) => {
  const navigation = useNavigation<ChatNavProps>();

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3AA882" />
        </TouchableOpacity>
      ),
      headerTitle: friend.username,
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#3AA882" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, friend]);

  return null;
};

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
});
