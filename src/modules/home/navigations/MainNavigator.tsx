import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { EditProfileScreen } from '@modules/profile/screens/EditProfileScreen';
import { CameraScreen } from '@modules/profile/screens/CameraScreen';
import { CompleteProfileScreen } from '@modules/profile/screens/CompleteProfileScreen';
import { AddMenuItemScreen } from '@modules/menu/screens/AddMenuItemScreen';
import { EditMenuItemScreen } from '@modules/menu/screens/EditMenuItemScreen';
import { OrdersScreen } from '@modules/orders/screens/OrdersScreen';
import { OrderDetailScreen } from '@modules/orders/screens/OrderDetailScreen';
import { MapPickerScreen } from '@modules/orders/screens/MapPickerScreen';
import { NewRouteScreen } from '@modules/orders/screens/NewRoute';

export type RootStackParamList = {
  MainTabs: undefined;
  EditProfile: undefined;
  AddMenuItem: undefined;
  EditMenuItem: { item: any };
  Orders: undefined;
  OrderDetail: { orderId: string };
  CompleteProfile: undefined;
  Camera: undefined;
  MapPicker: { initialStartPoint?: any; initialEndPoint?: any };
  CreateRoute: { selectedPath?: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <Stack.Screen name="EditMenuItem" component={EditMenuItemScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="MapPicker" component={MapPickerScreen} />
      <Stack.Screen name="CreateRoute" component={NewRouteScreen} />
    </Stack.Navigator>
  );
};
