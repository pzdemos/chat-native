import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '../../contexts/ThemeContext';
import { normalizeImageUrl } from '../../services/api';

interface VoicePlayerProps {
  uri: string;
  duration: number;
  isMe: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ uri, duration, isMe }) => {
  const { colors } = useTheme();
  const player = useAudioPlayer({ uri: normalizeImageUrl(uri) });
  const status = useAudioPlayerStatus(player);

  // 6条波形动画
  const waveAnimations = useRef(
    [0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0.3))
  ).current;

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds)}"`;
  };

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
      stopWaveAnimation();
    } else {
      player.play();
      startWaveAnimation();
    }
  };

  useEffect(() => {
    if (status.didJustFinish) {
      stopWaveAnimation();
    }
  }, [status.didJustFinish]);

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
                scaleY: status.playing
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
      <View style={[styles.playButton, isMe ? [styles.playButtonMe, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }] : [styles.playButtonOther, { backgroundColor: colors.borderLight }]]}>
        {status.isBuffering ? (
          <Ionicons name="reload" size={12} color={isMe ? colors.white : colors.primary} />
        ) : status.playing ? (
          <Ionicons name="pause" size={12} color={isMe ? colors.white : colors.primary} />
        ) : (
          <View style={styles.playIconWrapper}>
            <Ionicons name="play" size={10} color={isMe ? colors.white : colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.wavesContainer}>{renderWaves()}</View>

      <Text style={[styles.duration, { color: isMe ? colors.white : colors.textLight }, isMe && { color: colors.white }]}>
        {formatTime(status.playing ? status.currentTime : duration)}
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
  playButtonOther: {},
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
    fontWeight: '500',
    marginLeft: 12,
  },
  durationMe: {},
});
