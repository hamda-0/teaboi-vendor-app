
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from '@modules/auth/navigations/AuthNavigator';
import { MainNavigator } from '@modules/home/navigations/MainNavigator';
import { navigationRef } from '@navigation/navigationRef';
import { useAuthStore } from '@store/useAuthStore';
import * as Location from 'expo-location';
import { profileService } from '@modules/profile/services/profileService';
import { isDev } from '@/utils/platform';
import { Alert } from 'react-native';
import { CompleteProfileScreen } from '@/modules/profile/screens/CompleteProfileScreen';
import { CameraScreen } from '@/modules/profile/screens/CameraScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const token = useAuthStore((state) => state.token);
  useEffect(() => {
    if (!token) {
      return;
    }

    const sendLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        await profileService.updateLocation({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      } catch (error) {
        isDev && console.log('error in location update', error);
        Alert.alert('Error', 'Failed to send user location', [{ text: 'OK' }]);
      }
    };

    sendLocation();
  }, [token]);
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )} 
        <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
