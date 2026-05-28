import { create } from 'zustand';

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

type OnboardingStore = {
  answers: OnboardingAnswers;
  setAnswer: <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K]
  ) => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  answers: {
    journey: null,
    goal: null,
    studyTime: null,
    preparationLevel: null,
    acquisitionChannel: null,
    dailyGoal: null,
    notifications: null,
    startPreference: null,
  },

  setAnswer: (key, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [key]: value,
      },
    })),
}));