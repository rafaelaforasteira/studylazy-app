/** Constantes e tipos do sistema de vidas (estilo Duolingo). */

export const MAX_LIVES = 5 as const;

/** Intervalo de regeneração: 1 vida a cada 30 minutos. */
export const LIFE_REGEN_MS = 30 * 60 * 1000;

/** Fragmentos necessários para recuperar 1 vida na revisão. */
export const FRAGMENTS_PER_LIFE = 2 as const;

/** Limite do histórico leve de recompensas por revisão. */
export const MAX_REVIEW_REWARD_HISTORY = 200 as const;

export type ReviewRewardRecord = {
  /** Identificador estável oficial — nunca enunciado. */
  stableQuestionId: string;
  rewardedAt: string;
};

export type LivesSnapshot = {
  currentLives: number;
  maxLives: number;
  lastLifeRegeneratedAt: string | null;
  lastLifeLostAt: string | null;
  totalLivesLost: number;
  isUnlimited: boolean;
  /** 0 ou 1 — dois fragmentos viram 1 vida. */
  lifeFragments: 0 | 1;
  totalLivesRecoveredFromReview: number;
  lastLifeRecoveredFromReviewAt: string | null;
  reviewRewardHistory: ReviewRewardRecord[];
};

export type LoseLifeResult = {
  applied: boolean;
  lives: number;
  reason?:
    | 'unlimited'
    | 'already_zero'
    | 'duplicate_guard'
    | 'ok';
};

export type CanStudyResult = {
  allowed: boolean;
  lives: number;
  isUnlimited: boolean;
  msUntilNextLife: number | null;
  message?: string;
};

export type RegenResult = {
  lives: number;
  regenerated: number;
  lastLifeRegeneratedAt: string | null;
};

export type ReviewRewardResult = {
  applied: boolean;
  recoveredLife: boolean;
  lifeFragments: 0 | 1;
  currentLives: number;
  reason:
    | 'ok_fragment'
    | 'ok_life'
    | 'unlimited'
    | 'already_rewarded'
    | 'full_lives'
    | 'invalid_id'
    | 'ineligible';
  message: string | null;
};
