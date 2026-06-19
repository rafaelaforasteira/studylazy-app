import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

  completeLesson: (params: CompleteLessonParams) => void;
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

function addZero(value: number) {
  return String(value).padStart(2, '0');
}

/**
 * Cria uma data no formato AAAA-MM-DD usando o horário local
 * do aparelho, e não o horário UTC.
 */
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());

  return `${year}-${month}-${day}`;
}

function getYesterdayDateKey() {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  return getLocalDateKey(yesterday);
}

function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number
) {
  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();

  // Já estudou hoje: mantém a sequência atual.
  if (lastStudyDate === today) {
    return currentStreak;
  }

  // Estudou ontem: aumenta a sequência.
  if (lastStudyDate === yesterday) {
    return currentStreak + 1;
  }

  // Primeiro estudo ou sequência perdida.
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
      (set) => ({
        ...initialProgress,

        completeLesson: ({
          minutes,
          totalQuestions,
          correctAnswers,
          subject,
        }) =>
          set((state) => {
            const today = getLocalDateKey();

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

            const earnedXp = calculateXp(
              totalQuestions,
              correctAnswers
            );

            const newStreak = calculateStreak(
              state.lastStudyDate,
              state.streak
            );

            const taskWasAlreadyCompleted =
              baseCompletedTasksToday.includes(subject);

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
            };

            return {
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
            };
          }),

        ensureTodayProgress: () =>
          set((state) => {
            const today = getLocalDateKey();

            /*
             * Compatibilidade com dados antigos:
             * caso dailyProgressDate ainda não exista, usamos
             * lastStudyDate como referência temporária.
             */
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

              /*
               * Esses dados não são apagados diariamente.
               */
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