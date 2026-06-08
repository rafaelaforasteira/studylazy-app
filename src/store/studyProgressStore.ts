import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CompleteLessonParams = {
  minutes: number;
  totalQuestions: number;
  correctAnswers: number;
  subject: string;
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

  completeLesson: (params: CompleteLessonParams) => void;
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
};

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  return date.toISOString().split('T')[0];
}

function calculateStreak(lastStudyDate: string | null, currentStreak: number) {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (lastStudyDate === today) {
    return currentStreak;
  }

  if (lastStudyDate === yesterday) {
    return currentStreak + 1;
  }

  return 1;
}

function calculateXp(totalQuestions: number, correctAnswers: number) {
  const xpPerQuestion = 5;
  const bonusPerCorrectAnswer = 5;

  return totalQuestions * xpPerQuestion + correctAnswers * bonusPerCorrectAnswer;
}

export const useStudyProgressStore = create<StudyProgressStore>()(
  persist(
    (set) => ({
      ...initialProgress,

      completeLesson: ({ minutes, totalQuestions, correctAnswers, subject }) =>
        set((state) => {
          const today = getTodayDate();

          const isNewDay = state.lastStudyDate !== today;

          const baseStudiedMinutesToday = isNewDay
            ? 0
            : state.studiedMinutesToday;

          const baseAnsweredQuestionsToday = isNewDay
            ? 0
            : state.answeredQuestionsToday;

          const baseCorrectAnswersToday = isNewDay
            ? 0
            : state.correctAnswersToday;

          const baseCompletedTasksToday = isNewDay
            ? []
            : state.completedTasksToday;

          const earnedXp = calculateXp(totalQuestions, correctAnswers);
          const newStreak = calculateStreak(state.lastStudyDate, state.streak);

          const alreadyCompletedTask =
            baseCompletedTasksToday.includes(subject);

          const updatedCompletedTasksToday = alreadyCompletedTask
            ? baseCompletedTasksToday
            : [...baseCompletedTasksToday, subject];

          return {
            studiedMinutesToday: baseStudiedMinutesToday + minutes,

            answeredQuestionsToday:
              baseAnsweredQuestionsToday + totalQuestions,

            correctAnswersToday:
              baseCorrectAnswersToday + correctAnswers,

            completedTasksToday: updatedCompletedTasksToday,

            xp: state.xp + earnedXp,

            sessionsCompleted: state.sessionsCompleted + 1,

            streak: newStreak,

            lastStudyDate: today,
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