import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../types/address';

const STORAGE_KEY = '@addresses';

interface AddressStore {
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  
  loadAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  selectAddress: (address: Address) => void;
  getDefaultAddress: () => Address | null;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  selectedAddress: null,
  isLoading: false,

  loadAddresses: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const addresses = data ? JSON.parse(data) : [];
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault) || addresses[0] || null;
      set({ addresses, selectedAddress: defaultAddress, isLoading: false });
    } catch (error) {
      console.error('Error loading addresses:', error);
      set({ isLoading: false });
    }
  },

  addAddress: async (addressData) => {
    const { addresses } = get();
    const isFirstAddress = addresses.length === 0;
    
    const newAddress: Address = {
      ...addressData,
      id: Date.now().toString(),
      isDefault: isFirstAddress || addressData.isDefault,
    };

    // If this is set as default, unset others
    let updatedAddresses = addresses;
    if (newAddress.isDefault) {
      updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    updatedAddresses = [...updatedAddresses, newAddress];
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
    set({ addresses: updatedAddresses, selectedAddress: newAddress });
  },

  updateAddress: async (id, addressData) => {
    const { addresses } = get();
    const updatedAddresses = addresses.map(addr =>
      addr.id === id ? { ...addr, ...addressData } : addr
    );
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
    set({ addresses: updatedAddresses });
  },

  deleteAddress: async (id) => {
    const { addresses } = get();
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
    set({ addresses: updatedAddresses });
  },

  setDefaultAddress: async (id) => {
    const { addresses } = get();
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
    const defaultAddress = updatedAddresses.find(addr => addr.id === id) || null;
    set({ addresses: updatedAddresses, selectedAddress: defaultAddress });
  },

  selectAddress: (address) => {
    set({ selectedAddress: address });
  },

  getDefaultAddress: () => {
    const { addresses } = get();
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  },
}));
