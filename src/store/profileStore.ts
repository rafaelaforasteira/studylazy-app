import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProfileStore = {
  name: string;
  setName: (name: string) => void;
  resetProfile: () => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      name: 'Estudante',

      setName: (name) =>
        set({
          name: name.trim() || 'Estudante',
        }),

      resetProfile: () =>
        set({
          name: 'Estudante',
        }),
    }),
    {
      name: 'studylazy-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);