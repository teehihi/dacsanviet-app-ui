import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/api';
import { STORAGE_KEYS } from './api';
import { CartItem } from '../types/cart';

// NOTE: We are using AsyncStorage instead of Realm for compatibility with Expo Go.
// Realm requires a Development Build (Prebuild) and cannot run in the standard Expo Go client.

const CART_KEY = 'cart_items';

export const RealmService = {
  // Save user
  saveUser: async (user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  // Get user
  getUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  // Delete all users (Logout)
  clearUserData: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },

  // Cart Management (Local only)
  getCartItems: async (): Promise<CartItem[]> => {
    try {
      const cartStr = await AsyncStorage.getItem(CART_KEY);
      return cartStr ? JSON.parse(cartStr) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  },

  addCartItem: async (item: CartItem): Promise<void> => {
    try {
      const items = await RealmService.getCartItems();
      items.push(item);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error adding cart item:', error);
      throw error;
    }
  },

  updateCartItemQuantity: async (itemId: string, quantity: number): Promise<void> => {
    try {
      const items = await RealmService.getCartItems();
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeCartItem: async (itemId: string): Promise<void> => {
    try {
      const items = await RealmService.getCartItems();
      const filteredItems = items.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(filteredItems));
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  clearCart: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};
