/**
 * Lógica PURA de NPS e feedback — testável no Node sem React Native.
 */
import {
  MAX_COMMENT_LENGTH,
  NPS_COOLDOWN_MS,
  NPS_MIN_APP_AGE_MS,
  NPS_MIN_COMPLETED_SESSIONS,
  NPS_RESUBMIT_COOLDOWN_MS,
  type FeedbackEntry,
  type FeedbackKind,
  type FeedbackStatus,
  type NpsGroup,
  type NpsPromptContext,
  type NpsPromptDecision,
  type NpsScore,
} from './feedbackTypes';

export function isValidNpsScore(value: unknown): value is NpsScore {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10
  );
}

export function classifyNpsScore(score: number): NpsGroup | null {
  if (!isValidNpsScore(score)) {
    return null;
  }
  if (score <= 6) {
    return 'detractor';
  }
  if (score <= 8) {
    return 'passive';
  }
  return 'promoter';
}

/**
 * NPS = % promotores − % detratores (sobre o total de respostas com score).
 * Retorna null se não houver respostas.
 */
export function calculateNps(scores: number[]): number | null {
  const valid = scores.filter((score) => isValidNpsScore(score));
  if (valid.length === 0) {
    return null;
  }
  let promoters = 0;
  let detractors = 0;
  valid.forEach((score) => {
    const group = classifyNpsScore(score);
    if (group === 'promoter') {
      promoters += 1;
    } else if (group === 'detractor') {
      detractors += 1;
    }
  });
  const total = valid.length;
  return Math.round((promoters / total) * 100 - (detractors / total) * 100);
}

export function summarizeNps(scores: number[]): {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  average: number | null;
  nps: number | null;
} {
  const valid = scores.filter((score) => isValidNpsScore(score));
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  let sum = 0;
  valid.forEach((score) => {
    sum += score;
    const group = classifyNpsScore(score);
    if (group === 'promoter') {
      promoters += 1;
    } else if (group === 'passive') {
      passives += 1;
    } else if (group === 'detractor') {
      detractors += 1;
    }
  });
  return {
    total: valid.length,
    promoters,
    passives,
    detractors,
    average: valid.length > 0 ? sum / valid.length : null,
    nps: calculateNps(valid),
  };
}

export function sanitizeComment(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim().slice(0, MAX_COMMENT_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
}

export function shouldShowNpsPrompt(
  context: NpsPromptContext
): NpsPromptDecision {
  const nowMs = context.nowMs ?? Date.now();

  // Abertura manual sempre permitida (tela Você / feedback).
  if (context.trigger === 'manual') {
    return { shouldShow: true, reason: 'manual' };
  }

  if (!context.firstOpenedAt) {
    return { shouldShow: false, reason: 'first_open' };
  }

  const firstOpenedMs = Date.parse(context.firstOpenedAt);
  if (Number.isNaN(firstOpenedMs) || nowMs - firstOpenedMs < NPS_MIN_APP_AGE_MS) {
    return { shouldShow: false, reason: 'first_open' };
  }

  if (context.completedSessions < NPS_MIN_COMPLETED_SESSIONS) {
    return { shouldShow: false, reason: 'too_few_sessions' };
  }

  if (context.dismissedUntil) {
    const until = Date.parse(context.dismissedUntil);
    if (!Number.isNaN(until) && nowMs < until) {
      return { shouldShow: false, reason: 'dismissed' };
    }
  }

  if (context.hasSubmittedNps && context.lastNpsShownAt) {
    const last = Date.parse(context.lastNpsShownAt);
    if (!Number.isNaN(last) && nowMs - last < NPS_RESUBMIT_COOLDOWN_MS) {
      return { shouldShow: false, reason: 'already_submitted_recently' };
    }
  }

  if (context.lastNpsShownAt) {
    const last = Date.parse(context.lastNpsShownAt);
    if (!Number.isNaN(last) && nowMs - last < NPS_COOLDOWN_MS) {
      return { shouldShow: false, reason: 'cooldown' };
    }
  }

  return { shouldShow: true, reason: 'ok' };
}

export function createDismissedUntil(
  nowMs = Date.now(),
  cooldownMs = NPS_COOLDOWN_MS
): string {
  return new Date(nowMs + cooldownMs).toISOString();
}

export function createFeedbackId(nowMs = Date.now()): string {
  return `fb_${nowMs}_${Math.random().toString(36).slice(2, 10)}`;
}

export function countByStatus(
  entries: FeedbackEntry[],
  status: FeedbackStatus
): number {
  return entries.filter((entry) => entry.status === status).length;
}

export function mentionsLives(text: string | null | undefined): boolean {
  if (!text) {
    return false;
  }
  return /\bvidas?\b|\bhearts?\b|\bvidas?\s+zerad/i.test(text);
}

export function isBugOrSuggestion(kind: FeedbackKind): boolean {
  return kind === 'bug' || kind === 'suggestion' || kind === 'general';
}

/** Bug/sugestão não exige score; NPS exige. */
export function validateFeedbackInput(params: {
  kind: FeedbackKind;
  score?: number | null;
  comment?: string | null;
}): { ok: true } | { ok: false; error: string } {
  if (params.kind === 'nps') {
    if (!isValidNpsScore(params.score)) {
      return { ok: false, error: 'Escolha uma nota de 0 a 10.' };
    }
    return { ok: true };
  }

  const comment = sanitizeComment(params.comment);
  if (!comment) {
    return { ok: false, error: 'Escreva um comentário curto para enviar.' };
  }
  return { ok: true };
}

export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) {
    return '—';
  }
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return '—';
  }
  const visible = local.slice(0, 1);
  return `${visible}…@${domain}`;
}
