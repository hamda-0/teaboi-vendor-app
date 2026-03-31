import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@modules/home/screens/HomeScreen';
import { RoutesScreen } from '@modules/orders/screens/RoutesScreen';
import { ProfileScreen } from '@modules/profile/screens/ProfileScreen';
import { View, Text } from 'react-native';
import { theme } from '@theme/index';

const Tab = createBottomTabNavigator();

import { MenuScreen } from '@modules/menu/screens/MenuScreen';
import { Ionicons } from '@expo/vector-icons';

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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
             <Ionicons name="home-outline" size={20} color={focused ? theme.colors.primary : theme.colors.grey}/>

          ),
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RoutesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name="git-network-outline" size={20} color={focused ? theme.colors.primary : theme.colors.grey} />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name="list-outline" size={20} color={focused ? theme.colors.primary : theme.colors.grey} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name="settings-outline" size={20} color={focused ? theme.colors.primary : theme.colors.grey} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
