import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  classifyNpsScore,
  createDismissedUntil,
  createFeedbackId,
  sanitizeComment,
  shouldShowNpsPrompt,
} from '../feedback/feedbackLogic';
import type {
  FeedbackCategory,
  FeedbackEntry,
  FeedbackKind,
  NpsPromptContext,
  NpsPromptDecision,
} from '../feedback/feedbackTypes';

type SubmitNpsInput = {
  score: number;
  comment?: string | null;
  improvement?: string | null;
  screen?: string | null;
  userId?: string | null;
  guestId?: string | null;
};

type SubmitGeneralInput = {
  kind: Exclude<FeedbackKind, 'nps'>;
  category?: FeedbackCategory | null;
  comment: string;
  screen?: string | null;
  userId?: string | null;
  guestId?: string | null;
};

type FeedbackStore = {
  entries: FeedbackEntry[];
  firstOpenedAt: string | null;
  lastNpsShownAt: string | null;
  dismissedUntil: string | null;
  lastNpsSubmittedAt: string | null;

  ensureFirstOpened: (nowMs?: number) => void;
  markNpsShown: (nowMs?: number) => void;
  dismissNpsTemporarily: (nowMs?: number) => void;
  submitNps: (input: SubmitNpsInput) => FeedbackEntry | null;
  submitGeneral: (input: SubmitGeneralInput) => FeedbackEntry | null;
  markSynced: (id: string, syncedAt?: string) => void;
  markFailed: (id: string) => void;
  getPending: () => FeedbackEntry[];
  canShowNps: (
    context: Omit<
      NpsPromptContext,
      | 'firstOpenedAt'
      | 'lastNpsShownAt'
      | 'dismissedUntil'
      | 'hasSubmittedNps'
    >
  ) => NpsPromptDecision;
  resetFeedbackDev: () => void;
};

function appVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

function platformName(): string {
  return Platform.OS;
}

const initialState = {
  entries: [] as FeedbackEntry[],
  firstOpenedAt: null as string | null,
  lastNpsShownAt: null as string | null,
  dismissedUntil: null as string | null,
  lastNpsSubmittedAt: null as string | null,
};

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      ensureFirstOpened: (nowMs = Date.now()) => {
        if (get().firstOpenedAt) {
          return;
        }
        set({ firstOpenedAt: new Date(nowMs).toISOString() });
      },

      markNpsShown: (nowMs = Date.now()) => {
        set({ lastNpsShownAt: new Date(nowMs).toISOString() });
      },

      dismissNpsTemporarily: (nowMs = Date.now()) => {
        set({
          dismissedUntil: createDismissedUntil(nowMs),
          lastNpsShownAt: new Date(nowMs).toISOString(),
        });
      },

      submitNps: (input) => {
        if (
          typeof input.score !== 'number' ||
          !Number.isInteger(input.score) ||
          input.score < 0 ||
          input.score > 10
        ) {
          return null;
        }

        const nowIso = new Date().toISOString();
        const entry: FeedbackEntry = {
          id: createFeedbackId(),
          kind: 'nps',
          score: input.score,
          npsGroup: classifyNpsScore(input.score),
          category: 'experience',
          comment: sanitizeComment(input.comment),
          improvement: sanitizeComment(input.improvement),
          screen: input.screen ?? null,
          platform: platformName(),
          appVersion: appVersion(),
          userId: input.userId ?? null,
          guestId: input.guestId ?? null,
          createdAt: nowIso,
          status: 'pending',
          syncedAt: null,
        };

        set((state) => ({
          entries: [entry, ...state.entries].slice(0, 200),
          lastNpsShownAt: nowIso,
          lastNpsSubmittedAt: nowIso,
          dismissedUntil: null,
        }));

        return entry;
      },

      submitGeneral: (input) => {
        const comment = sanitizeComment(input.comment);
        if (!comment) {
          return null;
        }

        const nowIso = new Date().toISOString();
        const entry: FeedbackEntry = {
          id: createFeedbackId(),
          kind: input.kind,
          score: null,
          npsGroup: null,
          category: input.category ?? (input.kind === 'bug' ? 'bug' : 'suggestion'),
          comment,
          improvement: null,
          screen: input.screen ?? null,
          platform: platformName(),
          appVersion: appVersion(),
          userId: input.userId ?? null,
          guestId: input.guestId ?? null,
          createdAt: nowIso,
          status: 'pending',
          syncedAt: null,
        };

        set((state) => ({
          entries: [entry, ...state.entries].slice(0, 200),
        }));

        return entry;
      },

      markSynced: (id, syncedAt = new Date().toISOString()) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, status: 'synced', syncedAt }
              : entry
          ),
        }));
      },

      markFailed: (id) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, status: 'failed' } : entry
          ),
        }));
      },

      getPending: () =>
        get().entries.filter(
          (entry) => entry.status === 'pending' || entry.status === 'failed'
        ),

      canShowNps: (context) => {
        const state = get();
        return shouldShowNpsPrompt({
          firstOpenedAt: state.firstOpenedAt,
          lastNpsShownAt: state.lastNpsShownAt,
          dismissedUntil: state.dismissedUntil,
          hasSubmittedNps: Boolean(state.lastNpsSubmittedAt),
          completedSessions: context.completedSessions,
          nowMs: context.nowMs,
          trigger: context.trigger,
        });
      },

      resetFeedbackDev: () => set(initialState),
    }),
    {
      name: 'studylazy-feedback',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<FeedbackStore>;
        return {
          ...initialState,
          entries: Array.isArray(state.entries) ? state.entries : [],
          firstOpenedAt: state.firstOpenedAt ?? null,
          lastNpsShownAt: state.lastNpsShownAt ?? null,
          dismissedUntil: state.dismissedUntil ?? null,
          lastNpsSubmittedAt: state.lastNpsSubmittedAt ?? null,
        };
      },
      partialize: (state) => ({
        entries: state.entries.map((entry) => ({
          id: entry.id,
          kind: entry.kind,
          score: entry.score,
          npsGroup: entry.npsGroup,
          category: entry.category,
          comment: entry.comment,
          improvement: entry.improvement,
          screen: entry.screen,
          platform: entry.platform,
          appVersion: entry.appVersion,
          // IDs opacos — nunca e-mail.
          userId: entry.userId,
          guestId: entry.guestId,
          createdAt: entry.createdAt,
          status: entry.status,
          syncedAt: entry.syncedAt,
        })),
        firstOpenedAt: state.firstOpenedAt,
        lastNpsShownAt: state.lastNpsShownAt,
        dismissedUntil: state.dismissedUntil,
        lastNpsSubmittedAt: state.lastNpsSubmittedAt,
      }),
    }
  )
);
