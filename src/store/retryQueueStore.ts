import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  clearRetryQueue,
  countActiveRetries,
  createEmptyRetryQueue,
  getActiveRetryIds,
  getActiveRetriesForSubject,
  reduceRetryOnCorrect,
  upsertRetryOnMiss,
} from '../retry/retryQueueLogic';
import type { RetryQueueItem, RetryQueueSnapshot } from '../retry/retryQueueTypes';

type RetryQueueStore = RetryQueueSnapshot & {
  recordMiss: (stableQuestionId: string, subject: string) => void;
  recordCorrect: (stableQuestionId: string, subject: string) => void;
  getActiveForSubject: (subject: string) => RetryQueueItem[];
  getActiveIds: (subject?: string) => Set<string>;
  getActiveCount: () => number;
  clearQueueDev: () => void;
};

export const useRetryQueueStore = create<RetryQueueStore>()(
  persist(
    (set, get) => ({
      ...createEmptyRetryQueue(),

      recordMiss: (stableQuestionId, subject) => {
        set((state) =>
          upsertRetryOnMiss({
            queue: state,
            stableQuestionId,
            subject,
          })
        );
      },

      recordCorrect: (stableQuestionId, subject) => {
        set((state) =>
          reduceRetryOnCorrect({
            queue: state,
            stableQuestionId,
            subject,
          })
        );
      },

      getActiveForSubject: (subject) => getActiveRetriesForSubject(get(), subject),

      getActiveIds: (subject) => getActiveRetryIds(get(), subject),

      getActiveCount: () => countActiveRetries(get()),

      clearQueueDev: () => set(clearRetryQueue()),
    }),
    {
      name: 'studylazy-retry-queue',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<RetryQueueSnapshot>;
        const items = Array.isArray(state.items)
          ? state.items.filter(
              (item) =>
                item &&
                typeof item.stableQuestionId === 'string' &&
                item.stableQuestionId.trim().length > 0 &&
                typeof item.subject === 'string'
            )
          : [];
        return { items };
      },
      partialize: (state) => ({
        items: state.items.map((item) => ({
          stableQuestionId: item.stableQuestionId,
          subject: item.subject,
          errorCount: item.errorCount,
          lastMissedAt: item.lastMissedAt,
          lastCorrectedAt: item.lastCorrectedAt,
          active: item.active,
        })),
      }),
    }
  )
);
