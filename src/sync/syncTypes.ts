/**
 * Tipos do payload versionado de sincronização de progresso.
 *
 * Puro: reutiliza os tipos reais dos stores. Nenhum dado sensível (token,
 * sessão, senha) e nenhum conteúdo do banco de questões entra aqui.
 */
import type { LessonHistoryItem } from '../store/progressLogic';
import type { MistakeItem } from '../store/mistakeStore';
import type { QuestionPerformance } from '../store/studyProgressStore';
import type {
  ForeignLanguagePreference,
  QuestionOriginType,
} from '../data/questionTypes';

export const SYNC_SCHEMA_VERSION = 1 as const;

/** Máximo de IDs recentes mantidos no payload (espelha o runtime). */
export const RECENT_IDS_LIMIT = 30;

export type SyncProfileSection = {
  foreignLanguage: ForeignLanguagePreference | null;
  /** Metadado confiável para resolver conflito de idioma (ISO ou null). */
  foreignLanguageUpdatedAt: string | null;
};

export type SyncProgressSection = {
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  sessionsCompleted: number;
  history: LessonHistoryItem[];
  questionPerformance: Record<string, QuestionPerformance>;
  recentQuestionIds: string[];
};

/**
 * Erro sincronizado: SOMENTE dados mínimos. Nunca enunciado, alternativas,
 * prompt, textos de apoio, explicações ou gabarito de questão oficial. A
 * revisão reconstrói a questão a partir do banco oficial via `stableQuestionId`.
 */
export type SyncMistakeItem = {
  stableQuestionId: string;
  subject: string;
  errorCount: number;
  lastAnsweredAt: string;
  /** Escolha do usuário (curta) — útil para diagnóstico, não é enunciado. */
  selectedAnswer?: string;
  /**
   * Resposta correta apenas quando NÃO é reconstruível do banco oficial
   * (questões legadas/não oficiais). Para oficiais, fica de fora.
   */
  correctAnswer?: string;
  externalId?: string;
  topic?: string;
  area?: string;
  year?: number;
  source?: string;
  originType?: QuestionOriginType;
};

export type SyncMistakesSection = {
  items: SyncMistakeItem[];
};

export type ProgressSyncPayloadV1 = {
  version: 1;
  exportedAt: string;
  profile: SyncProfileSection;
  progress: SyncProgressSection;
  mistakes: SyncMistakesSection;
};

export type ProgressSyncPayload = ProgressSyncPayloadV1;

/** Entrada bruta (vinda dos stores) para serializar um snapshot. */
export type LocalSnapshotInput = {
  foreignLanguage: ForeignLanguagePreference | null;
  foreignLanguageUpdatedAt: string | null;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  sessionsCompleted: number;
  history: LessonHistoryItem[];
  questionPerformance: Record<string, QuestionPerformance>;
  recentQuestionIds: string[];
  mistakes: MistakeItem[];
};

export type ValidationOk = { ok: true; payload: ProgressSyncPayloadV1 };
export type ValidationFail = { ok: false; error: string };
export type ValidationResult = ValidationOk | ValidationFail;
