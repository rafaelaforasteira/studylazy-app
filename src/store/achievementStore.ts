import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  clearRecentlyUnlocked,
  createEmptyAchievementSnapshot,
  evaluateAchievements,
  getAchievementViews,
  recordAllDailyMissionsCompleted,
  recordCorrectAnswer,
  recordDailyMissionCompleted,
  recordLifeRecoveredFromReview,
  recordQuestionAnswered,
  recordReviewAnswered,
  recordStreakChanged,
  recordStudySessionCompleted,
  recordXpChanged,
  unlockAchievementDev,
} from '../achievements/achievementLogic';
import type {
  AchievementId,
  AchievementSnapshot,
  AchievementView,
} from '../achievements/achievementTypes';

type AchievementStore = AchievementSnapshot & {
  recordStudySessionCompleted: (amount?: number, nowMs?: number) => AchievementId[];
  recordQuestionAnswered: (amount?: number, nowMs?: number) => AchievementId[];
  recordCorrectAnswer: (amount?: number, nowMs?: number) => AchievementId[];
  recordReviewAnswered: (amount?: number, nowMs?: number) => AchievementId[];
  recordLifeRecoveredFromReview: (amount?: number, nowMs?: number) => AchievementId[];
  recordDailyMissionCompleted: (nowMs?: number) => AchievementId[];
  recordAllDailyMissionsCompleted: (nowMs?: number) => AchievementId[];
  recordXpChanged: (totalXp: number, nowMs?: number) => AchievementId[];
  recordStreakChanged: (streak: number, nowMs?: number) => AchievementId[];
  clearRecentUnlocks: () => void;
  getViews: () => AchievementView[];
  /** Dev */
  addXpSeenDev: (totalXp: number) => void;
  simulateLessonDev: () => void;
  simulateQuestionsDev: (count?: number) => void;
  simulateReviewDev: () => void;
  simulateAllMissionsDev: () => void;
  unlockTestAchievementDev: (id?: AchievementId) => void;
  resetAchievementsDev: () => void;
};

function applyEvent(
  set: (partial: Partial<AchievementStore> | AchievementSnapshot) => void,
  result: { snapshot: AchievementSnapshot; newlyUnlocked: AchievementId[] }
): AchievementId[] {
  set(result.snapshot);
  return result.newlyUnlocked;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      ...createEmptyAchievementSnapshot(),

      recordStudySessionCompleted: (amount = 1, nowMs = Date.now()) =>
        applyEvent(set, recordStudySessionCompleted(get(), amount, nowMs)),

      recordQuestionAnswered: (amount = 1, nowMs = Date.now()) =>
        applyEvent(set, recordQuestionAnswered(get(), amount, nowMs)),

      recordCorrectAnswer: (amount = 1, nowMs = Date.now()) =>
        applyEvent(set, recordCorrectAnswer(get(), amount, nowMs)),

      recordReviewAnswered: (amount = 1, nowMs = Date.now()) =>
        applyEvent(set, recordReviewAnswered(get(), amount, nowMs)),

      recordLifeRecoveredFromReview: (amount = 1, nowMs = Date.now()) =>
        applyEvent(set, recordLifeRecoveredFromReview(get(), amount, nowMs)),

      recordDailyMissionCompleted: (nowMs = Date.now()) =>
        applyEvent(set, recordDailyMissionCompleted(get(), nowMs)),

      recordAllDailyMissionsCompleted: (nowMs = Date.now()) =>
        applyEvent(set, recordAllDailyMissionsCompleted(get(), nowMs)),

      recordXpChanged: (totalXp, nowMs = Date.now()) =>
        applyEvent(set, recordXpChanged(get(), totalXp, nowMs)),

      recordStreakChanged: (streak, nowMs = Date.now()) =>
        applyEvent(set, recordStreakChanged(get(), streak, nowMs)),

      clearRecentUnlocks: () => {
        set(clearRecentlyUnlocked(get()));
      },

      getViews: () => getAchievementViews(get()),

      addXpSeenDev: (totalXp) => {
        get().recordXpChanged(totalXp);
      },

      simulateLessonDev: () => {
        get().recordStudySessionCompleted(1);
      },

      simulateQuestionsDev: (count = 10) => {
        get().recordQuestionAnswered(count);
        get().recordCorrectAnswer(Math.min(count, 7));
      },

      simulateReviewDev: () => {
        get().recordReviewAnswered(1);
      },

      simulateAllMissionsDev: () => {
        get().recordAllDailyMissionsCompleted();
      },

      unlockTestAchievementDev: (id = 'first_lesson') => {
        set(unlockAchievementDev(get(), id));
      },

      resetAchievementsDev: () => {
        set(createEmptyAchievementSnapshot());
      },
    }),
    {
      name: 'studylazy-achievements',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<AchievementSnapshot>;
        const base = createEmptyAchievementSnapshot();
        return evaluateAchievements({
          counters: {
            ...base.counters,
            ...(state.counters ?? {}),
          },
          unlocked: Array.isArray(state.unlocked) ? state.unlocked : [],
          recentlyUnlocked: Array.isArray(state.recentlyUnlocked)
            ? state.recentlyUnlocked
            : [],
        }).snapshot;
      },
      partialize: (state) => ({
        counters: state.counters,
        unlocked: state.unlocked,
        recentlyUnlocked: state.recentlyUnlocked,
      }),
    }
  )
);
