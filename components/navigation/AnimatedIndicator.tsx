import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AnimatedIndicatorProps {
  translateX: Animated.SharedValue<number>;
  width: number;
}

/**
 * AnimatedIndicator - Sliding pill indicator that moves under active tab
 * Uses shared value for smooth horizontal translation with spring animation
 */
export const AnimatedIndicator: React.FC<AnimatedIndicatorProps> = ({ translateX, width }) => {
  // Animated style that responds to translateX shared value changes
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // Smooth spring animation when indicator moves between tabs
          translateX: withSpring(translateX.value, {
            damping: 15,
            stiffness: 150,
            mass: 0.5,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: width * 0.6, // Indicator is 60% of tab width
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    bottom: 8,
  },
});
