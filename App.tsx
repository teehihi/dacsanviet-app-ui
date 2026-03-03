import React, { useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import './global.css';
import './services/nativewindInterop';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

// Component to initialize auth state and cart
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const loadCart = useCartStore(state => state.loadCart);

  useEffect(() => {
    checkAuth();
    loadCart();
  }, [checkAuth, loadCart]);

  return <>{children}</>;
}

import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App(): React.JSX.Element {
  return (
    <AppInitializer>
      <SafeAreaProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </AppInitializer>
  );
}
