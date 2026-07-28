import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addReviewFragmentDev,
  applyUnlimitedFlag,
  canStartStudy,
  clearReviewRewardHistory,
  clampLifeFragments,
  createInitialLivesSnapshot,
  formatMsUntilNextLife,
  loseLife,
  msUntilNextLife,
  regenerateLives,
  restoreOneLife,
  rewardReviewCorrect,
  trimReviewRewardHistory,
} from '../lives/livesLogic';
import {
  MAX_LIVES,
  type LivesSnapshot,
  type ReviewRewardRecord,
  type ReviewRewardResult,
} from '../lives/livesTypes';

type LivesStore = LivesSnapshot & {
  /** Chave da última perda aplicada (anti-duplo-toque / reprocessamento). */
  lastLossKey: string | null;
  /** Chave da última recompensa de revisão (anti-duplo-toque). */
  lastReviewRewardKey: string | null;
  hydrateRegeneration: (nowMs?: number) => void;
  loseOneLife: (lossKey?: string | null, nowMs?: number) => boolean;
  restoreOne: (nowMs?: number) => void;
  setUnlimited: (unlimited: boolean) => void;
  canStudy: (nowMs?: number) => ReturnType<typeof canStartStudy>;
  getMsUntilNextLife: (nowMs?: number) => number | null;
  getTimeUntilNextLabel: (nowMs?: number) => string | null;
  rewardFromReviewCorrect: (params: {
    stableQuestionId: string;
    isEligibleOfficial: boolean;
    nowMs?: number;
  }) => ReviewRewardResult;
  addFragmentDev: (nowMs?: number) => void;
  /** Alias semântico: concede 1 fragmento (missões / recompensas). */
  grantLifeFragment: (nowMs?: number) => void;
  completeLifeFromReviewDev: (nowMs?: number) => void;
  clearReviewRewardsDev: () => void;
  resetLivesDev: () => void;
};

function applyRegen(state: LivesSnapshot, nowMs = Date.now()): Partial<LivesStore> {
  const result = regenerateLives(state, nowMs);
  if (result.regenerated === 0 && result.lives === state.currentLives) {
    return {};
  }
  return {
    currentLives: result.lives,
    lastLifeRegeneratedAt: result.lastLifeRegeneratedAt,
  };
}

function normalizeHistory(
  history: unknown
): ReviewRewardRecord[] {
  if (!Array.isArray(history)) {
    return [];
  }
  const cleaned: ReviewRewardRecord[] = [];
  for (const item of history) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Partial<ReviewRewardRecord>;
    const id =
      typeof record.stableQuestionId === 'string'
        ? record.stableQuestionId.trim()
        : '';
    const rewardedAt =
      typeof record.rewardedAt === 'string' ? record.rewardedAt : '';
    if (!id || !rewardedAt) continue;
    cleaned.push({ stableQuestionId: id, rewardedAt });
  }
  return trimReviewRewardHistory(cleaned);
}

