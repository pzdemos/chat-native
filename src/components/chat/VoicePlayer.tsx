import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { normalizeImageUrl } from '../../services/api';

interface VoicePlayerProps {
  uri: string;
  duration: number;
  isMe: boolean;
}

// H5 版本匹配的颜色
const colors = {
  primary: '#22c55e',
  slate50: '#f8fafc',
  slate400: '#94a3b8',
  slate800: '#1e293b',
  green50: '#f0fdf4',
  white: '#ffffff',
};

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ uri, duration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // 6条波形动画
  const waveAnimations = useRef(
    [0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds)}"`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        stopWaveAnimation();
      }
    } else {
      try {
        setIsLoading(true);

        const normalizedUri = normalizeImageUrl(uri);

        if (!sound) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: normalizedUri },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
        } else {
          await sound.playAsync();
        }

        setIsPlaying(true);
        setIsLoading(false);
        startWaveAnimation();
      } catch (error) {
        console.error('播放语音失败:', error);
        setIsLoading(false);
      }
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis / 1000);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        stopWaveAnimation();
        sound?.setPositionAsync(0);
      }
    }
  };

  const startWaveAnimation = () => {
    const animations = waveAnimations.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      )
    );

    // 错开动画时间
    animations.forEach((anim, i) => {
      setTimeout(() => anim.start(), i * 50);
    });
  };

  const stopWaveAnimation = () => {
    waveAnimations.forEach((anim) => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });
  };

  // 波形显示
  const renderWaves = () => {
    return [0, 1, 2, 3, 4, 5].map((i) => (
      <Animated.View
        key={i}
        style={[
          styles.wave,
          {
            backgroundColor: isMe ? 'rgba(255, 255, 255, 0.8)' : colors.primary,
            transform: [
              {
                scaleY: isPlaying
                  ? waveAnimations[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    })
                  : 0.3,
              },
            ],
          },
        ]}
      />
    ));
  };

  return (
    <TouchableOpacity
      style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}
      onPress={handlePlayPause}
      activeOpacity={0.7}
    >
      {/* 播放按钮 - 匹配 H5 样式 */}
      <View style={[styles.playButton, isMe ? styles.playButtonMe : styles.playButtonOther]}>
        {isLoading ? (
          <Ionicons name="reload" size={12} color={isMe ? colors.white : colors.primary} />
        ) : isPlaying ? (
          <Ionicons name="pause" size={12} color={isMe ? colors.white : colors.primary} />
        ) : (
          <View style={styles.playIconWrapper}>
            <Ionicons name="play" size={10} color={isMe ? colors.white : colors.primary} />
          </View>
        )}
      </View>

      {/* 波形 */}
      <View style={styles.wavesContainer}>{renderWaves()}</View>

      {/* 时长 */}
      <Text style={[styles.duration, isMe && styles.durationMe]}>
        {formatTime(isPlaying ? playbackPosition : duration)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  containerMe: {
    // 发送方：透明背景，文字白色
  },
  containerOther: {
    // 接收方：透明背景
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playButtonMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButtonOther: {
    backgroundColor: colors.slate50,
  },
  playIconWrapper: {
    marginLeft: 2,
  },
  wavesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 16,
    marginRight: 2,
  },
  wave: {
    width: 3,
    height: 16,
    borderRadius: 2,
    marginRight: 2,
  },
  duration: {
    fontSize: 10,
    color: colors.slate400,
    fontWeight: '500',
    marginLeft: 12,
  },
  durationMe: {
    color: colors.green50,
  },
});
