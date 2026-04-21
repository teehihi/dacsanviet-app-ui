import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView, GlassPresets } from '../../components/GlassView';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Glass Effect Demo Screen
 * 
 * Demonstrates liquid glass effects with fallback
 * - Uses @callstack/liquid-glass when available
 * - Falls back to expo-blur automatically
 */
const GlassEffectDemo = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800' }}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Liquid Glass Effects</Text>
            <Text style={styles.subtitle}>
              Tự động fallback về Expo Blur nếu cần
            </Text>
          </View>

          {/* Card Example */}
          <GlassView {...GlassPresets.card} style={styles.card}>
            <MaterialCommunityIcons name="cards-heart" size={40} color="#ef4444" />
            <Text style={styles.cardTitle}>Glass Card</Text>
            <Text style={styles.cardText}>
              Hiệu ứng kính mờ với blur và transparency
            </Text>
          </GlassView>

          {/* Modal Example */}
          <GlassView {...GlassPresets.modal} style={styles.modal}>
            <MaterialCommunityIcons name="window-maximize" size={40} color="#3b82f6" />
            <Text style={styles.cardTitle}>Glass Modal</Text>
            <Text style={styles.cardText}>
              Intensity cao hơn cho modal overlay
            </Text>
          </GlassView>

          {/* Button Example */}
          <GlassView {...GlassPresets.button} style={styles.button}>
            <MaterialCommunityIcons name="gesture-tap" size={24} color="#8b5cf6" />
            <Text style={styles.buttonText}>Glass Button</Text>
          </GlassView>

          {/* Advanced Liquid Glass (iOS only) */}
          <GlassView 
            useLiquidGlass={true} 
            style={styles.advanced}
            borderRadius={24}
          >
            <MaterialCommunityIcons name="star" size={40} color="#f59e0b" />
            <Text style={styles.cardTitle}>Advanced Glass</Text>
            <Text style={styles.cardText}>
              Dùng @callstack/liquid-glass nếu có
            </Text>
            <Text style={styles.cardSubtext}>
              (iOS only, fallback to Expo Blur on other platforms)
            </Text>
          </GlassView>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.infoText}>
              💡 Component tự động detect và fallback
            </Text>
            <Text style={styles.infoText}>
              ✅ Expo Blur: Hoạt động trên mọi platform
            </Text>
            <Text style={styles.infoText}>
              ⚡ Liquid Glass: iOS native, hiệu ứng đẹp hơn
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  modal: {
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advanced: {
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  info: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default GlassEffectDemo;
