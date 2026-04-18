import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  Home: { icon: 'home', label: 'Home' },
  Search: { icon: 'receipt', label: 'Orders' },
  Add: { icon: 'heart', label: 'Favorites' },
  Notifications: { icon: 'notifications', label: 'Notifications' },
  Profile: { icon: 'person', label: 'Profile' },
};

/**
 * GlassmorphismTabBar - True iOS floating tab bar
 * 
 * Key features:
 * - Active circle floats ABOVE container (overlaps top)
 * - Strong depth with layered shadows
 * - Transparent glass background
 * - Clear visual hierarchy
 */
export const GlassmorphismTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const tabCount = state.routes.length;
  const containerWidth = SCREEN_WIDTH - 32;
  const tabWidth = containerWidth / tabCount;
  
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
      mass: 0.9,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View style={styles.wrapper}>
      {/* Floating circle - positioned ABOVE container */}
      <Animated.View
        style={[
          styles.floatingCircleContainer,
          {
            left: (tabWidth - 72) / 2,
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFB84D', '#FFA940', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingCircle}
        />
      </Animated.View>

      {/* Glass container */}
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tabBar}
        >
          {/* Warm tint overlay */}
          <LinearGradient
            colors={['rgba(255, 245, 235, 0.25)', 'rgba(255, 250, 240, 0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.warmTint}
          />

          {/* Tab items */}
          <View style={styles.tabsContainer}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const config = TAB_CONFIG[route.name] || { icon: 'ellipse', label: route.name };

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
                  style={[styles.tab, { width: tabWidth }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.tabContent}>
                    <Ionicons
                      name={config.icon}
                      size={26}
                      color={isFocused ? '#FFFFFF' : '#9CA3AF'}
                      style={{ opacity: isFocused ? 1 : 0.5 }}
                    />
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isFocused ? '#FFFFFF' : '#9CA3AF',
                          opacity: isFocused ? 1 : 0.5,
                        },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    // Extra height for floating circle
    paddingTop: 30,
  },
  floatingCircleContainer: {
    position: 'absolute',
    top: 0, // Floats ABOVE container
    width: 72,
    height: 72,
    zIndex: 10,
    // Strong soft shadow for floating effect
    shadowColor: '#FF8C42',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  floatingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  container: {
    marginTop: 30, // Space for floating circle
  },
  tabBar: {
    height: 90,
    borderRadius: 40,
    justifyContent: 'center',
    // Outer shadow for container depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  warmTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
