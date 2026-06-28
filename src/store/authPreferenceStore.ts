import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Preferência local e leve: registra que o usuário escolheu continuar sem
 * conta (modo convidado). Persistida para não mostrar a tela de boas-vindas a
 * cada abertura. Nunca impede o usuário de criar conta depois.
 */
type AuthPreferenceStore = {
  hasChosenGuest: boolean;
  setChoseGuest: (chose: boolean) => void;
  resetAuthPreference: () => void;
};

export const useAuthPreferenceStore = create<AuthPreferenceStore>()(
  persist(
    (set) => ({
      hasChosenGuest: false,
      setChoseGuest: (chose) => set({ hasChosenGuest: chose }),
      resetAuthPreference: () => set({ hasChosenGuest: false }),
    }),
    {
      name: 'studylazy-auth-preference',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
