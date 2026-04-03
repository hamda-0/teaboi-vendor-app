import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { theme } from '@theme/index';
import { goBack, navigate } from '@/navigation/navigationRef';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CameraScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<any>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: false,
        });
        
        navigate('CompleteProfile', {
          capturedPhotoUri: photo.uri,
        });
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
              <Text style={styles.backText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.secondaryButton} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
  },
});
