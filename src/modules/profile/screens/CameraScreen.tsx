import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, StatusBar,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { theme } from '@theme/index';
import { useImageSelection } from '../hooks/useImageSelection';
import { goBack } from '@/navigation/navigationRef';

// Move helper components and styles to the top or ensure they are properly hoisted
const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={goBack}>
      <Text style={styles.backIcon}>✕</Text>
    </TouchableOpacity>
  </View>
);

export const CameraScreen = () => {
  const {
    hasPermission,
    isCameraReady,
    cameraType,
    cameraRef,
    requestCameraPermission,
    onCameraReady,
    flipCamera,
    takePicture,
    pickFromGallery,
    capturedImage,
    handleConfirm,
    handleRetake,
    pictureSizes,
  } = useImageSelection();

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  // Still waiting on permission API response
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Header />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  // Permission denied
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Header />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Camera access denied</Text>
          <Text style={styles.errorSubText}>
            Please enable camera permissions in your device settings.
          </Text>
          <TouchableOpacity style={styles.galleryButtonCenter} onPress={pickFromGallery}>
            <Text style={styles.galleryText}>🖼️  Use Gallery Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Header />

      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        ) : (
          <>
            <CameraView
              style={styles.camera}
              facing={cameraType}
              ref={cameraRef}
              ratio="1:1"
              onCameraReady={onCameraReady}
              // ✅ only pass pictureSize once sizes are loaded
              {...(pictureSizes.length > 0 && { pictureSize: pictureSizes[0] })}
            />
            {!isCameraReady && (
              <View style={styles.cameraOverlay}>
                <Text style={styles.loadingText}>Initializing camera...</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.bottomControls}>
        {capturedImage ? (
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeControls}>
            <View style={styles.sideControlPlaceholder} />
            
            <TouchableOpacity
              style={[styles.captureButton, !isCameraReady && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={!isCameraReady}
            >
              <View style={styles.captureButtonOuter}>
                <View style={styles.captureButtonInner} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <View style={styles.flipButtonBg}>
                <Text style={styles.controlIcon}>🔄</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#fff' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  loadingText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  errorSubText: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  galleryButtonCenter: { padding: 20, alignItems: 'center' },
  galleryText: { color: '#fff', fontSize: 16 },
  cameraContainer: { flex: 1, position: 'relative', backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  capturedImage: { flex: 1, resizeMode: 'contain' },
  bottomControls: {
    height: 140, 
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#000',
  },
  activeControls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  sideControlPlaceholder: {
    width: 60,
  },
  captureButton: { justifyContent: 'center', alignItems: 'center' },
  captureButtonDisabled: { opacity: 0.5 },
  captureButtonOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 5, borderColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  captureButtonInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff' },
  flipButton: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  flipButtonBg: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  controlIcon: { fontSize: 22, color: '#fff' },
  previewControls: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 30, alignItems: 'center' },
  retakeButton: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, borderWidth: 1.5, borderColor: '#fff' },
  retakeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmButton: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, backgroundColor: theme.colors.primary },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});