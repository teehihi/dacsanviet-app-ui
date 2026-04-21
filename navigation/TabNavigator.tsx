import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlassTabBar } from '../components/GlassTabBar';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { AddScreen } from '../screens/AddScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
