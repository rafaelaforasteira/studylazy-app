import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LessonMistakeInput = {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
};

export type MistakeItem = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  errorCount: number;
  lastAnsweredAt: string;
};

type MistakeStore = {
  mistakes: MistakeItem[];

  addLessonMistakes: (
    subject: string,
    mistakes: LessonMistakeInput[]
  ) => void;

  removeMistake: (id: string) => void;
  clearMistakes: () => void;
};

export const useMistakeStore = create<MistakeStore>()(
  persist(
    (set) => ({
      mistakes: [],

      addLessonMistakes: (subject, newMistakes) =>
        set((state) => {
          if (newMistakes.length === 0) {
            return state;
          }

          const updatedMistakes = [...state.mistakes];

          newMistakes.forEach((mistake) => {
            const existingMistakeIndex =
              updatedMistakes.findIndex(
                (savedMistake) =>
                  savedMistake.subject === subject &&
                  savedMistake.question === mistake.question
              );

            if (existingMistakeIndex >= 0) {
              const existingMistake =
                updatedMistakes[existingMistakeIndex];

              updatedMistakes[existingMistakeIndex] = {
                ...existingMistake,
                options: mistake.options,
                selectedAnswer: mistake.selectedAnswer,
                correctAnswer: mistake.correctAnswer,
                errorCount: existingMistake.errorCount + 1,
                lastAnsweredAt: new Date().toISOString(),
              };

              return;
            }

            updatedMistakes.unshift({
              id: `${subject}-${Date.now()}-${Math.random()}`,
              subject,
              question: mistake.question,
              options: mistake.options,
              selectedAnswer: mistake.selectedAnswer,
              correctAnswer: mistake.correctAnswer,
              errorCount: 1,
              lastAnsweredAt: new Date().toISOString(),
            });
          });

          return {
            mistakes: updatedMistakes,
          };
        }),

      removeMistake: (id) =>
        set((state) => ({
          mistakes: state.mistakes.filter(
            (mistake) => mistake.id !== id
          ),
        })),

      clearMistakes: () =>
        set({
          mistakes: [],
        }),
    }),
    {
      name: 'studylazy-mistakes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);