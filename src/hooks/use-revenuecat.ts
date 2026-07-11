import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '../store/authStore';
import {
  identifyRevenueCatUser,
  initializeRevenueCat,
  isRevenueCatAvailable,
  logoutRevenueCatUser,
  syncEntitlementsFromRevenueCat,
} from '../lib/revenueCat';
import { useAppHydration } from './use-app-hydration';

/**
 * Inicializa o RevenueCat após hidratação, identifica o usuário Supabase
 * e revalida entitlements ao voltar para foreground.
 */
export function useRevenueCat() {
  const hydrated = useAppHydration();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const userId = useAuthStore((state) => state.session?.user?.id ?? null);

  useEffect(() => {
    if (!hydrated || isInitializing) {
      return;
    }
    if (!isRevenueCatAvailable()) {
      return;
    }
    void initializeRevenueCat(userId);
  }, [hydrated, isInitializing, userId]);

  useEffect(() => {
    if (!hydrated || isInitializing || !isRevenueCatAvailable()) {
      return;
    }
    if (userId) {
      void identifyRevenueCatUser(userId);
      return;
    }
    void logoutRevenueCatUser();
  }, [hydrated, isInitializing, userId]);

  useEffect(() => {
    if (!isRevenueCatAvailable()) {
      return;
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncEntitlementsFromRevenueCat();
      }
    });
    return () => subscription.remove();
  }, []);
}
