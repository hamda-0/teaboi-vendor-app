import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { theme } from '@theme/index';
import pixelPerfect from '@/utils/pixelPerfect';

interface ImagePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isVisible,
  onClose,
  onSelectCamera,
  onSelectGallery,
}) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content} pointerEvents="box-only">
          <Text style={styles.title}>Select Image</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={onSelectCamera}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📷</Text>
              </View>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={onSelectGallery}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Text style={styles.icon}>🖼️</Text>
              </View>
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    width: '100%',
    padding: pixelPerfect(24),
    borderTopLeftRadius: pixelPerfect(32),
    borderTopRightRadius: pixelPerfect(32),
    alignItems: 'center',
  },
  title: {
    ...theme.typography.subheader,
    fontSize: pixelPerfect(18),
    color: theme.colors.text.primary,
    marginBottom: pixelPerfect(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: pixelPerfect(24),
  },
  optionButton: {
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.4,
  },
  iconContainer: {
    width: pixelPerfect(64),
    height: pixelPerfect(64),
    borderRadius: pixelPerfect(32),
    backgroundColor: '#DEF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: pixelPerfect(12),
  },
  icon: {
    fontSize: pixelPerfect(30),
  },
  optionText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: pixelPerfect(16),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: pixelPerfect(8),
  },
  cancelText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: pixelPerfect(16),
  },
});

