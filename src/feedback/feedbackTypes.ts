/** Tipos do sistema de NPS e feedback do beta. */

export type NpsScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type FeedbackKind = 'nps' | 'bug' | 'suggestion' | 'general';

export type FeedbackStatus = 'pending' | 'synced' | 'failed';

export type NpsGroup = 'detractor' | 'passive' | 'promoter';

export type FeedbackCategory =
  | 'experience'
  | 'bug'
  | 'suggestion'
  | 'lives'
  | 'content'
  | 'other';

export type FeedbackEntry = {
  id: string;
  kind: FeedbackKind;
  score: number | null;
  npsGroup: NpsGroup | null;
  category: FeedbackCategory | null;
  comment: string | null;
  improvement: string | null;
  screen: string | null;
  platform: string;
  appVersion: string;
  userId: string | null;
  guestId: string | null;
  createdAt: string;
  status: FeedbackStatus;
  syncedAt: string | null;
};

export type NpsPromptContext = {
  /** Timestamp da primeira abertura registrada no store. */
  firstOpenedAt: string | null;
  /** Momento em que o NPS foi exibido pela última vez. */
  lastNpsShownAt: string | null;
  /** Até quando o usuário pediu para não ver o NPS. */
  dismissedUntil: string | null;
  /** Quantidade de sessões de estudo concluídas. */
  completedSessions: number;
  /** Já enviou pelo menos um NPS. */
  hasSubmittedNps: boolean;
  /** Momento atual (ms), injetável para testes. */
  nowMs?: number;
  /** Motivo contextual: fim de sessão, vidas zeradas, manual. */
  trigger?: 'session_end' | 'out_of_lives' | 'manual' | 'auto';
};

export type NpsPromptDecision = {
  shouldShow: boolean;
  reason:
    | 'ok'
    | 'manual'
    | 'first_open'
    | 'too_few_sessions'
    | 'cooldown'
    | 'dismissed'
    | 'already_submitted_recently';
};

/** Cooldown padrão após mostrar ou dispensar NPS (7 dias). */
export const NPS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Mínimo de sessões concluídas antes de sugerir NPS automático. */
export const NPS_MIN_COMPLETED_SESSIONS = 2;

/** Tempo mínimo desde a primeira abertura (1 hora) — evita NPS na primeira sessão rápida. */
export const NPS_MIN_APP_AGE_MS = 60 * 60 * 1000;

/** Após enviar NPS, não perguntar de novo por 30 dias. */
export const NPS_RESUBMIT_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export const MAX_COMMENT_LENGTH = 2000;