export const useLivesStore = create<LivesStore>()(
  persist(
    (set, get) => ({
      ...createInitialLivesSnapshot(),
      lastLossKey: null,
      lastReviewRewardKey: null,

      hydrateRegeneration: (nowMs = Date.now()) => {
        set((state) => applyRegen(state, nowMs));
      },

      loseOneLife: (lossKey = null, nowMs = Date.now()) => {
        const state = get();
        const { snapshot, result } = loseLife({
          snapshot: state,
          alreadyLostForKey: state.lastLossKey,
          lossKey,
          nowMs,
        });
        set({
          ...snapshot,
          lastLossKey: result.applied && lossKey ? lossKey : state.lastLossKey,
        });
        return result.applied;
      },

      restoreOne: (nowMs = Date.now()) => {
        set((state) => restoreOneLife(state, nowMs));
      },

      setUnlimited: (unlimited) => {
        set((state) => applyUnlimitedFlag(state, unlimited));
      },

      canStudy: (nowMs = Date.now()) => {
        const state = get();
        const regen = regenerateLives(state, nowMs);
        if (regen.regenerated > 0 || regen.lives !== state.currentLives) {
          set({
            currentLives: regen.lives,
            lastLifeRegeneratedAt: regen.lastLifeRegeneratedAt,
          });
        }
        return canStartStudy(
          {
            ...state,
            currentLives: regen.lives,
            lastLifeRegeneratedAt: regen.lastLifeRegeneratedAt,
          },
          nowMs
        );
      },

      getMsUntilNextLife: (nowMs = Date.now()) => {
        const state = get();
        return msUntilNextLife(state, nowMs);
      },

      getTimeUntilNextLabel: (nowMs = Date.now()) => {
        return formatMsUntilNextLife(get().getMsUntilNextLife(nowMs));
      },

      rewardFromReviewCorrect: ({
        stableQuestionId,
        isEligibleOfficial,
        nowMs = Date.now(),
      }) => {
        const state = get();
        const id = stableQuestionId.trim();

        // Anti-duplo-toque na mesma questão nesta sessão de store.
        if (id && state.lastReviewRewardKey === id) {
          return {
            applied: false,
            recoveredLife: false,
            lifeFragments: clampLifeFragments(state.lifeFragments),
            currentLives: state.currentLives,
            reason: 'already_rewarded',
            message: null,
          };
        }

        const { snapshot, result } = rewardReviewCorrect({
          snapshot: state,
          stableQuestionId: id,
          isEligibleOfficial,
          nowMs,
        });

        if (result.applied) {
          set({
            ...snapshot,
            lastReviewRewardKey: id || state.lastReviewRewardKey,
          });
        } else {
          set(snapshot);
        }

        return result;
      },

      addFragmentDev: (nowMs = Date.now()) => {
        set((state) => addReviewFragmentDev(state, nowMs));
      },

      grantLifeFragment: (nowMs = Date.now()) => {
        set((state) => addReviewFragmentDev(state, nowMs));
      },

      completeLifeFromReviewDev: (nowMs = Date.now()) => {
        set((state) => {
          let next = addReviewFragmentDev(state, nowMs);
          if (next.lifeFragments === 1) {
            next = addReviewFragmentDev(next, nowMs + 1);
          }
          return next;
        });
      },

      clearReviewRewardsDev: () => {
        set((state) => ({
          ...clearReviewRewardHistory(state),
          lastReviewRewardKey: null,
        }));
      },

      resetLivesDev: () => {
        set({
          ...createInitialLivesSnapshot(),
          lastLossKey: null,
          lastReviewRewardKey: null,
        });
      },
    }),
    {
      name: 'studylazy-lives',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<LivesSnapshot> & {
          lastLossKey?: string | null;
          lastReviewRewardKey?: string | null;
        };
        return {
          ...createInitialLivesSnapshot(),
          currentLives:
            typeof state.currentLives === 'number'
              ? Math.max(0, Math.min(MAX_LIVES, state.currentLives))
              : MAX_LIVES,
          maxLives: MAX_LIVES,
          lastLifeRegeneratedAt: state.lastLifeRegeneratedAt ?? null,
          lastLifeLostAt: state.lastLifeLostAt ?? null,
          totalLivesLost:
            typeof state.totalLivesLost === 'number' ? state.totalLivesLost : 0,
          isUnlimited: Boolean(state.isUnlimited),
          lifeFragments: clampLifeFragments(state.lifeFragments ?? 0),
          totalLivesRecoveredFromReview:
            typeof state.totalLivesRecoveredFromReview === 'number'
              ? Math.max(0, state.totalLivesRecoveredFromReview)
              : 0,
          lastLifeRecoveredFromReviewAt:
            state.lastLifeRecoveredFromReviewAt ?? null,
          reviewRewardHistory: normalizeHistory(state.reviewRewardHistory),
          lastLossKey: state.lastLossKey ?? null,
          lastReviewRewardKey: state.lastReviewRewardKey ?? null,
        };
      },
      partialize: (state) => ({
        currentLives: state.currentLives,
        maxLives: state.maxLives,
        lastLifeRegeneratedAt: state.lastLifeRegeneratedAt,
        lastLifeLostAt: state.lastLifeLostAt,
        totalLivesLost: state.totalLivesLost,
        isUnlimited: state.isUnlimited,
        lifeFragments: state.lifeFragments,
        totalLivesRecoveredFromReview: state.totalLivesRecoveredFromReview,
        lastLifeRecoveredFromReviewAt: state.lastLifeRecoveredFromReviewAt,
        reviewRewardHistory: state.reviewRewardHistory,
        lastLossKey: state.lastLossKey,
        lastReviewRewardKey: state.lastReviewRewardKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateRegeneration();
      },
    }
  )
);
