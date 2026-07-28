import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { insertUserFeedback } from '../feedback/feedbackRepository';
import { useAuthStore } from '../store/authStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { useAppHydration } from './use-app-hydration';

const MAX_RETRIES_PER_TICK = 5;

function warnDev(message: string) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[feedback-sync] ${message}`);
  }
}

/**
 * Envia feedbacks pendentes sem bloquear a UI e sem misturar com sync de progresso.
 * Falhas mantêm o item como pending/failed para retry posterior.
 */
export function useFeedbackSync() {
  const hydrated = useAppHydration();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!hydrated || isInitializing) {
      return;
    }
    useFeedbackStore.getState().ensureFirstOpened();
  }, [hydrated, isInitializing]);

  useEffect(() => {
    if (!hydrated || isInitializing) {
      return;
    }

    async function flushPending() {
      if (busyRef.current) {
        return;
      }
      busyRef.current = true;
      try {
        const pending = useFeedbackStore.getState().getPending().slice(0, MAX_RETRIES_PER_TICK);
        for (const entry of pending) {
          const result = await insertUserFeedback(entry);
          if (result.ok) {
            useFeedbackStore.getState().markSynced(entry.id);
          } else {
            useFeedbackStore.getState().markFailed(entry.id);
            warnDev(`Pendente ${entry.id}: ${result.message}`);
          }
        }
      } finally {
        busyRef.current = false;
      }
    }

    void flushPending();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void flushPending();
      }
    });

    return () => subscription.remove();
  }, [hydrated, isInitializing]);
}
