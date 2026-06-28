import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  normalizeForeignLanguagePreference,
  type ForeignLanguagePreference,
} from '../data/questionTypes';

export type { ForeignLanguagePreference } from '../data/questionTypes';

type ProfileStore = {
  name: string;
  /**
   * Língua estrangeira escolhida. `null` = usuário ainda não escolheu
   * (inclusive usuários antigos migrados). Nunca escolhemos por eles.
   */
  foreignLanguage: ForeignLanguagePreference | null;
  /**
   * Carimbo ISO da última alteração da língua. Metadado confiável usado pelo
   * merge de sincronização para resolver conflitos entre dispositivos.
   */
  foreignLanguageUpdatedAt: string | null;
  setName: (name: string) => void;
  setForeignLanguage: (language: ForeignLanguagePreference) => void;
  resetProfile: () => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      name: 'Estudante',
      foreignLanguage: null,
      foreignLanguageUpdatedAt: null,

      setName: (name) =>
        set({
          name: name.trim() || 'Estudante',
        }),

      setForeignLanguage: (language) =>
        set({
          foreignLanguage: normalizeForeignLanguagePreference(language),
          foreignLanguageUpdatedAt: new Date().toISOString(),
        }),

      resetProfile: () =>
        set({
          name: 'Estudante',
          foreignLanguage: null,
          foreignLanguageUpdatedAt: null,
        }),
    }),
    {
      name: 'studylazy-profile',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<ProfileStore>;

        if (version < 1) {
          // Usuários antigos não possuíam o campo: mantêm tudo e ganham
          // foreignLanguage = null (sem escolha silenciosa).
          return {
            ...state,
            foreignLanguage: normalizeForeignLanguagePreference(
              state.foreignLanguage
            ),
            foreignLanguageUpdatedAt: state.foreignLanguageUpdatedAt ?? null,
          };
        }

        if (version < 2) {
          return {
            ...state,
            foreignLanguageUpdatedAt: state.foreignLanguageUpdatedAt ?? null,
          };
        }

        return state;
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ProfileStore>;

        return {
          ...currentState,
          ...persisted,
          name: persisted.name ?? currentState.name,
          foreignLanguage: normalizeForeignLanguagePreference(
            persisted.foreignLanguage
          ),
          foreignLanguageUpdatedAt:
            typeof persisted.foreignLanguageUpdatedAt === 'string'
              ? persisted.foreignLanguageUpdatedAt
              : null,
        };
      },
    }
  )
);
