/**
 * Coordenação da sincronização: orquestra serialização, merge, repositório e
 * aplicação nos stores. Separa a lógica pura (testável com repositório mockado)
 * da camada ligada aos stores/timers.
 */
import { deriveDisplayName } from '../lib/authFlow';
import { reconstructMistakeItems } from '../utils/questionMistake';
import { useAuthStore } from '../store/authStore';
import { useMistakeStore } from '../store/mistakeStore';
import { useProfileStore } from '../store/profileStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import { useSyncStore } from '../store/syncStore';
import {
  pushWithRetry,
  resolveOwnership,
  runInitialSync,
} from './syncOrchestrator';
import { serializeSnapshot } from './syncSerializer';
import {
  supabaseSyncRepository,
  type SyncRepository,
} from './supabaseSyncRepository';
import type { ProgressSyncPayloadV1 } from './syncTypes';

export { resolveOwnership, runInitialSync, pushWithRetry } from './syncOrchestrator';

// ---------------------------------------------------------------------------
// Camada ligada aos stores e timers (runtime do app).
// ---------------------------------------------------------------------------

const UPLOAD_DEBOUNCE_MS = 2000;

let repo: SyncRepository = supabaseSyncRepository;
let started = false;
let syncActive = false;
let isApplyingRemoteSnapshot = false;
let uploadInFlight = false;
let pendingUpload = false;
let initialSyncInFlight = false;
let loggedOut = false;
let activeUserId: string | null = null;
let uploadTimer: ReturnType<typeof setTimeout> | null = null;
let lastSignature = '';
const unsubscribers: (() => void)[] = [];

/** Permite injetar um repositório mock em testes/diagnóstico. */
export function __setSyncRepository(next: SyncRepository) {
  repo = next;
}

export function isApplyingRemote(): boolean {
  return isApplyingRemoteSnapshot;
}

export function buildLocalPayload(): ProgressSyncPayloadV1 {
  const profile = useProfileStore.getState();
  const progress = useStudyProgressStore.getState();
  const mistakes = useMistakeStore.getState();
  return serializeSnapshot({
    foreignLanguage: profile.foreignLanguage,
    foreignLanguageUpdatedAt: profile.foreignLanguageUpdatedAt,
    xp: progress.xp,
    streak: progress.streak,
    lastStudyDate: progress.lastStudyDate,
    sessionsCompleted: progress.sessionsCompleted,
    history: progress.lessonHistory,
    questionPerformance: progress.questionPerformance,
    recentQuestionIds: progress.recentQuestionIds,
    mistakes: mistakes.mistakes,
  });
}

/** Aplica um snapshot remoto aos stores sem disparar dirty/upload recursivo. */
export function applyRemotePayload(payload: ProgressSyncPayloadV1) {
  isApplyingRemoteSnapshot = true;
  try {
    useProfileStore.setState({
      foreignLanguage: payload.profile.foreignLanguage,
      foreignLanguageUpdatedAt: payload.profile.foreignLanguageUpdatedAt,
    });
    useStudyProgressStore.setState({
      xp: payload.progress.xp,
      streak: payload.progress.streak,
      lastStudyDate: payload.progress.lastStudyDate,
      sessionsCompleted: payload.progress.sessionsCompleted,
      lessonHistory: payload.progress.history,
      questionPerformance: payload.progress.questionPerformance,
      recentQuestionIds: payload.progress.recentQuestionIds,
    });
    // Reconstrói os erros (enunciado/alternativas) a partir do banco oficial;
    // legados locais são preservados sem reenviar conteúdo à nuvem.
    useMistakeStore.setState({
      mistakes: reconstructMistakeItems(
        payload.mistakes.items,
        useMistakeStore.getState().mistakes
      ),
    });
  } finally {
    isApplyingRemoteSnapshot = false;
    lastSignature = computeDirtySignature();
  }
}

