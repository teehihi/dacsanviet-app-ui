import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  borderRadius?: number;
}

/**
 * GlassView Component
 * 
 * Tạo hiệu ứng kính mờ (frosted glass) với blur và transparency.
 * Sử dụng LiquidGlassView trên iOS và Expo Blur trên Android.
 * 
 * @example
 * ```tsx
 * <GlassView intensity={80} tint="light">
 *   <Text>Content with glass effect</Text>
 * </GlassView>
 * ```
 */
export const GlassView = ({ 
  children, 
  intensity = 80, 
  tint = 'light',
  style,
  borderRadius = 20,
}: GlassViewProps) => {

  if (Platform.OS === 'ios' && isLiquidGlassSupported) {
    return (
      <LiquidGlassView 
        effect="clear"
        colorScheme={tint === 'dark' ? 'dark' : 'light'}
        style={[
          styles.container, 
          { borderRadius },
          style
        ]}
      >
        <View style={[styles.overlay, { borderRadius }]}>
          {children}
        </View>
      </LiquidGlassView>
    );
  }

  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      style={[
        styles.container, 
        { borderRadius },
        style
      ]}
    >
      <View style={[styles.overlay, { borderRadius }]}>
        {children}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
});

/**
 * Preset Glass Styles
 */
export const GlassPresets = {
  card: {
    intensity: 80,
    tint: 'light' as const,
    borderRadius: 16,
  },
  modal: {
    intensity: 100,
    tint: 'dark' as const,
    borderRadius: 24,
  },
  button: {
    intensity: 60,
    tint: 'light' as const,
    borderRadius: 12,
  },
  header: {
    intensity: 90,
    tint: 'light' as const,
    borderRadius: 0,
  },
};
