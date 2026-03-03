import { create } from 'zustand';
import { CartItem, Cart } from '../types/cart';
import { RealmService } from '../services/realm';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  
  // Actions
  loadCart: () => Promise<void>;
  addItem: (productId: number, productName: string, productImage: string, price: number, originalPrice?: number, category?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  loadCart: async () => {
    try {
      set({ isLoading: true });
      const items = await RealmService.getCartItems();
      set({ items, isLoading: false });
    } catch (error) {
      console.error('Load cart error:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (productId, productName, productImage, price, originalPrice, category = '') => {
    try {
      const { items } = get();
      const existingItem = items.find(item => item.productId === productId);

      if (existingItem) {
        // Tăng số lượng nếu đã có
        await get().updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Thêm mới
        const newItem: CartItem = {
          id: `${productId}_${Date.now()}`,
          productId,
          productName,
          productImage,
          price,
          originalPrice,
          quantity: 1,
          category,
          addedAt: new Date().toISOString(),
        };
        
        await RealmService.addCartItem(newItem);
        set({ items: [...items, newItem] });
      }
    } catch (error) {
      console.error('Add item error:', error);
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      await RealmService.removeCartItem(itemId);
      set({ items: get().items.filter(item => item.id !== itemId) });
    } catch (error) {
      console.error('Remove item error:', error);
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        await get().removeItem(itemId);
        return;
      }

      await RealmService.updateCartItemQuantity(itemId, quantity);
      set({
        items: get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await RealmService.clearCart();
      set({ items: [] });
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
