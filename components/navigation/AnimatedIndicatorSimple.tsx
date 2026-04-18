import React from 'react';
import { StyleSheet, Animated } from 'react-native';

interface AnimatedIndicatorSimpleProps {
  translateX: Animated.Value;
  width: number;
}

/**
 * AnimatedIndicatorSimple - Sliding pill indicator
 * Uses React Native Animated API (Expo Go compatible)
 */
export const AnimatedIndicatorSimple: React.FC<AnimatedIndicatorSimpleProps> = ({ translateX, width }) => {
  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: `${width * 0.6}%`,
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ],
        },
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
