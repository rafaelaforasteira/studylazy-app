/**
 * Tipos da fila de retry (questões erradas com prioridade na próxima rodada).
 * Armazena apenas IDs estáveis — nunca o texto completo da questão.
 */

export const RETRY_MIX_MIN_RATIO = 0.4;
export const RETRY_MIX_MAX_RATIO = 0.6;

/** Boost de pontuação para itens ativos na fila de retry. */
export const RETRY_SELECTION_BOOST = 900;

export type RetryQueueItem = {
  /** Identificador estável da questão oficial. */
  stableQuestionId: string;
  subject: string;
  errorCount: number;
  lastMissedAt: string;
  /** Quando acertou pela última vez após estar na fila (prioridade reduzida). */
  lastCorrectedAt: string | null;
  /** true = prioridade máxima para próxima sessão da matéria. */
  active: boolean;
};

export type RetryQueueSnapshot = {
  items: RetryQueueItem[];
};
