
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from '@navigation/RootNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';  
import fontsPath from '@assets/fonts';
import { queryClient } from '@/api/queryClient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Constants } from '@/config/constants';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '@/store/useNotificationStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
   const [loaded, error] = useFonts({
      ...fontsPath,
  });

  const initializeNotifications = useNotificationStore((state) => state.initialize);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      iosClientId: Constants.GOOGLE_IOS_CLIENT_ID,
      webClientId: Constants.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });

    const cleanup = initializeNotifications();
    return cleanup;
  }, [initializeNotifications]);


  useEffect(() => {
    if (error) {
      console.warn('Error loading fonts:', error);
    }
  }, [error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider >
          <StatusBar style="auto" />
          <RootNavigator />
        </KeyboardProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
