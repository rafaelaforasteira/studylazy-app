/**
 * Merge determinístico e idempotente de dois snapshots de progresso.
 *
 * Puro: sem acesso a stores nem ao Supabase. Recalcula XP/streak a partir do
 * histórico deduplicado sempre que possível, evitando somar totais ou
 * incrementar apenas por sincronizar.
 *
 * LIMITAÇÃO (modelo por snapshot): a contagem por questão e por erro pode ser
 * super-estimada quando o MESMO evento ocorre offline em dois dispositivos,
 * pois não há log por evento. Usamos o maior valor consistente — nunca a soma
 * cega — para não duplicar nem perder progresso.
 */
import { toSafeCount } from '../store/progressLogic';
import type { LessonHistoryItem } from '../store/progressLogic';
import type { QuestionPerformance } from '../store/studyProgressStore';
import { getHistoryStableId } from './syncSerializer';
import {
  RECENT_IDS_LIMIT,
  SYNC_SCHEMA_VERSION,
  type ProgressSyncPayloadV1,
  type SyncMistakeItem,
} from './syncTypes';

export type MergeDiagnostics = {
  historyMerged: number;
  performanceMerged: number;
  mistakesMerged: number;
  languageConflict: boolean;
};

export type MergeResult = {
  payload: ProgressSyncPayloadV1;
  diagnostics: MergeDiagnostics;
};

function laterIso(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

function maxDateKey(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  // date-keys YYYY-MM-DD comparam lexicograficamente.
  return a >= b ? a : b;
}

function mergeHistory(
  local: LessonHistoryItem[],
  remote: LessonHistoryItem[]
): LessonHistoryItem[] {
  const byId = new Map<string, LessonHistoryItem>();

  [...local, ...remote].forEach((item) => {
    const id = getHistoryStableId(item);
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { ...item, id });
      return;
    }
    // Mesma sessão em ambos: preserva o maior valor consistente.
    byId.set(id, {
      ...existing,
      minutes: Math.max(existing.minutes, item.minutes),
      totalQuestions: Math.max(existing.totalQuestions, item.totalQuestions),
      correctAnswers: Math.max(existing.correctAnswers, item.correctAnswers),
      earnedXp: Math.max(existing.earnedXp, item.earnedXp),
      isRepeat: existing.isRepeat || item.isRepeat,
    });
  });

  return [...byId.values()].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1; // mais recente primeiro
    }
    return a.id < b.id ? 1 : -1;
  });
}

function recalcXpFromHistory(
  history: LessonHistoryItem[],
  fallback: number
): number {
  if (history.length === 0) {
    return toSafeCount(fallback);
  }
  return history.reduce((sum, item) => sum + toSafeCount(item.earnedXp), 0);
}

function recalcStreakFromHistory(
  history: LessonHistoryItem[],
  fallbackStreak: number,
  fallbackLastDate: string | null
): { streak: number; lastStudyDate: string | null } {
  const dates = Array.from(
    new Set(history.map((item) => item.date).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))
  ).sort(); // ascendente

  if (dates.length === 0) {
    return {
      streak: toSafeCount(fallbackStreak),
      lastStudyDate: fallbackLastDate,
    };
  }

  const lastStudyDate = dates[dates.length - 1];
  // Conta a sequência consecutiva terminando no último dia estudado.
  let streak = 1;
  for (let i = dates.length - 1; i > 0; i -= 1) {
    const current = new Date(`${dates[i]}T00:00:00Z`).getTime();
    const previous = new Date(`${dates[i - 1]}T00:00:00Z`).getTime();
    const diffDays = Math.round((current - previous) / 86_400_000);
    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return { streak, lastStudyDate };
}

function mergePerformance(
  local: Record<string, QuestionPerformance>,
  remote: Record<string, QuestionPerformance>
): Record<string, QuestionPerformance> {
  const result: Record<string, QuestionPerformance> = {};
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  keys.forEach((key) => {
    const a = local[key];
    const b = remote[key];
    if (a && !b) {
      result[key] = a;
      return;
    }
    if (b && !a) {
      result[key] = b;
      return;
    }
    if (!a || !b) {
      return;
    }
    const correctAttempts = Math.max(a.correctAttempts, b.correctAttempts);
    const incorrectAttempts = Math.max(a.incorrectAttempts, b.incorrectAttempts);
    const attempts = Math.max(
      a.attempts,
      b.attempts,
      correctAttempts + incorrectAttempts
    );
    const useA = laterIso(a.lastAnsweredAt, b.lastAnsweredAt) === a.lastAnsweredAt;
    result[key] = {
      stableQuestionId: key,
      attempts,
      correctAttempts,
      incorrectAttempts,
      lastAnsweredAt: laterIso(a.lastAnsweredAt, b.lastAnsweredAt),
      lastResult: useA ? a.lastResult : b.lastResult,
    };
  });

  return result;
}

