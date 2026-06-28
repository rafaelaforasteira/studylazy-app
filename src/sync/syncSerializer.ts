/**
 * Serialização e validação defensiva do payload de sincronização.
 *
 * Puro (sem React Native / Supabase). Garante JSON serializável, datas ISO,
 * números normalizados, ausência de `undefined`, e nenhuma duplicata interna.
 */
import { normalizeForeignLanguagePreference } from '../data/questionTypes';
import type { LessonHistoryItem } from '../store/progressLogic';
import { toSafeCount } from '../store/progressLogic';
import type { MistakeItem } from '../store/mistakeStore';
import type { QuestionPerformance } from '../store/studyProgressStore';
import {
  RECENT_IDS_LIMIT,
  SYNC_SCHEMA_VERSION,
  type LocalSnapshotInput,
  type ProgressSyncPayloadV1,
  type SyncMistakeItem,
  type ValidationResult,
} from './syncTypes';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Retorna ISO válido ou null. Aceita strings de data ou date-key (YYYY-MM-DD). */
export function normalizeIso(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  return value;
}

function normalizeIsoStrict(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return null;
  }
  return new Date(time).toISOString();
}

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** ID estável de uma sessão do histórico; cria fingerprint legado se faltar. */
export function getHistoryStableId(item: Partial<LessonHistoryItem>): string {
  if (typeof item.id === 'string' && item.id.trim().length > 0) {
    return item.id;
  }
  // Fingerprint legado a partir de campos estáveis.
  return [
    normalizeString(item.subject, 'sessao'),
    normalizeString(item.date, 'sem-data'),
    String(toSafeCount(item.minutes ?? 0)),
    String(toSafeCount(item.totalQuestions ?? 0)),
    String(toSafeCount(item.correctAnswers ?? 0)),
    String(toSafeCount(item.earnedXp ?? 0)),
  ].join('::');
}

/** Hash determinístico curto (não-criptográfico) para chaves legadas. */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  return (hash >>> 0).toString(36);
}

/**
 * ID estável de um erro para sincronização. Prioriza `stableQuestionId`/
 * `externalId` (mapeia direto ao banco oficial). Para legados sem ID, gera um
 * fingerprint a partir de matéria+enunciado SEM transmitir o texto (apenas o
 * hash entra no payload).
 */
export function getMistakeStableSyncId(
  item: Partial<MistakeItem> & { stableQuestionId?: string }
): string {
  if (
    typeof item.stableQuestionId === 'string' &&
    item.stableQuestionId.trim().length > 0
  ) {
    return item.stableQuestionId;
  }
  if (typeof item.externalId === 'string' && item.externalId.trim().length > 0) {
    return item.externalId;
  }
  const subject = normalizeString(item.subject);
  const question = normalizeString(item.question);
  if (question) {
    return `legacy:${simpleHash(`${subject}|${question}`)}`;
  }
  if (typeof item.id === 'string' && item.id.trim().length > 0) {
    return item.id;
  }
  return `legacy:${simpleHash(subject)}`;
}

function normalizeHistoryItem(raw: unknown): LessonHistoryItem | null {
  if (!isObject(raw)) {
    return null;
  }
  const subject = normalizeString(raw.subject).trim();
  const date = normalizeString(raw.date).trim();
  if (!subject || !date) {
    return null;
  }
  const item: LessonHistoryItem = {
    id: getHistoryStableId(raw as Partial<LessonHistoryItem>),
    subject,
    minutes: toSafeCount(Number(raw.minutes)),
    totalQuestions: toSafeCount(Number(raw.totalQuestions)),
    correctAnswers: toSafeCount(Number(raw.correctAnswers)),
    earnedXp: toSafeCount(Number(raw.earnedXp)),
    date,
    isRepeat: raw.isRepeat === true,
  };
  // correctAnswers nunca excede totalQuestions.
  if (item.correctAnswers > item.totalQuestions) {
    item.correctAnswers = item.totalQuestions;
  }
  return item;
}

