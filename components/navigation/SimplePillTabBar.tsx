import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { name: 'Home', icon: 'home' as const, label: 'Trang chủ' },
  { name: 'Search', icon: 'search' as const, label: 'Tìm kiếm' },
  { name: 'Orders', icon: 'receipt' as const, label: 'Đơn hàng' },
  { name: 'Profile', icon: 'person' as const, label: 'Tài khoản' },
];

const getTabConfig = (routeName: string) => {
  return TABS.find(tab => tab.name === routeName) || TABS[0];
};

const HORIZONTAL_PADDING = 16;
const GLASS_PADDING = 8;
const TOTAL_PADDING = HORIZONTAL_PADDING * 2 + GLASS_PADDING * 2;
const AVAILABLE_WIDTH = SCREEN_WIDTH - TOTAL_PADDING;
const TAB_WIDTH = AVAILABLE_WIDTH / TABS.length;
const PILL_WIDTH = TAB_WIDTH - 4;
const PILL_HEIGHT = 64;

export const SimplePillTabBar: React.FC<MaterialTopTabBarProps> = ({
  state,
  navigation,
  position,
}) => {
  // Animate pill position based on swipe
  const translateX = position.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => i * TAB_WIDTH + 2),
  });

  return (
    <View style={styles.container}>
      <GlassView style={styles.glassView}>
        {/* Animated pill that follows swipe */}
        <Animated.View
          style={[
            styles.pill,
            {
              transform: [{ translateX }],
            },
          ]}
        />

        {/* Tab items */}
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const tab = getTabConfig(route.name);

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

            const opacity = position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp',
            });

            const scale = position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.92, 1, 0.92],
              extrapolate: 'clamp',
            });

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.tabContent,
                    { opacity, transform: [{ scale }] },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={28}
                    color={isFocused ? '#007AFF' : '#8E8E93'}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isFocused ? '#007AFF' : '#8E8E93',
                        fontWeight: isFocused ? '700' : '600',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  glassView: {
    height: 80,
    borderRadius: 40,
    padding: GLASS_PADDING,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 8,
    left: GLASS_PADDING + 2,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 122, 255, 0.18)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
});
