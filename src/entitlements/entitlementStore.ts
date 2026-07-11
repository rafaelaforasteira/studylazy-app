import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { EntitlementSource, UserPlan } from './types';

type EntitlementStore = {
  plan: UserPlan;
  source: EntitlementSource;
  entitlementCheckedAt: string | null;
  /** Simula Pro em desenvolvimento (nunca ativo em produção por padrão). */
  devProEnabled: boolean;
  setPlan: (plan: UserPlan, source?: EntitlementSource) => void;
  applySubscriptionState: (params: {
    plan: UserPlan;
    source: EntitlementSource;
    entitlementCheckedAt?: string | null;
  }) => void;
  setDevProEnabled: (enabled: boolean) => void;
  resetEntitlements: () => void;
};

const initialState = {
  plan: 'free' as UserPlan,
  source: 'default' as EntitlementSource,
  entitlementCheckedAt: null as string | null,
  devProEnabled: false,
};

export const useEntitlementStore = create<EntitlementStore>()(
  persist(
    (set) => ({
      ...initialState,
      setPlan: (plan, source = 'default') =>
        set({
          plan,
          source,
          devProEnabled: false,
          entitlementCheckedAt: new Date().toISOString(),
        }),
      applySubscriptionState: ({ plan, source, entitlementCheckedAt }) =>
        set({
          plan,
          source,
          devProEnabled: false,
          entitlementCheckedAt:
            entitlementCheckedAt ?? new Date().toISOString(),
        }),
      setDevProEnabled: (enabled) => set({ devProEnabled: enabled }),
      resetEntitlements: () => set(initialState),
    }),
    {
      name: 'studylazy-entitlements',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<EntitlementStore>;
        if (version < 2) {
          return {
            ...state,
            entitlementCheckedAt: state.entitlementCheckedAt ?? null,
          };
        }
        return state;
      },
      partialize: (state) => ({
        plan: state.plan,
        source: state.source,
        entitlementCheckedAt: state.entitlementCheckedAt,
        devProEnabled: state.devProEnabled,
      }),
    }
  )
);
