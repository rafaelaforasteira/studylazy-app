import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getLocalDateKey, getYesterdayDateKey } from '../utils/date';

type CompleteLessonParams = {
  minutes: number;
  totalQuestions: number;
  correctAnswers: number;
  subject: string;
};

export type LessonHistoryItem = {
  id: string;
  subject: string;
  minutes: number;
  totalQuestions: number;
  correctAnswers: number;
  earnedXp: number;
  date: string;
  isRepeat?: boolean;
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

  completeLesson: (params: CompleteLessonParams) => CompleteLessonResult;
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
};

function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number
) {
  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();

  if (lastStudyDate === today) {
    return currentStreak;
  }

  if (lastStudyDate === yesterday) {
    return currentStreak + 1;
  }

  return 1;
}

function calculateXp(
  totalQuestions: number,
  correctAnswers: number
) {
  const xpPerQuestion = 5;
  const bonusPerCorrectAnswer = 5;

  return (
    totalQuestions * xpPerQuestion +
    correctAnswers * bonusPerCorrectAnswer
  );
}

export const useStudyProgressStore =
  create<StudyProgressStore>()(
    persist(
      (set, get) => ({
        ...initialProgress,

        completeLesson: ({
          minutes,
          totalQuestions,
          correctAnswers,
          subject,
        }) => {
          const today = getLocalDateKey();
          const state = get();

          const isNewDailyCycle =
            state.dailyProgressDate !== today;

          const baseStudiedMinutesToday = isNewDailyCycle
            ? 0
            : state.studiedMinutesToday;

          const baseAnsweredQuestionsToday = isNewDailyCycle
            ? 0
            : state.answeredQuestionsToday;

          const baseCorrectAnswersToday = isNewDailyCycle
            ? 0
            : state.correctAnswersToday;

          const baseCompletedTasksToday = isNewDailyCycle
            ? []
            : state.completedTasksToday || [];

          const taskWasAlreadyCompleted =
            baseCompletedTasksToday.includes(subject);

          const earnedXp = taskWasAlreadyCompleted
            ? 0
            : calculateXp(totalQuestions, correctAnswers);

          const newStreak = calculateStreak(
            state.lastStudyDate,
            state.streak
          );

          const updatedCompletedTasks = taskWasAlreadyCompleted
            ? baseCompletedTasksToday
            : [...baseCompletedTasksToday, subject];

          const newHistoryItem: LessonHistoryItem = {
            id: `${subject}-${Date.now()}`,
            subject,
            minutes,
            totalQuestions,
            correctAnswers,
            earnedXp,
            date: today,
            isRepeat: taskWasAlreadyCompleted,
          };

          set({
            studiedMinutesToday:
              baseStudiedMinutesToday + minutes,

            answeredQuestionsToday:
              baseAnsweredQuestionsToday + totalQuestions,

            correctAnswersToday:
              baseCorrectAnswersToday + correctAnswers,

            completedTasksToday: updatedCompletedTasks,

            xp: state.xp + earnedXp,

            sessionsCompleted:
              state.sessionsCompleted + 1,

            streak: newStreak,

            lastStudyDate: today,

            dailyProgressDate: today,

            lessonHistory: [
              newHistoryItem,
              ...(state.lessonHistory || []),
            ],
          });

          return {
            earnedXp,
            isRepeat: taskWasAlreadyCompleted,
          };
        },

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
      }
    )
  );
