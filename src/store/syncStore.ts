import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SyncStatus =
  | 'idle'
  | 'waiting_for_auth'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'conflict'
  | 'error';

/** Distingue conflito de propriedade (conta) de conflito de revisão. */
export type ConflictKind = 'none' | 'ownership' | 'revision';

type SyncState = {
  status: SyncStatus;
  conflictKind: ConflictKind;
  deviceId: string;
  localOwnerUserId: string | null;
  lastKnownRevision: number | null;
  lastSyncedAt: string | null;
  lastAttemptAt: string | null;
  isDirty: boolean;
  hasCompletedInitialSync: boolean;
  error: string | null;

  setStatus: (status: SyncStatus) => void;
  setConflict: (kind: ConflictKind, error?: string | null) => void;
  markDirty: () => void;
  clearDirty: () => void;
  setOwner: (userId: string | null) => void;
  setRevision: (revision: number | null) => void;
  markAttempt: () => void;
  markSynced: (revision: number | null) => void;
  setError: (error: string | null, status?: SyncStatus) => void;
  completeInitialSync: () => void;
  /** Limpa apenas estado transitório no logout (preserva deviceId/owner/revision). */
  resetTransient: () => void;
  /** Reset completo ao excluir a conta (mantém apenas o deviceId do aparelho). */
  resetForAccountDeletion: () => void;
};

export type SyncStatusDescription = {
  label: string;
  tone: 'neutral' | 'positive' | 'warning' | 'danger';
};

/** Texto amigável (sem termos técnicos) para um estado de sincronização. */
export function describeSyncStatus(
  status: SyncStatus,
  conflictKind: ConflictKind,
  isDirty: boolean
): SyncStatusDescription {
  if (status === 'conflict') {
    if (conflictKind === 'ownership') {
      return { label: 'Conflito de conta', tone: 'danger' };
    }
    return { label: 'Falha ao sincronizar', tone: 'danger' };
  }
  switch (status) {
    case 'syncing':
      return { label: 'Sincronizando…', tone: 'neutral' };
    case 'synced':
      return isDirty
        ? { label: 'Alterações salvas neste aparelho', tone: 'warning' }
        : { label: 'Sincronizado agora', tone: 'positive' };
    case 'offline':
      return { label: 'Alterações salvas neste aparelho', tone: 'warning' };
    case 'error':
      return { label: 'Falha ao sincronizar', tone: 'danger' };
    case 'waiting_for_auth':
    case 'idle':
    default:
      return isDirty
        ? { label: 'Alterações salvas neste aparelho', tone: 'warning' }
        : { label: 'Pronto para sincronizar', tone: 'neutral' };
  }
}

/** Gera um ID de aparelho estável (NÃO é identificador de segurança). */
function generateDeviceId(): string {
  const cryptoObj =
    typeof globalThis !== 'undefined'
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return `dev_${cryptoObj.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2);
  const time = Date.now().toString(36);
  return `dev_${time}_${random}`;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      conflictKind: 'none',
      deviceId: generateDeviceId(),
      localOwnerUserId: null,
      lastKnownRevision: null,
      lastSyncedAt: null,
      lastAttemptAt: null,
      isDirty: false,
      hasCompletedInitialSync: false,
      error: null,

      setStatus: (status) => set({ status }),
      setConflict: (kind, error = null) =>
        set({ status: 'conflict', conflictKind: kind, error }),
      markDirty: () => set({ isDirty: true }),
      clearDirty: () => set({ isDirty: false }),
      setOwner: (userId) => set({ localOwnerUserId: userId }),
      setRevision: (revision) => set({ lastKnownRevision: revision }),
      markAttempt: () => set({ lastAttemptAt: new Date().toISOString() }),
      markSynced: (revision) =>
        set({
          status: 'synced',
          conflictKind: 'none',
          error: null,
          isDirty: false,
          lastSyncedAt: new Date().toISOString(),
          lastKnownRevision:
            revision ?? get().lastKnownRevision ?? null,
        }),
      setError: (error, status = 'error') => set({ status, error }),
      completeInitialSync: () => set({ hasCompletedInitialSync: true }),
      resetTransient: () =>
        set({
          status: 'idle',
          conflictKind: 'none',
          error: null,
          lastAttemptAt: null,
        }),
      resetForAccountDeletion: () =>
        set({
          status: 'idle',
          conflictKind: 'none',
          error: null,
          localOwnerUserId: null,
          lastKnownRevision: null,
          lastSyncedAt: null,
          lastAttemptAt: null,
          isDirty: false,
          hasCompletedInitialSync: false,
        }),
    }),
    {
      name: 'studylazy-sync',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Apenas o estado durável é persistido; status/erro são transitórios.
      partialize: (state) => ({
        deviceId: state.deviceId,
        localOwnerUserId: state.localOwnerUserId,
        lastKnownRevision: state.lastKnownRevision,
        lastSyncedAt: state.lastSyncedAt,
        isDirty: state.isDirty,
        hasCompletedInitialSync: state.hasCompletedInitialSync,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<SyncState>;
        return {
          ...currentState,
          ...persisted,
          // deviceId estável: usa o persistido ou mantém o recém-gerado.
          deviceId:
            typeof persisted.deviceId === 'string' && persisted.deviceId
              ? persisted.deviceId
              : currentState.deviceId,
          localOwnerUserId:
            typeof persisted.localOwnerUserId === 'string'
              ? persisted.localOwnerUserId
              : null,
          lastKnownRevision:
            typeof persisted.lastKnownRevision === 'number'
              ? persisted.lastKnownRevision
              : null,
          isDirty: persisted.isDirty === true,
          hasCompletedInitialSync: persisted.hasCompletedInitialSync === true,
          // Sempre reinicia transitórios na carga.
          status: 'idle',
          conflictKind: 'none',
          error: null,
          lastAttemptAt: null,
        };
      },
    }
  )
);