function mergeRecentIds(local: string[], remote: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  [...local, ...remote].forEach((id) => {
    if (typeof id === 'string' && id.length > 0 && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  });
  return result.slice(0, RECENT_IDS_LIMIT);
}

function mergeMistakes(
  local: SyncMistakeItem[],
  remote: SyncMistakeItem[]
): SyncMistakeItem[] {
  const byKey = new Map<string, SyncMistakeItem>();

  [...local, ...remote].forEach((item) => {
    const key = item.stableQuestionId;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      return;
    }
    const newest =
      laterIso(existing.lastAnsweredAt || null, item.lastAnsweredAt || null) ===
      (item.lastAnsweredAt || null)
        ? item
        : existing;
    byKey.set(key, {
      ...newest,
      // Maior contagem consistente (não soma cega entre dispositivos).
      errorCount: Math.max(existing.errorCount, item.errorCount),
      lastAnsweredAt:
        laterIso(existing.lastAnsweredAt || null, item.lastAnsweredAt || null) ??
        newest.lastAnsweredAt,
    });
  });

  return [...byKey.values()].sort((a, b) => {
    const at = a.lastAnsweredAt ? Date.parse(a.lastAnsweredAt) : 0;
    const bt = b.lastAnsweredAt ? Date.parse(b.lastAnsweredAt) : 0;
    return bt - at;
  });
}

function mergeLanguage(
  local: ProgressSyncPayloadV1['profile'],
  remote: ProgressSyncPayloadV1['profile']
): { value: ProgressSyncPayloadV1['profile']; conflict: boolean } {
  const l = local.foreignLanguage;
  const r = remote.foreignLanguage;

  if (l === r) {
    return {
      value: {
        foreignLanguage: l,
        foreignLanguageUpdatedAt: laterIso(
          local.foreignLanguageUpdatedAt,
          remote.foreignLanguageUpdatedAt
        ),
      },
      conflict: false,
    };
  }
  if (l !== null && r === null) {
    return { value: { ...local }, conflict: false };
  }
  if (r !== null && l === null) {
    return { value: { ...remote }, conflict: false };
  }
  // Ambos não nulos e diferentes.
  const lu = local.foreignLanguageUpdatedAt;
  const ru = remote.foreignLanguageUpdatedAt;
  if (lu && ru) {
    return {
      value: Date.parse(lu) >= Date.parse(ru) ? { ...local } : { ...remote },
      conflict: false,
    };
  }
  if (lu && !ru) {
    return { value: { ...local }, conflict: false };
  }
  if (ru && !lu) {
    return { value: { ...remote }, conflict: false };
  }
  // Sem metadado confiável: preserva o local e registra diagnóstico.
  return { value: { ...local }, conflict: true };
}

export function mergeProgressSnapshots(
  local: ProgressSyncPayloadV1,
  remote: ProgressSyncPayloadV1
): MergeResult {
  const history = mergeHistory(local.progress.history, remote.progress.history);
  const xp = recalcXpFromHistory(
    history,
    Math.max(toSafeCount(local.progress.xp), toSafeCount(remote.progress.xp))
  );
  const { streak, lastStudyDate } = recalcStreakFromHistory(
    history,
    Math.max(
      toSafeCount(local.progress.streak),
      toSafeCount(remote.progress.streak)
    ),
    maxDateKey(local.progress.lastStudyDate, remote.progress.lastStudyDate)
  );
  const sessionsCompleted =
    history.length > 0
      ? history.length
      : Math.max(
          toSafeCount(local.progress.sessionsCompleted),
          toSafeCount(remote.progress.sessionsCompleted)
        );

  const questionPerformance = mergePerformance(
    local.progress.questionPerformance,
    remote.progress.questionPerformance
  );
  const recentQuestionIds = mergeRecentIds(
    local.progress.recentQuestionIds,
    remote.progress.recentQuestionIds
  );
  const mistakes = mergeMistakes(local.mistakes.items, remote.mistakes.items);
  const language = mergeLanguage(local.profile, remote.profile);

  const payload: ProgressSyncPayloadV1 = {
    version: SYNC_SCHEMA_VERSION,
    exportedAt: laterIso(local.exportedAt, remote.exportedAt) ?? local.exportedAt,
    profile: language.value,
    progress: {
      xp,
      streak,
      lastStudyDate,
      sessionsCompleted,
      history,
      questionPerformance,
      recentQuestionIds,
    },
    mistakes: { items: mistakes },
  };

  return {
    payload,
    diagnostics: {
      historyMerged: history.length,
      performanceMerged: Object.keys(questionPerformance).length,
      mistakesMerged: mistakes.length,
      languageConflict: language.conflict,
    },
  };
}
