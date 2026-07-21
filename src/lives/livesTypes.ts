/** Constantes e tipos do sistema de vidas (estilo Duolingo). */

export const MAX_LIVES = 5 as const;

/** Intervalo de regeneração: 1 vida a cada 30 minutos. */
export const LIFE_REGEN_MS = 30 * 60 * 1000;

export type LivesSnapshot = {
  currentLives: number;
  maxLives: number;
  lastLifeRegeneratedAt: string | null;
  lastLifeLostAt: string | null;
  totalLivesLost: number;
  isUnlimited: boolean;
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
