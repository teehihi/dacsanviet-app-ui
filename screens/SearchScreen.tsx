import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export const SearchScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={isDark ? ['#0f2027', '#203a43', '#2c5364'] : ['#a8edea', '#fed6e3']}
        style={styles.background}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.textDark]}>Search Screen</Text>
          <Text style={[styles.subtitle, isDark && styles.textDark]}>
            Find what you're looking for
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
  background: {
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
  },
  textDark: {
    color: '#FFFFFF',
  },
});