function normalizeQuestionPerformanceEntry(
  raw: unknown,
  key: string
): QuestionPerformance | null {
  if (!isObject(raw)) {
    return null;
  }
  const stableQuestionId =
    typeof raw.stableQuestionId === 'string' && raw.stableQuestionId.trim()
      ? raw.stableQuestionId
      : key;
  if (!stableQuestionId.trim()) {
    return null;
  }
  const correctAttempts = toSafeCount(Number(raw.correctAttempts));
  const incorrectAttempts = toSafeCount(Number(raw.incorrectAttempts));
  // attempts coerente: pelo menos a soma de certos + errados.
  const attempts = Math.max(
    toSafeCount(Number(raw.attempts)),
    correctAttempts + incorrectAttempts
  );
  const lastResult =
    raw.lastResult === 'correct' || raw.lastResult === 'incorrect'
      ? raw.lastResult
      : null;
  return {
    stableQuestionId,
    attempts,
    correctAttempts,
    incorrectAttempts,
    lastAnsweredAt: normalizeIso(raw.lastAnsweredAt),
    lastResult,
  };
}

/**
 * Converte um erro (local OU legado remoto) em um item de sincronização
 * MÍNIMO. Aceita tanto `MistakeItem` completo quanto um item já minimizado.
 *
 * GARANTIA: nunca copia enunciado, alternativas, prompt, textos de apoio,
 * citação ou explicação. Esses campos são reconstruídos do banco oficial.
 */
function toSyncMistake(raw: unknown): SyncMistakeItem | null {
  if (!isObject(raw)) {
    return null;
  }
  const subject = normalizeString(raw.subject).trim();
  const stableQuestionId = getMistakeStableSyncId(
    raw as Partial<MistakeItem> & { stableQuestionId?: string }
  );
  if (!stableQuestionId.trim()) {
    return null;
  }

  const item: SyncMistakeItem = {
    stableQuestionId,
    subject,
    errorCount: Math.max(1, toSafeCount(Number(raw.errorCount))),
    lastAnsweredAt: normalizeIso(raw.lastAnsweredAt) ?? '',
  };

  // Campos curtos opcionais (nunca conteúdo da questão).
  if (typeof raw.selectedAnswer === 'string' && raw.selectedAnswer.length > 0) {
    item.selectedAnswer = raw.selectedAnswer;
  }
  // correctAnswer só é mantido para itens NÃO oficiais (sem externalId), pois
  // os oficiais reconstroem o gabarito a partir do banco.
  const hasExternalId =
    (typeof raw.externalId === 'string' && raw.externalId.trim().length > 0) ||
    /^ENEM/i.test(stableQuestionId);
  if (
    !hasExternalId &&
    typeof raw.correctAnswer === 'string' &&
    raw.correctAnswer.length > 0
  ) {
    item.correctAnswer = raw.correctAnswer;
  }
  if (typeof raw.externalId === 'string' && raw.externalId.trim().length > 0) {
    item.externalId = raw.externalId;
  }
  if (typeof raw.topic === 'string' && raw.topic.length > 0) {
    item.topic = raw.topic;
  }
  if (typeof raw.area === 'string' && raw.area.length > 0) {
    item.area = raw.area;
  }
  if (typeof raw.source === 'string' && raw.source.length > 0) {
    item.source = raw.source;
  }
  if (typeof raw.year === 'number' && Number.isFinite(raw.year)) {
    item.year = raw.year;
  }
  if (raw.originType === 'official_exam' || raw.originType === 'demo') {
    item.originType = raw.originType;
  }

  return item;
}

