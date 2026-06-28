/**
 * Orquestração PURA da sincronização (sem stores, sem React Native).
 *
 * Recebe o repositório por injeção (`import type` é apagado em runtime), então
 * pode ser testada no Node com um repositório mockado.
 */
import { mergeProgressSnapshots } from './syncMerge';
import {
  createEmptyPayload,
  isProgressPayloadEmpty,
  validateProgressSyncPayload,
} from './syncSerializer';
import type { SyncRepository } from './supabaseSyncRepository';
import type { ProgressSyncPayloadV1 } from './syncTypes';

export type OwnershipDecision = 'claim' | 'resume' | 'conflict';

/** Protege contra envio do progresso de uma conta para outra. */
export function resolveOwnership(
  localOwnerUserId: string | null,
  userId: string
): OwnershipDecision {
  if (localOwnerUserId === null) return 'claim';
  if (localOwnerUserId === userId) return 'resume';
  return 'conflict';
}

export type PushResult =
  | { ok: true; revision: number | null; finalPayload: ProgressSyncPayloadV1 }
  | { ok: false; kind: 'offline' | 'error' | 'conflict'; error: string };

export type PushParams = {
  repo: SyncRepository;
  userId: string;
  deviceId: string;
  payload: ProgressSyncPayloadV1;
  expectedRevision: number;
  clientUpdatedAt: string;
  maxRetries?: number;
};

/**
 * Atualiza o snapshot remoto usando a revisão esperada. Em conflito de revisão,
 * busca o remoto, faz merge e tenta de novo — no máximo `maxRetries` vezes.
 */
export async function pushWithRetry(params: PushParams): Promise<PushResult> {
  const { repo, userId, deviceId, clientUpdatedAt } = params;
  const maxRetries = params.maxRetries ?? 2;

  let current = params.payload;
  let expectedRevision = params.expectedRevision;
  let attempt = 0;

  for (;;) {
    const res = await repo.updateSyncStateWithRevision({
      userId,
      expectedRevision,
      payload: current,
      deviceId,
      clientUpdatedAt,
    });

    if (!res.ok) {
      return {
        ok: false,
        kind: res.error.kind === 'network' ? 'offline' : 'error',
        error: res.error.message,
      };
    }

    if (res.updated) {
      return { ok: true, revision: res.revision, finalPayload: current };
    }

    // Zero linhas atualizadas → conflito de revisão.
    if (attempt >= maxRetries) {
      return { ok: false, kind: 'conflict', error: 'revision' };
    }
    attempt += 1;

    const remote = await repo.fetchRemoteSyncState(userId);
    if (!remote.ok) {
      return {
        ok: false,
        kind: remote.error.kind === 'network' ? 'offline' : 'error',
        error: remote.error.message,
      };
    }
    const validated =
      remote.exists && remote.payload
        ? validateProgressSyncPayload(remote.payload)
        : null;
    const remotePayload =
      validated && validated.ok ? validated.payload : createEmptyPayload();
    current = mergeProgressSnapshots(current, remotePayload).payload;
    expectedRevision = remote.revision ?? expectedRevision;
  }
}

export type InitialSyncResult =
  | {
      ok: true;
      outcome: 'created' | 'applied' | 'merged';
      payloadToApply: ProgressSyncPayloadV1 | null;
      revision: number | null;
    }
  | { ok: false; kind: 'offline' | 'error' | 'conflict'; error: string };

export type InitialSyncParams = {
  repo: SyncRepository;
  userId: string;
  displayName: string;
  localPayload: ProgressSyncPayloadV1;
  deviceId: string;
  clientUpdatedAt: string;
};

/** Sincronização inicial idempotente: cria, aplica ou faz merge determinístico. */
export async function runInitialSync(
  params: InitialSyncParams
): Promise<InitialSyncResult> {
  const { repo, userId, displayName, localPayload, deviceId, clientUpdatedAt } =
    params;

  const remote = await repo.fetchRemoteSyncState(userId);
  if (!remote.ok) {
    return {
      ok: false,
      kind: remote.error.kind === 'network' ? 'offline' : 'error',
      error: remote.error.message,
    };
  }

  // Caso remoto inexistente → cria profiles + user_sync_state com o local.
  if (!remote.exists) {
    const inserted = await repo.insertInitialSyncState(
      userId,
      localPayload,
      deviceId,
      clientUpdatedAt
    );
    if (!inserted.ok) {
      return {
        ok: false,
        kind: inserted.error.kind === 'network' ? 'offline' : 'error',
        error: inserted.error.message,
      };
    }
    await repo.upsertProfile(userId, {
      display_name: displayName,
      foreign_language: localPayload.profile.foreignLanguage,
    });
    return {
      ok: true,
      outcome: 'created',
      payloadToApply: null,
      revision: inserted.revision,
    };
  }

  const validated = remote.payload
    ? validateProgressSyncPayload(remote.payload)
    : null;
  const remotePayload =
    validated && validated.ok ? validated.payload : createEmptyPayload();

  const localEmpty = isProgressPayloadEmpty(localPayload);
  const remoteEmpty = isProgressPayloadEmpty(remotePayload);

  // Local vazio e remoto com dados → aplica remoto, sem criar XP artificial.
  if (localEmpty && !remoteEmpty) {
    await repo.upsertProfile(userId, {
      display_name: displayName,
      foreign_language: remotePayload.profile.foreignLanguage,
    });
    return {
      ok: true,
      outcome: 'applied',
      payloadToApply: remotePayload,
      revision: remote.revision,
    };
  }

  // Ambos existentes (ou local com dados) → merge determinístico + upload.
  const merged = mergeProgressSnapshots(localPayload, remotePayload).payload;
  const push = await pushWithRetry({
    repo,
    userId,
    deviceId,
    payload: merged,
    expectedRevision: remote.revision ?? 0,
    clientUpdatedAt,
  });
  if (!push.ok) {
    return { ok: false, kind: push.kind, error: push.error };
  }
  await repo.upsertProfile(userId, {
    display_name: displayName,
    foreign_language: push.finalPayload.profile.foreignLanguage,
  });
  return {
    ok: true,
    outcome: 'merged',
    payloadToApply: push.finalPayload,
    revision: push.revision,
  };
}
