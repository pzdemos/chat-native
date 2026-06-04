import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Text,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

// 与 H5 版本匹配的颜色
const Colors = {
  primary: '#22c55e',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate400: '#94a3b8',
  slate800: '#1e293b',
  white: '#ffffff',
  red500: '#ef4444',
};

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImageSend: (uri: string) => Promise<void>;
  onVoiceSend: (uri: string, duration: number) => Promise<void>;
  enterKeySends?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onImageSend,
  onVoiceSend,
  enterKeySends = true,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  const handleSubmitEditing = () => {
    if (value.trim()) {
      onSend();
    }
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('权限', '需要相册权限才能选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await onImageSend(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('权限', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await onImageSend(result.assets[0].uri);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('权限', '需要麦克风权限才能录音');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();

      // 至少 0.5 秒才发送
      if (uri && status.durationMillis && status.durationMillis > 500) {
        await onVoiceSend(uri, Math.round(status.durationMillis / 1000));
      } else if (status.durationMillis && status.durationMillis <= 500) {
        console.warn('录音时间太短');
      }

      setRecording(null);
    } catch (error) {
      console.error('停止录音失败:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowActions(!showActions)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add-circle-outline" size={28} color={Colors.slate400} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            !enterKeySends && styles.inputMultiline
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
          placeholderTextColor={Colors.slate400}
          multiline={!enterKeySends}
          returnKeyType={enterKeySends ? 'send' : 'default'}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={false}
          textAlignVertical={!enterKeySends ? 'top' : 'center'}
        />

        {value.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="mic-outline"
              size={22}
              color={isRecording ? Colors.red500 : Colors.slate400}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 功能面板 */}
      {showActions ? (
        <Modal
          visible={showActions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowActions(false)}
        >
          <TouchableOpacity
            style={styles.actionsOverlay}
            activeOpacity={1}
            onPress={() => setShowActions(false)}
          >
            <TouchableOpacity
              style={styles.actionsPanel}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <ActionItem
                icon="image-outline"
                label="图片"
                onPress={handlePickImage}
              />
              <ActionItem
                icon="camera-outline"
                label="拍照"
                onPress={handleTakePhoto}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : null}

      {/* 录音指示器 */}
      {isRecording ? (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>录音中...</Text>
        </View>
      ) : null}
    </>
  );
};

interface ActionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon as any} size={28} color={Colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate100,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.slate50,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    height: 40,
    color: Colors.slate800,
    marginRight: 12,
  },
  inputMultiline: {
    minHeight: 40,
    maxHeight: 100,
    height: 'auto',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionsPanel: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    backgroundColor: Colors.slate50,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: Colors.slate800,
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red500,
    marginRight: 8,
  },
  recordingText: {
    color: Colors.white,
    fontSize: 14,
  },
});
