import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { VoiceRecorder } from './VoiceRecorder';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImageSend: (uri: string) => Promise<void>;
  onVoiceSend: (uri: string, duration: number) => Promise<void>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onImageSend,
  onVoiceSend,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
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

      if (uri && status.durationMillis) {
        await onVoiceSend(uri, Math.round(status.durationMillis / 1000));
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
        >
          <Ionicons name="add-circle" size={28} color="#64748b" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
          placeholderTextColor="#94a3b8"
          multiline
        />

        {value.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons
              name="mic"
              size={24}
              color={isRecording ? '#ef4444' : '#64748b'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 功能面板 */}
      {showActions && (
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
            <View style={styles.actionsPanel}>
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
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* 录音指示器 */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>录音中...</Text>
        </View>
      )}
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
        <Ionicons name={icon as any} size={28} color="#3b82f6" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#1e293b',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#eff6ff',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
  },
});
