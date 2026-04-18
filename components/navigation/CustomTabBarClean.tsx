import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const TAB_CONFIG: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Search: 'search',
  Add: 'add-circle',
  Notifications: 'notifications',
  Profile: 'person',
};

export const CustomTabBarClean: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icon = TAB_CONFIG[route.name] || 'ellipse';
          const label = route.name;

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

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
            >
              {isFocused ? (
                // Active tab with bubble
                <View style={styles.activeTab}>
                  <View style={styles.bubble}>
                    <Ionicons name={icon} size={30} color="#FF6B35" />
                  </View>
                  <Text style={styles.activeLabel}>{label}</Text>
                </View>
              ) : (
                // Inactive tab without bubble
                <View style={styles.inactiveTab}>
                  <Ionicons name={icon} size={28} color="#B0B0B0" />
                </View>
              )}
            </TouchableOpacity>
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
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    alignItems: 'center',
    gap: 6,
  },
  bubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: -2,
  },
  inactiveTab: {
    paddingVertical: 16,
  },
});
