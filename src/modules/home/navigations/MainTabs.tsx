import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@modules/home/screens/HomeScreen';
import { OrderHistoryScreen } from '@modules/orders/screens/OrderHistoryScreen';
import { ProfileScreen } from '@modules/profile/screens/ProfileScreen';
import { View, Text } from 'react-native';
import { theme } from '@theme/index';

const Tab = createBottomTabNavigator();

import { MenuScreen } from '@modules/menu/screens/MenuScreen';

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          backgroundColor: 'white',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>🍽️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
