import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENT_COLORS = {
  home: {
    light: ['#ffecd2', '#fcb69f', '#ff9a9e', '#fad0c4'],
    dark: ['#1a1a2e', '#16213e', '#0f3460'],
  },
  search: {
    light: ['#a8edea', '#fed6e3', '#fbc2eb', '#a6c1ee'],
    dark: ['#0f2027', '#203a43', '#2c5364'],
  },
  add: {
    light: ['#ffeaa7', '#fdcb6e', '#fab1a0', '#ff7675'],
    dark: ['#2d3436', '#636e72', '#b2bec3'],
  },
  notifications: {
    light: ['#d299c2', '#fef9d7', '#fbc2eb', '#a6c1ee'],
    dark: ['#141e30', '#243b55', '#2c5364'],
  },
  profile: {
    light: ['#fbc2eb', '#a6c1ee', '#c2e9fb', '#a1c4fd'],
    dark: ['#232526', '#414345', '#606c88'],
  },
};

interface GradientBackgroundProps {
  screen: 'home' | 'search' | 'add' | 'notifications' | 'profile';
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ screen }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const colors = GRADIENT_COLORS[screen][isDark ? 'dark' : 'light'];

  return (
    <LinearGradient
      colors={colors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
