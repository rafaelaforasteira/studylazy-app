/**
 * Lógica PURA de entitlements — testável no Node sem React Native.
 */
import { getLocalDateKey } from '../utils/date';
import type { LessonHistoryItem } from '../store/progressLogic';
import { BETA_SOFT_LIMITS, FREE_LIMITS, PRO_LIMITS } from './limits';
import type {
  EntitlementSource,
  EntitlementState,
  LimitDecision,
  UserPlan,
} from './types';

export type EntitlementStoreSnapshot = {
  plan: UserPlan;
  devProEnabled: boolean;
  source: EntitlementSource;
  entitlementCheckedAt?: string | null;
};

export type ProgressSnapshot = {
  lessonHistory: LessonHistoryItem[];
  answeredQuestionsToday: number;
  dailyProgressDate: string | null;
  lastStudyDate: string | null;
};

export function resolveEntitlementState(
  store: EntitlementStoreSnapshot
): EntitlementState {
  if (store.devProEnabled) {
    return { plan: 'pro', isPro: true, source: 'local_dev' };
  }
  const isPro = store.plan === 'pro';
  return {
    plan: store.plan,
    isPro,
    source: store.source,
  };
}

export function getPlanLimits(entitlement: EntitlementState) {
  return entitlement.isPro ? PRO_LIMITS : FREE_LIMITS;
}

export function countSessionsOnDate(
  history: LessonHistoryItem[],
  dateKey: string
): number {
  return history.filter((item) => item.date === dateKey).length;
}

export function getEffectiveDailyQuestions(
  progress: ProgressSnapshot,
  today = getLocalDateKey()
): number {
  const savedDate = progress.dailyProgressDate ?? progress.lastStudyDate;
  if (savedDate !== today) {
    return 0;
  }
  return Math.max(0, progress.answeredQuestionsToday);
}

export function checkSessionStart(params: {
  entitlement: EntitlementState;
  progress: ProgressSnapshot;
  questionCount: number;
  today?: string;
}): LimitDecision {
  const today = params.today ?? getLocalDateKey();
  const limits = getPlanLimits(params.entitlement);

  if (params.entitlement.isPro) {
    return { allowed: true, softOverride: false };
  }

  const sessionsToday = countSessionsOnDate(
    params.progress.lessonHistory,
    today
  );
  if (sessionsToday >= limits.dailySessions) {
    return {
      allowed: false,
      reason: 'daily_sessions',
      message: `Você atingiu o limite de ${limits.dailySessions} sessões por dia no plano gratuito. O StudyLazy Pro oferece estudo ilimitado.`,
      softOverride: BETA_SOFT_LIMITS,
    };
  }

  const answeredToday = getEffectiveDailyQuestions(params.progress, today);
  const projected = answeredToday + params.questionCount;
  if (projected > limits.dailyQuestions) {
    return {
      allowed: false,
      reason: 'daily_questions',
      message: `Você está próximo do limite de ${limits.dailyQuestions} questões por dia no plano gratuito. O StudyLazy Pro remove esse limite.`,
      softOverride: BETA_SOFT_LIMITS,
    };
  }

  return { allowed: true, softOverride: false };
}

export function getReviewMistakeLimit(
  entitlement: EntitlementState
): number {
  return getPlanLimits(entitlement).dailyReviewMistakes;
}

export function sliceReviewQueue<T>(
  items: T[],
  entitlement: EntitlementState
): T[] {
  const limit = getReviewMistakeLimit(entitlement);
  if (!Number.isFinite(limit)) {
    return items;
  }
  return items.slice(0, limit);
}

export function shouldShowReviewLimitHint(
  mistakeCount: number,
  entitlement: EntitlementState
): boolean {
  if (entitlement.isPro) {
    return false;
  }
  return mistakeCount > FREE_LIMITS.dailyReviewMistakes;
}

export function canAccessAdvancedStats(
  entitlement: EntitlementState
): boolean {
  return getPlanLimits(entitlement).advancedStats;
}
