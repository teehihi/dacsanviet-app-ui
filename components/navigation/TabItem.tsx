import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

/**
 * TabItem - Individual tab button with scale animation
 * Uses React Native Animated API for smooth scaling
 */
export const TabItem: React.FC<TabItemProps> = ({
  icon,
  isFocused,
  onPress,
  onLongPress,
  label,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  // Animate scale and opacity based on focus state
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.2 : 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, scale, opacity]);

  // Handle press with bounce effect
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.1 : 0.9,
      damping: 10,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.2 : 1,
      damping: 12,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isFocused ? '#007AFF' : '#8E8E93'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