/** Constrói um payload normalizado a partir do estado local dos stores. */
export function serializeSnapshot(
  input: LocalSnapshotInput,
  exportedAt: string = new Date().toISOString()
): ProgressSyncPayloadV1 {
  const history = (Array.isArray(input.history) ? input.history : [])
    .map((item) => normalizeHistoryItem(item))
    .filter((item): item is LessonHistoryItem => item !== null);

  const questionPerformance: Record<string, QuestionPerformance> = {};
  const rawPerformance = isObject(input.questionPerformance)
    ? input.questionPerformance
    : {};
  Object.entries(rawPerformance).forEach(([key, value]) => {
    const entry = normalizeQuestionPerformanceEntry(value, key);
    if (entry) {
      questionPerformance[entry.stableQuestionId] = entry;
    }
  });

  const recentQuestionIds = Array.from(
    new Set(
      (Array.isArray(input.recentQuestionIds) ? input.recentQuestionIds : [])
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    )
  ).slice(0, RECENT_IDS_LIMIT);

  const mistakes = (Array.isArray(input.mistakes) ? input.mistakes : [])
    .map((item) => toSyncMistake(item))
    .filter((item): item is SyncMistakeItem => item !== null);

  return {
    version: SYNC_SCHEMA_VERSION,
    exportedAt: normalizeIsoStrict(exportedAt) ?? new Date().toISOString(),
    profile: {
      foreignLanguage: normalizeForeignLanguagePreference(input.foreignLanguage),
      foreignLanguageUpdatedAt: normalizeIso(input.foreignLanguageUpdatedAt),
    },
    progress: {
      xp: toSafeCount(input.xp),
      streak: toSafeCount(input.streak),
      lastStudyDate: normalizeIso(input.lastStudyDate),
      sessionsCompleted: toSafeCount(input.sessionsCompleted),
      history,
      questionPerformance,
      recentQuestionIds,
    },
    mistakes: { items: mistakes },
  };
}

/** Validação manual e defensiva de um payload remoto/desconhecido. */
export function validateProgressSyncPayload(value: unknown): ValidationResult {
  if (!isObject(value)) {
    return { ok: false, error: 'Payload não é um objeto.' };
  }
  if (value.version !== SYNC_SCHEMA_VERSION) {
    return { ok: false, error: `Versão de schema não suportada: ${String(value.version)}` };
  }
  if (!isObject(value.profile) || !isObject(value.progress) || !isObject(value.mistakes)) {
    return { ok: false, error: 'Seções obrigatórias ausentes.' };
  }
  const progress = value.progress as Record<string, unknown>;
  if (!Array.isArray(progress.history)) {
    return { ok: false, error: 'history inválido.' };
  }
  if (!isObject(progress.questionPerformance)) {
    return { ok: false, error: 'questionPerformance inválido.' };
  }
  if (!Array.isArray(progress.recentQuestionIds)) {
    return { ok: false, error: 'recentQuestionIds inválido.' };
  }
  const mistakes = value.mistakes as Record<string, unknown>;
  if (!Array.isArray(mistakes.items)) {
    return { ok: false, error: 'mistakes.items inválido.' };
  }

  // Re-normaliza tudo para garantir um payload limpo e seguro.
  const profile = value.profile as Record<string, unknown>;
  const normalized = serializeSnapshot(
    {
      foreignLanguage: normalizeForeignLanguagePreference(profile.foreignLanguage),
      foreignLanguageUpdatedAt: normalizeIso(profile.foreignLanguageUpdatedAt),
      xp: Number(progress.xp),
      streak: Number(progress.streak),
      lastStudyDate: normalizeIso(progress.lastStudyDate),
      sessionsCompleted: Number(progress.sessionsCompleted),
      history: progress.history as never,
      questionPerformance: progress.questionPerformance as never,
      recentQuestionIds: progress.recentQuestionIds as never,
      mistakes: mistakes.items as never,
    },
    normalizeIso(value.exportedAt) ?? new Date().toISOString()
  );

  return { ok: true, payload: normalized };
}

/** Payload vazio canônico (usado como base quando o remoto é inválido). */
export function createEmptyPayload(
  exportedAt: string = new Date().toISOString()
): ProgressSyncPayloadV1 {
  return serializeSnapshot(
    {
      foreignLanguage: null,
      foreignLanguageUpdatedAt: null,
      xp: 0,
      streak: 0,
      lastStudyDate: null,
      sessionsCompleted: 0,
      history: [],
      questionPerformance: {},
      recentQuestionIds: [],
      mistakes: [],
    },
    exportedAt
  );
}

export function isProgressPayloadEmpty(payload: ProgressSyncPayloadV1): boolean {
  const { progress, mistakes } = payload;
  return (
    progress.xp === 0 &&
    progress.streak === 0 &&
    progress.sessionsCompleted === 0 &&
    progress.history.length === 0 &&
    Object.keys(progress.questionPerformance).length === 0 &&
    progress.recentQuestionIds.length === 0 &&
    mistakes.items.length === 0
  );
}

export function estimatePayloadSize(payload: ProgressSyncPayloadV1): number {
  try {
    return JSON.stringify(payload).length;
  } catch {
    return 0;
  }
}