function computeDirtySignature(): string {
  const p = useProfileStore.getState();
  const s = useStudyProgressStore.getState();
  const m = useMistakeStore.getState();
  const lastHistory = s.lessonHistory[0]?.id ?? '';
  const lastMistake = m.mistakes[0]
    ? `${m.mistakes[0].id}:${m.mistakes[0].errorCount}`
    : '';
  return [
    p.foreignLanguage ?? 'null',
    p.foreignLanguageUpdatedAt ?? 'null',
    s.xp,
    s.streak,
    s.lastStudyDate ?? 'null',
    s.sessionsCompleted,
    s.lessonHistory.length,
    lastHistory,
    Object.keys(s.questionPerformance).length,
    s.recentQuestionIds.join(','),
    m.mistakes.length,
    lastMistake,
  ].join('|');
}

function getActiveUserId(): string | null {
  if (loggedOut) return null;
  const session = useAuthStore.getState().session;
  return session?.user?.id ?? null;
}

function isOwnershipBlocked(): boolean {
  const sync = useSyncStore.getState();
  return sync.status === 'conflict' && sync.conflictKind === 'ownership';
}

function onStoresChanged() {
  const signature = computeDirtySignature();
  if (signature === lastSignature) {
    return;
  }
  lastSignature = signature;

  if (isApplyingRemoteSnapshot) return;
  if (!syncActive) return;
  if (!getActiveUserId()) return;
  if (isOwnershipBlocked()) return;

  useSyncStore.getState().markDirty();
  if (uploadInFlight) {
    pendingUpload = true;
    return;
  }
  scheduleUpload();
}

function scheduleUpload() {
  if (uploadTimer) {
    clearTimeout(uploadTimer);
  }
  uploadTimer = setTimeout(() => {
    uploadTimer = null;
    void uploadNow();
  }, UPLOAD_DEBOUNCE_MS);
}

function nowIso() {
  return new Date().toISOString();
}

export async function uploadNow(): Promise<void> {
  const userId = getActiveUserId();
  if (!userId || !syncActive || isOwnershipBlocked()) {
    return;
  }
  if (uploadInFlight) {
    pendingUpload = true;
    return;
  }

  uploadInFlight = true;
  const sync = useSyncStore.getState();
  sync.setStatus('syncing');
  sync.markAttempt();

  try {
    const localPayload = buildLocalPayload();
    const expectedRevision = useSyncStore.getState().lastKnownRevision ?? 0;
    const result = await pushWithRetry({
      repo,
      userId,
      deviceId: useSyncStore.getState().deviceId,
      payload: localPayload,
      expectedRevision,
      clientUpdatedAt: nowIso(),
    });

    // Sessão pode ter encerrado durante o upload → não aplica nada.
    if (loggedOut || getActiveUserId() !== userId) {
      return;
    }

    if (result.ok) {
      applyRemotePayload(result.finalPayload);
      useSyncStore.getState().markSynced(result.revision);
    } else if (result.kind === 'conflict') {
      useSyncStore.getState().setConflict('revision', 'conflict');
    } else if (result.kind === 'offline') {
      useSyncStore.getState().setError('offline', 'offline');
    } else {
      useSyncStore.getState().setError('error', 'error');
    }
  } finally {
    uploadInFlight = false;
    if (pendingUpload && !loggedOut) {
      pendingUpload = false;
      scheduleUpload();
    }
  }
}

async function runInitialSyncFlow(): Promise<void> {
  if (initialSyncInFlight) {
    return;
  }
  const auth = useAuthStore.getState();
  const userId = auth.session?.user?.id ?? null;
  if (!userId || loggedOut) {
    return;
  }

  const ownership = resolveOwnership(
    useSyncStore.getState().localOwnerUserId,
    userId
  );
  if (ownership === 'conflict') {
    useSyncStore
      .getState()
      .setConflict('ownership', 'Progresso pertence a outra conta.');
    return;
  }

  initialSyncInFlight = true;
  activeUserId = userId;
  const sync = useSyncStore.getState();
  sync.setStatus('syncing');
  sync.markAttempt();

  const displayName = deriveDisplayName(auth.user, auth.user?.email);
  const localPayload = buildLocalPayload();

  try {
    const result = await runInitialSync({
      repo,
      userId,
      displayName,
      localPayload,
      deviceId: useSyncStore.getState().deviceId,
      clientUpdatedAt: nowIso(),
    });

    if (loggedOut || getActiveUserId() !== userId) {
      return;
    }

    if (result.ok) {
      if (result.payloadToApply) {
        applyRemotePayload(result.payloadToApply);
      }
      const syncStore = useSyncStore.getState();
      syncStore.setOwner(userId);
      syncStore.setRevision(result.revision);
      syncStore.completeInitialSync();
      syncStore.markSynced(result.revision);
      syncActive = true;
      lastSignature = computeDirtySignature();
      // Mudanças acumuladas offline antes do login sobem após o sync inicial.
      if (syncStore.isDirty) {
        scheduleUpload();
      }
    } else if (result.kind === 'conflict') {
      useSyncStore.getState().setConflict('revision', 'conflict');
    } else if (result.kind === 'offline') {
      useSyncStore.getState().setError('offline', 'offline');
    } else {
      useSyncStore.getState().setError('error', 'error');
    }
  } finally {
    initialSyncInFlight = false;
  }
}

