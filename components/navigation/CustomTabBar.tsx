import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabItem } from './TabItem';
import { AnimatedIndicator } from './AnimatedIndicator';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Tab configuration with icons
const TAB_CONFIG: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Search: 'search',
  Orders: 'clipboard',
  Profile: 'person',
};

/**
 * CustomTabBar - Floating bottom navigation with animations
 * Features:
 * - Compact floating design with subtle shadow
 * - Sliding indicator under active tab
 * - Scale animations on tab press
 * - Haptic feedback (iOS)
 * - Dark/Light mode support
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate tab width for indicator positioning
  const tabWidth = 100 / state.routes.length;
  
  // State for indicator position (percentage)
  const [translateX, setTranslateX] = useState({ value: state.index * tabWidth });

  // Update indicator position when active tab changes
  useEffect(() => {
    setTranslateX({ value: state.index * tabWidth });
  }, [state.index, tabWidth]);

  return (
    <View style={styles.container}>
      <View style={[
        styles.tabBar,
        isDark ? styles.tabBarDark : styles.tabBarLight,
      ]}>
        {/* Animated sliding indicator */}
        <AnimatedIndicator 
          translateX={translateX} 
          width={tabWidth} 
        />

        {/* Render tab items */}
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
            // Haptic feedback on iOS
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

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
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }

            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
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
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 8,
    // Shadow nhẹ, chỉ đổ lên trên
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBarLight: {
    backgroundColor: '#FFFFFF',
  },
  tabBarDark: {
    backgroundColor: '#1C1C1E',
  },
});
