import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { name: 'Home', icon: 'home' as const, label: 'Home' },
  { name: 'Search', icon: 'receipt' as const, label: 'Orders' },
  { name: 'Add', icon: 'heart' as const, label: 'Favorites' },
  { name: 'Notifications', icon: 'notifications' as const, label: 'Notifications' },
  { name: 'Profile', icon: 'person' as const, label: 'Profile' },
];

const CONTAINER_MARGIN = 16;
const CONTAINER_WIDTH = SCREEN_WIDTH - CONTAINER_MARGIN * 2;
const TAB_BAR_HEIGHT = 70;
const CIRCLE_SIZE = 64;
const CIRCLE_OVERLAP = 20;

/**
 * SimpleGlassTabBar - Following Expo docs exactly
 * 
 * Key: GlassView needs background content behind it to blur!
 */
export const SimpleGlassTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const tabCount = TABS.length;
  const tabWidth = CONTAINER_WIDTH / tabCount;
  
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth + (tabWidth / 2) - (CIRCLE_SIZE / 2), // Center circle on tab
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.12,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 8,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.index]);

  return (
    <View style={styles.wrapper}>
      {/* Floating circle */}
      <Animated.View
        style={[
          styles.circleWrapper,
          {
            transform: [{ translateX }, { scale: scaleAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#FFB84D', '#FFA940', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        />
      </Animated.View>

      {/* Glass container - EXACTLY like docs */}
      <GlassView
        style={styles.glassContainer}
        glassEffectStyle="regular"
        colorScheme="auto"
      >
        <View style={styles.tabsRow}>
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
                style={[styles.tab, { width: tabWidth }]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={isFocused ? '#FFFFFF' : '#9CA3AF'}
                  style={{ opacity: isFocused ? 1 : 0.5 }}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? '#FFFFFF' : '#9CA3AF',
                      opacity: isFocused ? 1 : 0.5,
                      fontWeight: isFocused ? '700' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: CONTAINER_MARGIN,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: CIRCLE_OVERLAP + 10,
  },
  circleWrapper: {
    position: 'absolute',
    top: -CIRCLE_OVERLAP,
    left: CONTAINER_MARGIN, // Start from left edge
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    zIndex: 100,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 20,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  glassContainer: {
    height: TAB_BAR_HEIGHT,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
