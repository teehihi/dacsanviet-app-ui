import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
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
 * Active tab scales up with spring animation
 * Includes bounce effect on press
 */
export const TabItem: React.FC<TabItemProps> = ({
  icon,
  isFocused,
  onPress,
  onLongPress,
  label,
}) => {
  // Shared value for scale animation
  const scale = useSharedValue(1);

  // Animate scale based on focus state
  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.2 : 1, {
      damping: 12,
      stiffness: 200,
    });
  }, [isFocused]);

  // Animated style for icon scaling
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Color animation for active/inactive states
  const animatedColorStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.5, { duration: 200 }),
    };
  });

  // Handle press with bounce effect
  const handlePressIn = () => {
    scale.value = withSpring(isFocused ? 1.1 : 0.9, {
      damping: 10,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(isFocused ? 1.2 : 1, {
      damping: 12,
      stiffness: 200,
    });
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View style={[animatedIconStyle, animatedColorStyle]}>
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
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
