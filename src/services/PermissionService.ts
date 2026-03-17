import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export class PermissionService {
  static async requestCameraPermission(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    if (status === 'denied') {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to take profile photos. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
    
    return false;
  }

  static async requestGalleryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    if (status === 'denied') {
      Alert.alert(
        'Permission Required',
        'Gallery access is needed to choose profile photos. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
    
    return false;
  }
}
