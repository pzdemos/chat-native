import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VoiceRecorderProps {
  onSend: (uri: string, duration: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cancel, setCancel] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: async () => {
        try {
          const permission = await Audio.requestPermissionsAsync();
          if (!permission.granted) {
            return;
          }

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          const { recording } = await Audio.Recording.createAsync(
            Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
          );

          recordingRef.current = recording;
          setIsRecording(true);
          setCancel(false);
          setRecordingTime(0);

          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        } catch (error) {
          console.error('录音失败:', error);
        }
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        translateX.setValue(dx);

        // 滑动超过 100px 视为取消
        if (dx < -100) {
          setCancel(true);
        } else {
          setCancel(false);
        }
      },

      onPanResponderRelease: async () => {
        translateX.setValue(0);

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        if (cancel) {
          // 取消录音
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            recordingRef.current = null;
          }
          setIsRecording(false);
          setRecordingTime(0);
        } else {
          // 完成录音
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            const status = await recordingRef.current.getStatus();

            if (uri && status.durationMillis) {
              onSend(uri, Math.round(status.durationMillis / 1000));
            }

            recordingRef.current = null;
          }
          setIsRecording(false);
          setRecordingTime(0);
        }
      },
    })
  ).current;

  return (
    <>
      {isRecording && (
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.recordingBox,
              { transform: [{ translateX }] },
              cancel && styles.recordingBoxCancel,
            ]}
          >
            {cancel ? (
              <>
                <Ionicons name="close-circle" size={48} color="#ef4444" />
                <Text style={styles.recordingText}>松开取消</Text>
              </>
            ) : (
              <>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.recordingHint}>松开发送，左滑取消</Text>
              </>
            )}
          </Animated.View>
        </View>
      )}

      <View
        {...panResponder.panHandlers}
        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
      >
        <Ionicons
          name="mic"
          size={24}
          color={isRecording ? '#fff' : '#64748b'}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  recordingBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: SCREEN_WIDTH * 0.7,
  },
  recordingBoxCancel: {
    backgroundColor: '#fef2f2',
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    marginBottom: 12,
  },
  recordingText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  recordingHint: {
    fontSize: 14,
    color: '#64748b',
  },
  recordButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#22c55e',
    borderRadius: 20,
  },
});
