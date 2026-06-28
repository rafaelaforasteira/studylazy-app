import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getLocalDateKey } from '../utils/date';
import {
  computeLessonResult,
  defaultCompleteLessonContext,
  type LessonHistoryItem,
} from './progressLogic';

export type { LessonHistoryItem } from './progressLogic';

/**
 * Histórico de desempenho por questão usado pelo motor de seleção inteligente.
 * Chaveado pelo identificador estável da questão (ver getStableQuestionId).
 */
export type QuestionPerformance = {
  stableQuestionId: string;
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  lastAnsweredAt: string | null;
  lastResult: 'correct' | 'incorrect' | null;
};

export type RecordQuestionResultParams = {
  stableQuestionId: string;
  isCorrect: boolean;
  topic?: string;
  subject?: string;
  answeredAt?: string;
};

/** Máximo de IDs mantidos na janela de questões respondidas recentemente. */
export const RECENT_QUESTION_LIMIT = 30;

type CompleteLessonParams = {
  minutes: number;
  totalQuestions: number;
  correctAnswers: number;
  subject: string;
};

type CompleteLessonResult = {
  earnedXp: number;
  isRepeat: boolean;
};

type StudyProgressStore = {
  studiedMinutesToday: number;
  answeredQuestionsToday: number;
  correctAnswersToday: number;
  completedTasksToday: string[];

  xp: number;
  sessionsCompleted: number;
  streak: number;

  lastStudyDate: string | null;
  dailyProgressDate: string | null;

  lessonHistory: LessonHistoryItem[];

  questionPerformance: Record<string, QuestionPerformance>;
  recentQuestionIds: string[];

  completeLesson: (params: CompleteLessonParams) => CompleteLessonResult;
  recordQuestionResult: (params: RecordQuestionResultParams) => void;
  ensureTodayProgress: () => void;
  resetProgress: () => void;
};

const initialProgress = {
  studiedMinutesToday: 0,
  answeredQuestionsToday: 0,
  correctAnswersToday: 0,
  completedTasksToday: [],

  xp: 0,
  sessionsCompleted: 0,
  streak: 0,

  lastStudyDate: null,
  dailyProgressDate: null,

  lessonHistory: [],

  questionPerformance: {} as Record<string, QuestionPerformance>,
  recentQuestionIds: [] as string[],
};

export const useStudyProgressStore =
  create<StudyProgressStore>()(
    persist(
      (set, get) => ({
        ...initialProgress,

        completeLesson: (params) => {
          const state = get();

          const { patch, result } = computeLessonResult(
            state,
            params,
            defaultCompleteLessonContext()
          );

          set(patch);

          return result;
        },

        recordQuestionResult: ({
          stableQuestionId,
          isCorrect,
          answeredAt,
        }) =>
          set((state) => {
            if (!stableQuestionId) {
              return state;
            }

            const answeredAtIso = answeredAt ?? new Date().toISOString();

            const existing =
              state.questionPerformance?.[stableQuestionId] ?? {
                stableQuestionId,
                attempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                lastAnsweredAt: null,
                lastResult: null,
              };

            const updatedPerformance: QuestionPerformance = {
              stableQuestionId,
              attempts: existing.attempts + 1,
              correctAttempts:
                existing.correctAttempts + (isCorrect ? 1 : 0),
              incorrectAttempts:
                existing.incorrectAttempts + (isCorrect ? 0 : 1),
              lastAnsweredAt: answeredAtIso,
              lastResult: isCorrect ? 'correct' : 'incorrect',
            };

            const previousRecent = state.recentQuestionIds ?? [];
            const recentQuestionIds = [
              stableQuestionId,
              ...previousRecent.filter((id) => id !== stableQuestionId),
            ].slice(0, RECENT_QUESTION_LIMIT);

            return {
              questionPerformance: {
                ...(state.questionPerformance ?? {}),
                [stableQuestionId]: updatedPerformance,
              },
              recentQuestionIds,
            };
          }),

        ensureTodayProgress: () =>
          set((state) => {
            const today = getLocalDateKey();

            const savedDailyDate =
              state.dailyProgressDate ??
              state.lastStudyDate;

            if (savedDailyDate === today) {
              return {
                ...state,
                dailyProgressDate: today,
              };
            }

            return {
              ...state,

              studiedMinutesToday: 0,
              answeredQuestionsToday: 0,
              correctAnswersToday: 0,
              completedTasksToday: [],

              dailyProgressDate: today,

              xp: state.xp,
              sessionsCompleted: state.sessionsCompleted,
              streak: state.streak,
              lastStudyDate: state.lastStudyDate,
              lessonHistory: state.lessonHistory || [],
            };
          }),

        resetProgress: () =>
          set(() => ({
            ...initialProgress,
          })),
      }),
      {
        name: 'studylazy-progress',
        storage: createJSONStorage(() => AsyncStorage),
        version: 1,
        migrate: (persistedState, version) => {
          const state = (persistedState ?? {}) as Partial<StudyProgressStore>;

          if (version < 1) {
            return {
              ...state,
              questionPerformance: state.questionPerformance ?? {},
              recentQuestionIds: state.recentQuestionIds ?? [],
            };
          }

          return state;
        },
        merge: (persistedState, currentState) => {
          const persisted = (persistedState ?? {}) as Partial<StudyProgressStore>;

          return {
            ...currentState,
            ...persisted,
            questionPerformance: persisted.questionPerformance ?? {},
            recentQuestionIds: persisted.recentQuestionIds ?? [],
            lessonHistory: persisted.lessonHistory ?? [],
            completedTasksToday: persisted.completedTasksToday ?? [],
          };
        },
      }
    )
  );
