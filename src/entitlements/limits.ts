/**
 * Limites centralizados do plano gratuito vs Pro.
 * Nenhum pagamento real — apenas estrutura de produto.
 */

export const FREE_LIMITS = {
  /** Sessões de estudo concluídas por dia. */
  dailySessions: 3,
  /** Questões respondidas por dia (todas as sessões). */
  dailyQuestions: 25,
  /** Erros revisados por dia na fila de revisão. */
  dailyReviewMistakes: 10,
  /** Estatísticas avançadas (bloqueadas no Free). */
  advancedStats: false,
} as const;

export const PRO_LIMITS = {
  dailySessions: Number.POSITIVE_INFINITY,
  dailyQuestions: Number.POSITIVE_INFINITY,
  dailyReviewMistakes: Number.POSITIVE_INFINITY,
  advancedStats: true,
} as const;

/**
 * Durante o beta interno, limites são informativos: o app avisa e oferece
 * CTA para Pro, mas permite continuar (fallback seguro).
 */
export const BETA_SOFT_LIMITS = true;
