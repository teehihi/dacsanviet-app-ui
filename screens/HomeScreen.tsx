import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export const HomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.wrapper}>
      {/* Colorful gradient background for glass effect */}
      <LinearGradient
        colors={isDark 
          ? ['#1a1a2e', '#16213e', '#0f3460']
          : ['#ffecd2', '#fcb69f', '#ff9a9e', '#fad0c4']
        }
        style={styles.gradientBackground}
      />
      
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.textDark]}>Home Screen</Text>
          <Text style={[styles.subtitle, isDark && styles.textDark]}>
            Welcome to the custom animated tab bar!
          </Text>
          <Text style={[styles.hint, isDark && styles.textDark]}>
            🎨 Colorful background makes glass effect visible
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  textDark: {
    color: '#FFFFFF',
  },
});
