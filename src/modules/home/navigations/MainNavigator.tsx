import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { EditProfileScreen } from '@modules/profile/screens/EditProfileScreen';
import { CameraScreen } from '@modules/profile/screens/CameraScreen';
import { CompleteProfileScreen } from '@modules/profile/screens/CompleteProfileScreen';
import { AddMenuItemScreen } from '@modules/menu/screens/AddMenuItemScreen';

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
    </Stack.Navigator>
  );
};

