/**
 * Lógica PURA da fila de retry — testável no Node.
 * Não salva enunciado/alternativas; apenas stableQuestionId + metadata mínima.
 */
import {
  RETRY_MIX_MAX_RATIO,
  RETRY_MIX_MIN_RATIO,
  type RetryQueueItem,
  type RetryQueueSnapshot,
} from './retryQueueTypes';

export function createEmptyRetryQueue(): RetryQueueSnapshot {
  return { items: [] };
}

export function upsertRetryOnMiss(params: {
  queue: RetryQueueSnapshot;
  stableQuestionId: string;
  subject: string;
  nowIso?: string;
}): RetryQueueSnapshot {
  const id = params.stableQuestionId?.trim();
  if (!id) {
    return params.queue;
  }

  const nowIso = params.nowIso ?? new Date().toISOString();
  const items = [...params.queue.items];
  const index = items.findIndex(
    (item) =>
      item.stableQuestionId === id && item.subject === params.subject
  );

  if (index >= 0) {
    const existing = items[index];
    items[index] = {
      ...existing,
      errorCount: existing.errorCount + 1,
      lastMissedAt: nowIso,
      active: true,
      lastCorrectedAt: existing.lastCorrectedAt,
    };
    return { items };
  }

  items.unshift({
    stableQuestionId: id,
    subject: params.subject,
    errorCount: 1,
    lastMissedAt: nowIso,
    lastCorrectedAt: null,
    active: true,
  });

  return { items };
}

/**
 * Ao acertar, reduz prioridade: marca inactive e registra lastCorrectedAt.
 * O item permanece no histórico leve da fila, mas sai da prioridade máxima.
 */
export function reduceRetryOnCorrect(params: {
  queue: RetryQueueSnapshot;
  stableQuestionId: string;
  subject: string;
  nowIso?: string;
}): RetryQueueSnapshot {
  const id = params.stableQuestionId?.trim();
  if (!id) {
    return params.queue;
  }

  const nowIso = params.nowIso ?? new Date().toISOString();
  let changed = false;
  const items = params.queue.items.map((item) => {
    if (item.stableQuestionId !== id || item.subject !== params.subject) {
      return item;
    }
    changed = true;
    return {
      ...item,
      active: false,
      lastCorrectedAt: nowIso,
    };
  });

  return changed ? { items } : params.queue;
}

export function getActiveRetriesForSubject(
  queue: RetryQueueSnapshot,
  subject: string
): RetryQueueItem[] {
  return queue.items
    .filter((item) => item.active && item.subject === subject)
    .sort((a, b) => {
      if (b.errorCount !== a.errorCount) {
        return b.errorCount - a.errorCount;
      }
      return Date.parse(b.lastMissedAt) - Date.parse(a.lastMissedAt);
    });
}

export function getActiveRetryIds(
  queue: RetryQueueSnapshot,
  subject?: string
): Set<string> {
  const ids = new Set<string>();
  queue.items.forEach((item) => {
    if (!item.active) {
      return;
    }
    if (subject && item.subject !== subject) {
      return;
    }
    ids.add(item.stableQuestionId);
  });
  return ids;
}

export function computeRetryTargetCount(
  sessionSize: number,
  availableRetries: number,
  minRatio = RETRY_MIX_MIN_RATIO,
  maxRatio = RETRY_MIX_MAX_RATIO
): number {
  if (sessionSize <= 0 || availableRetries <= 0) {
    return 0;
  }
  const mid = (minRatio + maxRatio) / 2;
  const desired = Math.round(sessionSize * mid);
  const minDesired = Math.ceil(sessionSize * minRatio);
  const maxDesired = Math.floor(sessionSize * maxRatio);
  const clamped = Math.max(minDesired, Math.min(maxDesired, desired));
  return Math.min(availableRetries, Math.max(0, clamped), sessionSize);
}

/**
 * Mistura retries prioritários com o restante pontuado, sem duplicar IDs.
 * Intercala para evitar sessão 100% repetida.
 */
export function mixRetryIntoSelection<T extends { stableId: string }>(params: {
  scored: T[];
  activeRetryIds: Set<string>;
  targetCount: number;
}): T[] {
  const { scored, activeRetryIds, targetCount } = params;
  if (targetCount <= 0 || scored.length === 0) {
    return [];
  }

  const retries = scored.filter((item) => activeRetryIds.has(item.stableId));
  const others = scored.filter((item) => !activeRetryIds.has(item.stableId));
  const retryTarget = computeRetryTargetCount(targetCount, retries.length);

  const pickedRetries = retries.slice(0, retryTarget);
  const pickedOthers = others.slice(0, Math.max(0, targetCount - pickedRetries.length));

  // Se ainda faltar (poucos others), completa com retries extras.
  const selected: T[] = [];
  const used = new Set<string>();

  function pushItem(item: T) {
    if (used.has(item.stableId) || selected.length >= targetCount) {
      return;
    }
    used.add(item.stableId);
    selected.push(item);
  }

  // Intercala: retry, other, retry, other...
  let ri = 0;
  let oi = 0;
  while (selected.length < targetCount && (ri < pickedRetries.length || oi < pickedOthers.length)) {
    if (ri < pickedRetries.length) {
      pushItem(pickedRetries[ri]);
      ri += 1;
    }
    if (oi < pickedOthers.length) {
      pushItem(pickedOthers[oi]);
      oi += 1;
    }
  }

  // Completa com o restante da lista pontuada (sem duplicar).
  for (const item of scored) {
    if (selected.length >= targetCount) {
      break;
    }
    pushItem(item);
  }

  return selected;
}

export function clearRetryQueue(): RetryQueueSnapshot {
  return { items: [] };
}

/** Contagem de erros ativos (para UI). */
export function countActiveRetries(queue: RetryQueueSnapshot): number {
  return queue.items.filter((item) => item.active).length;
}
