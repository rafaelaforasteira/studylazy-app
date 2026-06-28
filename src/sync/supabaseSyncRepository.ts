/**
 * Acesso isolado ao Supabase para sincronização. Nenhuma tela chama `.from(...)`
 * diretamente — tudo passa por aqui. Usa o cliente central e o usuário
 * autenticado como chave (nunca um ID vindo da interface).
 */
import { isNetworkError, logAuthErrorDev } from '../lib/authErrors';
import { supabase } from '../lib/supabase';

export type RepoErrorKind = 'network' | 'unavailable' | 'unknown';
export type RepoError = { kind: RepoErrorKind; message: string };

export type RemoteProfile = {
  id: string;
  display_name: string | null;
  foreign_language: string | null;
};

export type ProfileResult =
  | { ok: true; profile: RemoteProfile | null }
  | { ok: false; error: RepoError };

export type FetchSyncStateResult =
  | {
      ok: true;
      exists: boolean;
      revision: number | null;
      payload: unknown | null;
      serverUpdatedAt: string | null;
    }
  | { ok: false; error: RepoError };

export type WriteSyncStateResult =
  | { ok: true; updated: boolean; revision: number | null }
  | { ok: false; error: RepoError };

export type UpdateSyncStateParams = {
  userId: string;
  expectedRevision: number;
  payload: unknown;
  deviceId: string;
  clientUpdatedAt: string;
};

export interface SyncRepository {
  fetchProfile(userId: string): Promise<ProfileResult>;
  upsertProfile(
    userId: string,
    data: { display_name: string | null; foreign_language: string | null }
  ): Promise<ProfileResult>;
  fetchRemoteSyncState(userId: string): Promise<FetchSyncStateResult>;
  insertInitialSyncState(
    userId: string,
    payload: unknown,
    deviceId: string,
    clientUpdatedAt: string
  ): Promise<WriteSyncStateResult>;
  updateSyncStateWithRevision(
    params: UpdateSyncStateParams
  ): Promise<WriteSyncStateResult>;
}

function toRepoError(error: unknown): RepoError {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error);
  if (isNetworkError({ message })) {
    return { kind: 'network', message: 'network' };
  }
  return { kind: 'unknown', message: message.slice(0, 120) };
}

const PROFILES_TABLE = 'profiles';
const SYNC_TABLE = 'user_sync_state';

export const supabaseSyncRepository: SyncRepository = {
  async fetchProfile(userId) {
    if (!supabase) {
      return { ok: false, error: { kind: 'unavailable', message: 'no client' } };
    }
    try {
      const { data, error } = await supabase
        .from(PROFILES_TABLE)
        .select('id, display_name, foreign_language')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        logAuthErrorDev('sync.fetchProfile', error);
        return { ok: false, error: toRepoError(error) };
      }
      return { ok: true, profile: (data as RemoteProfile | null) ?? null };
    } catch (error) {
      logAuthErrorDev('sync.fetchProfile', error);
      return { ok: false, error: toRepoError(error) };
    }
  },

  async upsertProfile(userId, data) {
    if (!supabase) {
      return { ok: false, error: { kind: 'unavailable', message: 'no client' } };
    }
    try {
      const { data: rows, error } = await supabase
        .from(PROFILES_TABLE)
        .upsert(
          {
            id: userId,
            display_name: data.display_name,
            foreign_language: data.foreign_language,
          },
          { onConflict: 'id' }
        )
        .select('id, display_name, foreign_language')
        .single();
      if (error) {
        logAuthErrorDev('sync.upsertProfile', error);
        return { ok: false, error: toRepoError(error) };
      }
      return { ok: true, profile: (rows as RemoteProfile) ?? null };
    } catch (error) {
      logAuthErrorDev('sync.upsertProfile', error);
      return { ok: false, error: toRepoError(error) };
    }
  },

  async fetchRemoteSyncState(userId) {
    if (!supabase) {
      return { ok: false, error: { kind: 'unavailable', message: 'no client' } };
    }
    try {
      const { data, error } = await supabase
        .from(SYNC_TABLE)
        .select('revision, payload, server_updated_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        logAuthErrorDev('sync.fetchRemoteSyncState', error);
        return { ok: false, error: toRepoError(error) };
      }
      if (!data) {
        return {
          ok: true,
          exists: false,
          revision: null,
          payload: null,
          serverUpdatedAt: null,
        };
      }
      const row = data as {
        revision: number | null;
        payload: unknown;
        server_updated_at: string | null;
      };
      return {
        ok: true,
        exists: true,
        revision: row.revision ?? null,
        payload: row.payload ?? null,
        serverUpdatedAt: row.server_updated_at ?? null,
      };
    } catch (error) {
      logAuthErrorDev('sync.fetchRemoteSyncState', error);
      return { ok: false, error: toRepoError(error) };
    }
  },

  async insertInitialSyncState(userId, payload, deviceId, clientUpdatedAt) {
    if (!supabase) {
      return { ok: false, error: { kind: 'unavailable', message: 'no client' } };
    }
    try {
      const { data, error } = await supabase
        .from(SYNC_TABLE)
        .insert({
          user_id: userId,
          schema_version: 1,
          device_id: deviceId,
          client_updated_at: clientUpdatedAt,
          payload,
        })
        .select('revision')
        .single();
      if (error) {
        logAuthErrorDev('sync.insertInitialSyncState', error);
        return { ok: false, error: toRepoError(error) };
      }
      return {
        ok: true,
        updated: true,
        revision: (data as { revision: number | null })?.revision ?? null,
      };
    } catch (error) {
      logAuthErrorDev('sync.insertInitialSyncState', error);
      return { ok: false, error: toRepoError(error) };
    }
  },

  async updateSyncStateWithRevision({
    userId,
    expectedRevision,
    payload,
    deviceId,
    clientUpdatedAt,
  }) {
    if (!supabase) {
      return { ok: false, error: { kind: 'unavailable', message: 'no client' } };
    }
    try {
      const { data, error } = await supabase
        .from(SYNC_TABLE)
        .update({
          payload,
          device_id: deviceId,
          client_updated_at: clientUpdatedAt,
        })
        .eq('user_id', userId)
        .eq('revision', expectedRevision)
        .select('revision');
      if (error) {
        logAuthErrorDev('sync.updateSyncStateWithRevision', error);
        return { ok: false, error: toRepoError(error) };
      }
      const rows = (data as { revision: number | null }[] | null) ?? [];
      if (rows.length === 0) {
        // Nenhuma linha atualizada → conflito de revisão (o trigger já moveu a revisão).
        return { ok: true, updated: false, revision: null };
      }
      return { ok: true, updated: true, revision: rows[0].revision ?? null };
    } catch (error) {
      logAuthErrorDev('sync.updateSyncStateWithRevision', error);
      return { ok: false, error: toRepoError(error) };
    }
  },
};