function registerSubscriptions() {
  unsubscribers.push(useProfileStore.subscribe(onStoresChanged));
  unsubscribers.push(useStudyProgressStore.subscribe(onStoresChanged));
  unsubscribers.push(useMistakeStore.subscribe(onStoresChanged));
}

/** Chamado quando a sessão de autenticação muda (login). */
export function handleAuthenticated(): void {
  loggedOut = false;
  const userId = getActiveUserId();
  if (!userId) return;

  // Já sincronizando/sincronizado para o mesmo usuário → idempotente.
  if (syncActive && activeUserId === userId) {
    return;
  }

  // Conflito de propriedade tem prioridade e bloqueia qualquer envio.
  const ownership = resolveOwnership(
    useSyncStore.getState().localOwnerUserId,
    userId
  );
  if (ownership === 'conflict') {
    useSyncStore
      .getState()
      .setConflict('ownership', 'Progresso pertence a outra conta.');
    return;
  }

  void runInitialSyncFlow();
}

/** Logout: cancela timers e impede uploads, preservando o progresso local. */
export function handleLogout(): void {
  loggedOut = true;
  syncActive = false;
  activeUserId = null;
  pendingUpload = false;
  if (uploadTimer) {
    clearTimeout(uploadTimer);
    uploadTimer = null;
  }
  // Limpa apenas o estado transitório: preserva deviceId, owner e revision.
  useSyncStore.getState().resetTransient();
}

/**
 * Exclusão de conta: cancela timers/uploads e zera o vínculo de propriedade,
 * tratando o aparelho como convidado novamente (mantém apenas o deviceId).
 */
export function handleAccountDeleted(): void {
  loggedOut = true;
  syncActive = false;
  activeUserId = null;
  pendingUpload = false;
  if (uploadTimer) {
    clearTimeout(uploadTimer);
    uploadTimer = null;
  }
  useSyncStore.getState().resetForAccountDeletion();
}

/** Sincronização manual a partir da interface. */
export async function syncNow(): Promise<void> {
  const userId = getActiveUserId();
  if (!userId) return;
  if (isOwnershipBlocked()) return;
  if (!syncActive) {
    await runInitialSyncFlow();
    return;
  }
  if (uploadTimer) {
    clearTimeout(uploadTimer);
    uploadTimer = null;
  }
  await uploadNow();
}

/** Tentativa de retry (foreground / abertura do app). */
export function retrySyncIfPending(): void {
  const userId = getActiveUserId();
  if (!userId || isOwnershipBlocked()) return;
  if (!syncActive) {
    void runInitialSyncFlow();
    return;
  }
  if (useSyncStore.getState().isDirty) {
    void uploadNow();
  }
}

/** Inicializa subscriptions uma única vez e dispara sync se já autenticado. */
export function startProgressSync(): void {
  if (started) return;
  started = true;
  lastSignature = computeDirtySignature();
  registerSubscriptions();
  if (getActiveUserId()) {
    handleAuthenticated();
  }
}

/** Diagnóstico para a tela de desenvolvimento. */
export async function fetchRemoteForDiagnostics() {
  const userId = getActiveUserId();
  if (!userId) {
    return { profileExists: false, snapshotExists: false, revision: null };
  }
  const [profile, state] = await Promise.all([
    repo.fetchProfile(userId),
    repo.fetchRemoteSyncState(userId),
  ]);
  return {
    profileExists: profile.ok ? profile.profile !== null : false,
    snapshotExists: state.ok ? state.exists : false,
    revision: state.ok ? state.revision : null,
  };
}
