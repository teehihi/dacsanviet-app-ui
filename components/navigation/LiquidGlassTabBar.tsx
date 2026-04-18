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
import { BlurView } from 'expo-blur';
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
 * LiquidGlassTabBar - iOS-style tab bar with native liquid glass effect
 * 
 * Uses BlurView with systemChromeMaterial tint (iOS native glass effect)
 * Requires development build to test - won't work in Expo Go
 */
export const LiquidGlassTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const tabCount = TABS.length;
  const tabWidth = CONTAINER_WIDTH / tabCount;
  
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide animation
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    }).start();

    // Bounce effect
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
      {/* Floating active circle */}
      <Animated.View
        style={[
          styles.floatingCircleWrapper,
          {
            left: (tabWidth - CIRCLE_SIZE) / 2,
            transform: [
              { translateX },
              { scale: scaleAnim },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#FFB84D', '#FFA940', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingCircle}
        >
          {/* Inner highlight */}
          <View style={styles.innerGlow} />
        </LinearGradient>
      </Animated.View>

      {/* Glass container with native iOS material */}
      <View style={styles.container}>
        <BlurView
          // systemChromeMaterial = iOS native liquid glass effect
          // This is what Apple uses for native tab bars!
          tint="systemChromeMaterial"
          intensity={100}
          style={styles.blurContainer}
        >
          {/* Warm tint overlay */}
          <View style={styles.tintOverlay} />

          {/* Tab items */}
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
                  <View style={styles.tabContent}>
                    <Ionicons
                      name={tab.icon}
                      size={24}
                      color={isFocused ? '#FFFFFF' : '#9CA3AF'}
                      style={[
                        styles.icon,
                        { opacity: isFocused ? 1 : 0.5 },
                      ]}
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
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
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
    paddingHorizontal: CONTAINER_MARGIN,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: CIRCLE_OVERLAP + 10,
  },
  container: {
    height: TAB_BAR_HEIGHT,
    borderRadius: 35,
    overflow: 'hidden',
    // Container shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 35,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 245, 235, 0.15)',
  },
  floatingCircleWrapper: {
    position: 'absolute',
    top: -CIRCLE_OVERLAP,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    zIndex: 100,
    // Strong orange shadow
    shadowColor: '#FF8C42',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 20,
  },
  floatingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: CIRCLE_SIZE / 3,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
