import { useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraType, useCameraPermissions } from 'expo-camera';
import { useCameraStore } from '@/store/useCameraStore';
import { goBack } from '@/navigation/navigationRef';

export const useImageSelection = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [pictureSizes, setPictureSizes] = useState<string[]>([]);
  const cameraRef = useRef<any>(null);
  const { setCapturedImage, capturedImage } = useCameraStore();

  const requestCameraPermission = useCallback(async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result.granted;
  }, [permission, requestPermission]);

  const onCameraReady = useCallback(async () => {
    setIsCameraReady(true);
    if (cameraRef.current) {
      try {
        const sizes = await cameraRef.current.getAvailablePictureSizesAsync('1:1');
        if (sizes?.length) setPictureSizes(sizes);
      } catch (e) {
        console.warn('Failed to get picture sizes', e);
      }
    }
  }, []);

  const flipCamera = useCallback(() => {
    setIsCameraReady(false); // reset ready state while flipping
    setCameraType((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  }, [isCameraReady, setCapturedImage]);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need gallery permission to pick a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  }, [setCapturedImage]);

  const handleConfirm = useCallback(() => goBack(), []);
  const handleRetake = useCallback(() => {
    setIsCameraReady(false);
    setCapturedImage(null);
  }, [setCapturedImage]);

  return {
    // null = still loading, true/false = resolved
    hasPermission: permission === null ? null : permission.granted,
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
  };
};