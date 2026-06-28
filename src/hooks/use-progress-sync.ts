import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '../store/authStore';
import {
  handleAuthenticated,
  handleLogout,
  retrySyncIfPending,
  startProgressSync,
} from '../sync/syncCoordinator';
import { useAppHydration } from './use-app-hydration';

/**
 * Liga o coordenador de sincronização ao ciclo de vida do app:
 * inicia após hidratação + auth pronta, reage a login/logout e tenta
 * novamente ao voltar para foreground. Não bloqueia o uso offline.
 */
export function useProgressSync() {
  const hydrated = useAppHydration();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const userId = useAuthStore((state) => state.session?.user?.id ?? null);

  useEffect(() => {
    if (!hydrated || isInitializing) {
      return;
    }
    startProgressSync();
  }, [hydrated, isInitializing]);

  useEffect(() => {
    if (!hydrated || isInitializing) {
      return;
    }
    if (userId) {
      handleAuthenticated();
    } else {
      handleLogout();
    }
  }, [hydrated, isInitializing, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        retrySyncIfPending();
      }
    });
    return () => subscription.remove();
  }, []);
}
