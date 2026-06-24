import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  QuestionContentFormat,
  QuestionOriginType,
} from '../data/questionTypes';

export type LessonMistakeInput = {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  externalId?: string;
  originType?: QuestionOriginType;
  verified?: boolean;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  prompt?: string;
  contentFormat?: QuestionContentFormat;
};

export type MistakeItem = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  externalId?: string;
  originType?: QuestionOriginType;
  verified?: boolean;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  prompt?: string;
  contentFormat?: QuestionContentFormat;
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

function matchesMistake(
  saved: MistakeItem,
  incoming: LessonMistakeInput,
  subject: string
) {
  if (saved.subject !== subject) {
    return false;
  }

  if (incoming.externalId && saved.externalId) {
    return saved.externalId === incoming.externalId;
  }

  return saved.question === incoming.question;
}

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
            const existingMistakeIndex = updatedMistakes.findIndex(
              (savedMistake) => matchesMistake(savedMistake, mistake, subject)
            );

            if (existingMistakeIndex >= 0) {
              const existingMistake =
                updatedMistakes[existingMistakeIndex];

              updatedMistakes[existingMistakeIndex] = {
                ...existingMistake,
                options: mistake.options,
                selectedAnswer: mistake.selectedAnswer,
                correctAnswer: mistake.correctAnswer,
                externalId: mistake.externalId ?? existingMistake.externalId,
                originType: mistake.originType ?? existingMistake.originType,
                verified: mistake.verified ?? existingMistake.verified,
                source: mistake.source ?? existingMistake.source,
                year: mistake.year ?? existingMistake.year,
                area: mistake.area ?? existingMistake.area,
                topic: mistake.topic ?? existingMistake.topic,
                supportTitle:
                  mistake.supportTitle ?? existingMistake.supportTitle,
                supportText: mistake.supportText ?? existingMistake.supportText,
                sourceCitation:
                  mistake.sourceCitation ?? existingMistake.sourceCitation,
                prompt: mistake.prompt ?? existingMistake.prompt,
                contentFormat:
                  mistake.contentFormat ?? existingMistake.contentFormat,
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
              externalId: mistake.externalId,
              originType: mistake.originType,
              verified: mistake.verified,
              source: mistake.source,
              year: mistake.year,
              area: mistake.area,
              topic: mistake.topic,
              supportTitle: mistake.supportTitle,
              supportText: mistake.supportText,
              sourceCitation: mistake.sourceCitation,
              prompt: mistake.prompt,
              contentFormat: mistake.contentFormat,
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
