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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

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
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('权限', '需要麦克风权限才能录音');
        return;
      }

      setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
    }
  };

  const stopRecording = async () => {
    if (!recorderState.isRecording) return;

    setIsRecording(false);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      const finalStatus = await audioRecorder.getStatus();

      if (uri && finalStatus.durationMillis && finalStatus.durationMillis > 500) {
        await onVoiceSend(uri, Math.round(finalStatus.durationMillis / 1000));
      } else if (finalStatus.durationMillis && finalStatus.durationMillis <= 500) {
        console.warn('录音时间太短');
      }
    } catch (error) {
      console.error('停止录音失败:', error);
    }
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowActions(!showActions)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.textLight} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            !enterKeySends && styles.inputMultiline,
            { backgroundColor: colors.borderLight, color: colors.text }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
          placeholderTextColor={colors.textLight}
          multiline={!enterKeySends}
          returnKeyType={enterKeySends ? 'send' : 'default'}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={false}
          textAlignVertical={!enterKeySends ? 'top' : 'center'}
        />

        {value.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="send" size={18} color={colors.white} />
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
              color={isRecording ? colors.error : colors.textLight}
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
              style={[styles.actionsPanel, { backgroundColor: colors.card }]}
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
          <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.recordingText, { color: colors.white }]}>录音中...</Text>
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
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: colors.borderLight }]}>
        <Ionicons name={icon as any} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    height: 40,
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
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
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
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
  },
});
