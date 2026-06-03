import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ visible, uri, onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  const handleClose = () => {
    setScale(1);
    setIsLoaded(false);
    onClose();
  };

  const handleDoubleTap = () => {
    setScale(scale === 1 ? 2 : 1);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* 关闭按钮 */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>

        {/* 图片 */}
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={1}
          onPress={handleDoubleTap}
        >
          <Image
            source={{ uri }}
            style={[
              styles.image,
              scale === 2 && styles.imageZoomed,
            ]}
            resizeMode={scale === 1 ? 'contain' : 'center'}
            onLoad={() => setIsLoaded(true)}
          />

          {!isLoaded && (
            <View style={styles.loading}>
              <Ionicons name="image-outline" size={48} color="#fff" />
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 提示 */}
        {isLoaded && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>双击放大/缩小</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  imageZoomed: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 0.9,
  },
  loading: {
    position: 'absolute',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
  },
});
