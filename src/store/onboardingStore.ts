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

  setAnswer: <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K]
  ) => void;

  setAnswers: (answers: Partial<OnboardingAnswers>) => void;

  resetAnswers: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  answers: initialAnswers,

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

  resetAnswers: () =>
    set(() => ({
      answers: initialAnswers,
    })),
}));