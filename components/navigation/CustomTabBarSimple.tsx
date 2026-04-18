import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, useColorScheme, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabItemSimple } from './TabItemSimple';
import { Ionicons } from '@expo/vector-icons';

const TAB_CONFIG: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Search: 'search',
  Add: 'add-circle',
  Notifications: 'notifications',
  Profile: 'person',
};

export const CustomTabBarSimple: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={[
        styles.tabBar,
        isDark ? styles.tabBarDark : styles.tabBarLight,
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;
          const icon = TAB_CONFIG[route.name] || 'ellipse';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItemSimple
              key={route.key}
              icon={icon}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              label={String(label)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  tabBarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  tabBarDark: {
    backgroundColor: 'rgba(40, 40, 45, 0.92)',
  },
});
