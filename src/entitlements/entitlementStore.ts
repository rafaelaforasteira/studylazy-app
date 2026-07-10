import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { EntitlementSource, UserPlan } from './types';

type EntitlementStore = {
  plan: UserPlan;
  source: EntitlementSource;
  /** Simula Pro em desenvolvimento (nunca ativo em produção por padrão). */
  devProEnabled: boolean;
  setPlan: (plan: UserPlan, source?: EntitlementSource) => void;
  setDevProEnabled: (enabled: boolean) => void;
  resetEntitlements: () => void;
};

const initialState = {
  plan: 'free' as UserPlan,
  source: 'default' as EntitlementSource,
  devProEnabled: false,
};

export const useEntitlementStore = create<EntitlementStore>()(
  persist(
    (set) => ({
      ...initialState,
      setPlan: (plan, source = 'default') =>
        set({ plan, source, devProEnabled: false }),
      setDevProEnabled: (enabled) =>
        set({ devProEnabled: enabled }),
      resetEntitlements: () => set(initialState),
    }),
    {
      name: 'studylazy-entitlements',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        plan: state.plan,
        source: state.source,
        devProEnabled: state.devProEnabled,
      }),
    }
  )
);
