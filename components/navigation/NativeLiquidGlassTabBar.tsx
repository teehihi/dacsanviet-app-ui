import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView, isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';
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
 * NativeLiquidGlassTabBar - TRUE iOS Liquid Glass Tab Bar
 * 
 * Uses expo-glass-effect's GlassView component for native iOS liquid glass effect
 * This is the OFFICIAL Expo way to create liquid glass UI
 * 
 * Requirements:
 * - iOS 26+ (will fallback to regular View on older versions)
 * - Development build (won't work in Expo Go)
 * 
 * Features:
 * - Native UIVisualEffectView rendering
 * - True liquid glass effect (not simulated)
 * - Automatic light/dark mode adaptation
 * - Floating animated circle indicator
 * - Spring physics animation
 */
export const NativeLiquidGlassTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const tabCount = TABS.length;
  const tabWidth = CONTAINER_WIDTH / tabCount;
  
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Check if liquid glass is available
  const hasLiquidGlass = isLiquidGlassAvailable();
  const hasGlassAPI = isGlassEffectAPIAvailable();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    // Check accessibility settings
    AccessibilityInfo.isReduceTransparencyEnabled().then(enabled => {
      setReduceTransparency(enabled || false);
    });
  }, []);

  // Use glass effect only if all conditions are met
  const shouldUseGlassEffect = hasLiquidGlass && hasGlassAPI && !reduceTransparency;

  useEffect(() => {
    // Slide animation with spring physics
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    }).start();

    // Bounce effect on tab change
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
      {/* Floating active circle - positioned ABOVE container */}
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
          {/* Inner highlight glow */}
          <View style={styles.innerGlow} />
        </LinearGradient>
      </Animated.View>

      {/* Glass container - Native iOS liquid glass effect */}
      <View style={styles.container}>
        {shouldUseGlassEffect ? (
          <>
            {/* Background layer for blur effect */}
            <View style={styles.blurBackground} />
            <GlassView
              style={styles.glassContainer}
              glassEffectStyle="clear" // Changed to 'clear' for more transparency
              colorScheme="auto"
            >
              {/* Warm tint overlay inside GlassView */}
              <View style={[styles.warmTintOverlay, { backgroundColor: 'rgba(255, 245, 235, 0.15)' }]} />
              
              {/* Tab items */}
              <TabItems
                tabs={TABS}
                state={state}
                navigation={navigation}
                tabWidth={tabWidth}
              />
            </GlassView>
          </>
        ) : (
          // Fallback: Beautiful gradient glass simulation
          <View style={styles.glassContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fallbackGradient}
            >
              {/* Warm tint overlay */}
              <LinearGradient
                colors={[
                  'rgba(255, 245, 235, 0.3)',
                  'rgba(255, 250, 240, 0.2)',
                  'rgba(255, 255, 255, 0.1)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.warmTint}
              />
              {/* Border highlight */}
              <View style={styles.borderHighlight} />
            </LinearGradient>
            
            {/* Tab items */}
            <TabItems
              tabs={TABS}
              state={state}
              navigation={navigation}
              tabWidth={tabWidth}
            />
          </View>
        )}
      </View>

      {/* Debug info (remove in production) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Glass: {shouldUseGlassEffect ? '✅' : '❌'} | API: {hasGlassAPI ? '✅' : '❌'} | Transparency: {reduceTransparency ? '❌' : '✅'}
          </Text>
        </View>
      )}
    </View>
  );
};

// Separate component for tab items to avoid duplication
const TabItems: React.FC<{
  tabs: typeof TABS;
  state: any;
  navigation: any;
  tabWidth: number;
}> = ({ tabs, state, navigation, tabWidth }) => {
  return (
    <View style={styles.tabsRow}>
      {tabs.map((tab, index) => {
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
    paddingTop: CIRCLE_OVERLAP + 10, // Space for floating circle
  },
  container: {
    height: TAB_BAR_HEIGHT,
    borderRadius: 35,
    overflow: 'hidden',
    // Container shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 35,
  },
  glassContainer: {
    flex: 1,
    borderRadius: 35,
  },
  warmTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    pointerEvents: 'none',
  },
  fallbackGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
  },
  warmTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
  },
  borderHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  floatingCircleWrapper: {
    position: 'absolute',
    top: -CIRCLE_OVERLAP, // Float ABOVE container
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    zIndex: 100,
    // Strong orange shadow for floating effect
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
  debugInfo: {
    position: 'absolute',
    top: -40,
    left: CONTAINER_MARGIN,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
