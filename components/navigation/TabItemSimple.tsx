import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabItemSimpleProps {
  icon: keyof typeof Ionicons.glyphMap;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

export const TabItemSimple: React.FC<TabItemSimpleProps> = ({
  icon,
  isFocused,
  onPress,
  onLongPress,
  label,
}) => {
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bubbleScale, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }),
      Animated.spring(iconScale, {
        toValue: isFocused ? 1 : 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(iconScale, {
      toValue: 0.9,
      useNativeDriver: true,
      damping: 10,
      stiffness: 400,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(iconScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
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
      activeOpacity={1}
    >
      <View style={styles.iconContainer}>
        {/* Bubble background with deep shadow */}
        <Animated.View
          style={[
            styles.bubble,
            {
              opacity: bubbleScale,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        />
        
        {/* Icon */}
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons
            name={icon}
            size={28}
            color={isFocused ? '#FF6B35' : '#999999'}
          />
        </Animated.View>
      </View>
      
      {/* Label text */}
      {isFocused && (
        <Animated.Text 
          style={[
            styles.label,
            { opacity: bubbleScale }
          ]}
        >
          {label}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
