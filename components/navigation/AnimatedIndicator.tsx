import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';

interface AnimatedIndicatorProps {
  translateX: { value: number };
  width: number;
}

/**
 * AnimatedIndicator - Sliding pill indicator that moves under active tab
 * Uses React Native Animated API for smooth horizontal translation
 */
export const AnimatedIndicator: React.FC<AnimatedIndicatorProps> = ({ translateX, width }) => {
  const animatedValue = useRef(new Animated.Value(translateX.value)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: translateX.value,
      damping: 15,
      stiffness: 150,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [translateX.value, animatedValue]);

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: `${width * 0.6}%`,
          transform: [{ translateX: animatedValue }],
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
