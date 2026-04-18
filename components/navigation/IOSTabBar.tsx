import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
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

export const IOSTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const tabCount = TABS.length;
  const tabWidth = (SCREEN_WIDTH - 32) / tabCount;
  
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.wrapper}>
      {/* Floating circle - ABOVE everything */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.circleWrapper,
          {
            left: tabWidth / 2 - 36,
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFB84D', '#FFA940', '#FF8C42']}
          style={styles.circle}
        />
      </Animated.View>

      {/* Glass bar */}
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
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
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 16,
    right: 16,
    height: 100,
  },
  circleWrapper: {
    position: 'absolute',
    top: -10,
    width: 72,
    height: 72,
    zIndex: 100,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  blurContainer: {
    marginTop: 30,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
