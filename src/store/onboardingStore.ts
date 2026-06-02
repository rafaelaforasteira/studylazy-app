import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingAnswers = {
  journey: string | null;
  goal: string | null;
  studyTime: string | null;
  preparationLevel: string | null;
  acquisitionChannel: string | null;
  dailyGoal: string | null;
  notifications: string | null;
  startPreference: string | null;
};

const initialAnswers: OnboardingAnswers = {
  journey: null,
  goal: null,
  studyTime: null,
  preparationLevel: null,
  acquisitionChannel: null,
  dailyGoal: null,
  notifications: null,
  startPreference: null,
};

type OnboardingStore = {
  answers: OnboardingAnswers;
  hasCompletedOnboarding: boolean;

  setAnswer: <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K]
  ) => void;

  setAnswers: (answers: Partial<OnboardingAnswers>) => void;

  completeOnboarding: () => void;

  resetAnswers: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      answers: initialAnswers,

      hasCompletedOnboarding: false,

      setAnswer: (key, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [key]: value,
          },
        })),

      setAnswers: (answers) =>
        set((state) => ({
          answers: {
            ...state.answers,
            ...answers,
          },
        })),

      completeOnboarding: () =>
        set(() => ({
          hasCompletedOnboarding: true,
        })),

      resetAnswers: () =>
        set(() => ({
          answers: initialAnswers,
          hasCompletedOnboarding: false,
        })),
    }),
    {
      name: 'studylazy-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);