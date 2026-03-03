import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Animated, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../store/cartStore';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 65;
const TAB_WIDTH = width / 5; // Changed from 4 to 5 tabs

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();
  
  // Check if current route should hide tab bar
  const currentRoute = state.routes[state.index];
  const routeName = getFocusedRouteNameFromRoute(currentRoute) ?? '';
  const hideTabBar = ['Checkout', 'AddressList', 'AddAddress', 'OrderDetail'].includes(routeName);
  
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      damping: 18,
      stiffness: 120,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const paddingBottom = Platform.OS === 'ios' ? 25 : 10;
  const height = TAB_HEIGHT + paddingBottom;

  // Hide tab bar if on certain screens
  if (hideTabBar) {
    return null;
  }

  const getIcon = (routeName: string, isFocused: boolean) => {
    const icons: Record<string, { active: string; inactive: string }> = {
      Home: { active: 'home', inactive: 'home-outline' },
      Search: { active: 'magnify', inactive: 'magnify' },
      Cart: { active: 'cart', inactive: 'cart-outline' },
      Orders: { active: 'clipboard-text', inactive: 'clipboard-text-outline' },
      Profile: { active: 'account', inactive: 'account-outline' },
    };
    return isFocused ? icons[routeName]?.active : icons[routeName]?.inactive;
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* White Background with Shadow */}
      <View style={styles.background} />

      {/* Animated Active Indicator */}
      <Animated.View 
        style={[
          styles.activeIndicator, 
          { 
            transform: [{ translateX }],
            left: TAB_WIDTH / 2 - 28,
          }
        ]}
      />

      {/* Tab Buttons */}
      <View style={[styles.content, { paddingBottom }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getIcon(route.name, isFocused);
          const showBadge = route.name === 'Cart' && cartItemCount > 0;

          return (
            <View key={index} style={styles.tabItem}>
              <TouchableOpacity
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={isFocused ? 28 : 24}
                  color={isFocused ? '#ffffff' : '#94a3b8'}
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 6,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
