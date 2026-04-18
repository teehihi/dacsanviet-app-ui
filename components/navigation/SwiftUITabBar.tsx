import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Host } from '@expo/ui/swift-ui';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { name: 'Home', icon: 'home' as const, label: 'Home' },
  { name: 'Search', icon: 'receipt' as const, label: 'Orders' },
  { name: 'Add', icon: 'heart' as const, label: 'Favorites' },
  { name: 'Notifications', icon: 'notifications' as const, label: 'Notifications' },
  { name: 'Profile', icon: 'person' as const, label: 'Profile' },
];

/**
 * SwiftUI-style tab bar using @expo/ui
 * 
 * Uses Host component from @expo/ui/swift-ui for native rendering
 * Combined with GlassView for liquid glass effect
 */
export const SwiftUITabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  return (
    <Host style={styles.host}>
      <View style={styles.container}>
        <GlassView style={styles.glassView}>
          {TABS.map((tab, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[index].key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            };

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={28}
                  color={isFocused ? '#007AFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? '#007AFF' : '#8E8E93' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </GlassView>
      </View>
    </Host>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
  },
  glassView: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 40,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
