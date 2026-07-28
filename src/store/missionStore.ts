import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applyMissionProgress,
  areAllMissionsCompleted,
  claimDailyBonus,
  claimMissionReward,
  countCompletedMissions,
  createEmptyMissionsSnapshot,
  ensureMissionsForDate,
  getMissionDateKey,
} from '../missions/missionLogic';
import type {
  ClaimDailyBonusResult,
  ClaimMissionResult,
  DailyMission,
  DailyMissionsSnapshot,
} from '../missions/missionTypes';
import { useLivesStore } from './livesStore';
import { useStudyProgressStore } from './studyProgressStore';
import { useAchievementStore } from './achievementStore';

type MissionStore = DailyMissionsSnapshot & {
  ensureToday: (nowMs?: number) => void;
  recordLessonSession: (params: {
    answeredQuestions: number;
    correctAnswers: number;
    nowMs?: number;
  }) => void;
  recordReviewAnswer: (nowMs?: number) => void;
  claimMission: (missionId: string, nowMs?: number) => ClaimMissionResult;
  claimAllMissionsBonus: (nowMs?: number) => ClaimDailyBonusResult;
  getCompletedCount: () => number;
  areAllCompleted: () => boolean;
  /** Dev helpers */
  simulateLessonDev: () => void;
  simulateAnswersDev: (count?: number) => void;
  simulateCorrectDev: (count?: number) => void;
  simulateReviewsDev: (count?: number) => void;
  claimAllRewardsDev: () => void;
  resetMissionsDev: () => void;
  forceNewDayDev: (dateKey?: string) => void;
};

function applyXp(amount: number) {
  if (amount > 0) {
    useStudyProgressStore.getState().addBonusXp(amount);
    const xp = useStudyProgressStore.getState().xp;
    useAchievementStore.getState().recordXpChanged(xp);
  }
}

function notifyMissionAchievements(allCompleted: boolean) {
  if (!allCompleted) {
    return;
  }
  const achievements = useAchievementStore.getState();
  if (
    achievements.unlocked.some((item) => item.id === 'all_daily_missions')
  ) {
    return;
  }
  achievements.recordAllDailyMissionsCompleted();
}

function applyFragmentIfNeeded(shouldGrant: boolean) {
  if (shouldGrant) {
    useLivesStore.getState().grantLifeFragment();
  }
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      ...createEmptyMissionsSnapshot(),

      ensureToday: (nowMs = Date.now()) => {
        const dateKey = getMissionDateKey(new Date(nowMs));
        set((state) => ensureMissionsForDate(state, dateKey));
      },

      recordLessonSession: ({
        answeredQuestions,
        correctAnswers,
        nowMs = Date.now(),
      }) => {
        set((state) => {
          let next = applyMissionProgress(
            state,
            { type: 'complete_lesson', amount: 1 },
            nowMs
          );
          if (answeredQuestions > 0) {
            next = applyMissionProgress(
              next,
              { type: 'answer_questions', amount: answeredQuestions },
              nowMs
            );
          }
          if (correctAnswers > 0) {
            next = applyMissionProgress(
              next,
              { type: 'correct_answers', amount: correctAnswers },
              nowMs
            );
          }
          return next;
        });
        if (areAllMissionsCompleted(get())) {
          notifyMissionAchievements(true);
        }
      },

      recordReviewAnswer: (nowMs = Date.now()) => {
        set((state) =>
          applyMissionProgress(
            state,
            { type: 'review_mistakes', amount: 1 },
            nowMs
          )
        );
        if (areAllMissionsCompleted(get())) {
          notifyMissionAchievements(true);
        }
      },

      claimMission: (missionId, nowMs = Date.now()) => {
        const state = get();
        const { snapshot, result } = claimMissionReward(
          state,
          missionId,
          nowMs
        );
        set(snapshot);
        if (result.applied) {
          applyXp(result.xpAwarded);
          useAchievementStore.getState().recordDailyMissionCompleted(nowMs);
          notifyMissionAchievements(areAllMissionsCompleted(snapshot));
        }
        return result;
      },

      claimAllMissionsBonus: (nowMs = Date.now()) => {
        const state = get();
        const { snapshot, result } = claimDailyBonus(state, nowMs);
        set(snapshot);
        if (result.applied && result.shouldGrantFragment) {
          applyFragmentIfNeeded(true);
          notifyMissionAchievements(true);
        }
        return result;
      },

      getCompletedCount: () => countCompletedMissions(get()),

      areAllCompleted: () => areAllMissionsCompleted(get()),

      simulateLessonDev: () => {
        get().recordLessonSession({
          answeredQuestions: 0,
          correctAnswers: 0,
        });
      },

      simulateAnswersDev: (count = 10) => {
        set((state) =>
          applyMissionProgress(state, {
            type: 'answer_questions',
            amount: count,
          })
        );
      },

      simulateCorrectDev: (count = 7) => {
        set((state) =>
          applyMissionProgress(state, {
            type: 'correct_answers',
            amount: count,
          })
        );
      },

      simulateReviewsDev: (count = 3) => {
        set((state) =>
          applyMissionProgress(state, {
            type: 'review_mistakes',
            amount: count,
          })
        );
      },

      claimAllRewardsDev: () => {
        const state = get();
        for (const mission of state.missions) {
          if (mission.status === 'completed') {
            get().claimMission(mission.id);
          }
        }
        if (areAllMissionsCompleted(get()) && !get().dailyBonusClaimed) {
          get().claimAllMissionsBonus();
        }
      },

      resetMissionsDev: () => {
        set(createEmptyMissionsSnapshot(getMissionDateKey()));
      },

      forceNewDayDev: (_dateKey) => {
        const today = getMissionDateKey();
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getMissionDateKey(yesterdayDate);
        // Simula progresso de ontem e aplica reset do dia atual.
        let snap = createEmptyMissionsSnapshot(yesterday);
        snap = applyMissionProgress(
          snap,
          { type: 'complete_lesson', amount: 1 },
          yesterdayDate.getTime()
        );
        set(ensureMissionsForDate(snap, today));
      },
    }),
    {
      name: 'studylazy-daily-missions',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<DailyMissionsSnapshot>;
        const dateKey =
          typeof state.dateKey === 'string' && state.dateKey
            ? state.dateKey
            : getMissionDateKey();
        return ensureMissionsForDate(
          {
            dateKey,
            missions: Array.isArray(state.missions)
              ? (state.missions as DailyMission[])
              : [],
            dailyBonusClaimed: Boolean(state.dailyBonusClaimed),
            dailyBonusClaimedAt: state.dailyBonusClaimedAt ?? null,
          },
          dateKey
        );
      },
      partialize: (state) => ({
        dateKey: state.dateKey,
        missions: state.missions,
        dailyBonusClaimed: state.dailyBonusClaimed,
        dailyBonusClaimedAt: state.dailyBonusClaimedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.ensureToday();
      },
    }
  )
);
