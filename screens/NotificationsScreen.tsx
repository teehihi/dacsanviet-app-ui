import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export const NotificationsScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={isDark ? ['#141e30', '#243b55'] : ['#d299c2', '#fef9d7', '#fbc2eb']}
        style={styles.background}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.textDark]}>Notifications</Text>
          <Text style={[styles.subtitle, isDark && styles.textDark]}>
            Stay updated with your notifications
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
