import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applyUnlimitedFlag,
  canStartStudy,
  createInitialLivesSnapshot,
  formatMsUntilNextLife,
  loseLife,
  msUntilNextLife,
  regenerateLives,
  restoreOneLife,
} from '../lives/livesLogic';
import { MAX_LIVES, type LivesSnapshot } from '../lives/livesTypes';

type LivesStore = LivesSnapshot & {
  /** Chave da última perda aplicada (anti-duplo-toque / reprocessamento). */
  lastLossKey: string | null;
  hydrateRegeneration: (nowMs?: number) => void;
  loseOneLife: (lossKey?: string | null, nowMs?: number) => boolean;
  restoreOne: (nowMs?: number) => void;
  setUnlimited: (unlimited: boolean) => void;
  canStudy: (nowMs?: number) => ReturnType<typeof canStartStudy>;
  getMsUntilNextLife: (nowMs?: number) => number | null;
  getTimeUntilNextLabel: (nowMs?: number) => string | null;
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

export const useLivesStore = create<LivesStore>()(
  persist(
    (set, get) => ({
      ...createInitialLivesSnapshot(),
      lastLossKey: null,

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

      resetLivesDev: () => {
        set({
          ...createInitialLivesSnapshot(),
          lastLossKey: null,
        });
      },
    }),
    {
      name: 'studylazy-lives',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<LivesSnapshot> & {
          lastLossKey?: string | null;
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
          lastLossKey: state.lastLossKey ?? null,
        };
      },
      partialize: (state) => ({
        currentLives: state.currentLives,
        maxLives: state.maxLives,
        lastLifeRegeneratedAt: state.lastLifeRegeneratedAt,
        lastLifeLostAt: state.lastLifeLostAt,
        totalLivesLost: state.totalLivesLost,
        isUnlimited: state.isUnlimited,
        lastLossKey: state.lastLossKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateRegeneration();
      },
    }
  )
);
