/**
 * Lógica PURA de conquistas — testável no Node sem React Native.
 */
import type {
  AchievementCounters,
  AchievementDefinition,
  AchievementId,
  AchievementSnapshot,
  AchievementView,
  UnlockedAchievement,
} from './achievementTypes';

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    id: 'first_lesson',
    category: 'study',
    title: 'Primeira lição',
    description: 'Conclua sua primeira sessão de estudo.',
    target: 1,
    icon: '📘',
  },
  {
    id: 'lessons_5',
    category: 'study',
    title: '5 lições',
    description: 'Conclua 5 sessões de estudo.',
    target: 5,
    icon: '📚',
  },
  {
    id: 'lessons_10',
    category: 'study',
    title: '10 lições',
    description: 'Conclua 10 sessões de estudo.',
    target: 10,
    icon: '🎓',
  },
  {
    id: 'questions_10',
    category: 'questions',
    title: '10 questões',
    description: 'Responda 10 questões.',
    target: 10,
    icon: '✏️',
  },
  {
    id: 'questions_50',
    category: 'questions',
    title: '50 questões',
    description: 'Responda 50 questões.',
    target: 50,
    icon: '📝',
  },
  {
    id: 'questions_100',
    category: 'questions',
    title: '100 questões',
    description: 'Responda 100 questões.',
    target: 100,
    icon: '💯',
  },
  {
    id: 'correct_10',
    category: 'questions',
    title: '10 acertos',
    description: 'Acerte 10 questões.',
    target: 10,
    icon: '✅',
  },
  {
    id: 'correct_50',
    category: 'questions',
    title: '50 acertos',
    description: 'Acerte 50 questões.',
    target: 50,
    icon: '🌟',
  },
  {
    id: 'first_review',
    category: 'review',
    title: 'Primeira revisão',
    description: 'Responda uma questão na revisão de erros.',
    target: 1,
    icon: '🔄',
  },
  {
    id: 'reviews_10',
    category: 'review',
    title: '10 revisões',
    description: 'Revise 10 erros.',
    target: 10,
    icon: '♻️',
  },
  {
    id: 'life_recovered_from_review',
    category: 'lives',
    title: 'Vida recuperada',
    description: 'Recupere 1 vida acertando na revisão.',
    target: 1,
    icon: '❤️',
  },
  {
    id: 'all_daily_missions',
    category: 'missions',
    title: 'Missões do dia',
    description: 'Complete todas as missões diárias.',
    target: 1,
    icon: '🎯',
  },
  {
    id: 'streak_3',
    category: 'streak',
    title: '3 dias de streak',
    description: 'Mantenha 3 dias de sequência.',
    target: 3,
    icon: '🔥',
  },
  {
    id: 'streak_7',
    category: 'streak',
    title: '7 dias de streak',
    description: 'Mantenha 7 dias de sequência.',
    target: 7,
    icon: '🔥',
  },
  {
    id: 'xp_100',
    category: 'xp',
    title: '100 XP',
    description: 'Acumule 100 XP.',
    target: 100,
    icon: '⭐',
  },
  {
    id: 'xp_500',
    category: 'xp',
    title: '500 XP',
    description: 'Acumule 500 XP.',
    target: 500,
    icon: '🏆',
  },
] as const;

function safeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function createEmptyCounters(): AchievementCounters {
  return {
    lessonsCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    reviewsAnswered: 0,
    livesRecoveredFromReview: 0,
    allDailyMissionsCompleted: 0,
    maxStreakSeen: 0,
    xpSeen: 0,
  };
}

export function createEmptyAchievementSnapshot(): AchievementSnapshot {
  return {
    counters: createEmptyCounters(),
    unlocked: [],
    recentlyUnlocked: [],
  };
}

function counterValueFor(
  id: AchievementId,
  counters: AchievementCounters
): number {
  switch (id) {
    case 'first_lesson':
    case 'lessons_5':
    case 'lessons_10':
      return counters.lessonsCompleted;
    case 'questions_10':
    case 'questions_50':
    case 'questions_100':
      return counters.questionsAnswered;
    case 'correct_10':
    case 'correct_50':
      return counters.correctAnswers;
    case 'first_review':
    case 'reviews_10':
      return counters.reviewsAnswered;
    case 'life_recovered_from_review':
      return counters.livesRecoveredFromReview;
    case 'all_daily_missions':
      return counters.allDailyMissionsCompleted;
    case 'streak_3':
    case 'streak_7':
      return counters.maxStreakSeen;
    case 'xp_100':
    case 'xp_500':
      return counters.xpSeen;
    default:
      return 0;
  }
}

export function isAchievementUnlocked(
  unlocked: UnlockedAchievement[],
  id: AchievementId
): boolean {
  return unlocked.some((item) => item.id === id);
}

/**
 * Avalia conquistas pendentes com base nos contadores.
 * Nunca reabre conquista já desbloqueada.
 */
export function evaluateAchievements(
  snapshot: AchievementSnapshot,
  nowMs = Date.now()
): { snapshot: AchievementSnapshot; newlyUnlocked: AchievementId[] } {
  const nowIso = new Date(nowMs).toISOString();
  const unlockedIds = new Set(snapshot.unlocked.map((item) => item.id));
  const newlyUnlocked: AchievementId[] = [];
  const nextUnlocked = [...snapshot.unlocked];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.has(definition.id)) {
      continue;
    }
    const value = counterValueFor(definition.id, snapshot.counters);
    if (value >= definition.target) {
      unlockedIds.add(definition.id);
      newlyUnlocked.push(definition.id);
      nextUnlocked.push({ id: definition.id, unlockedAt: nowIso });
    }
  }

  if (newlyUnlocked.length === 0) {
    return { snapshot, newlyUnlocked: [] };
  }

  return {
    snapshot: {
      ...snapshot,
      unlocked: nextUnlocked,
      recentlyUnlocked: [
        ...newlyUnlocked,
        ...snapshot.recentlyUnlocked.filter((id) => !newlyUnlocked.includes(id)),
      ].slice(0, 8),
    },
    newlyUnlocked,
  };
}

function withEvaluation(
  snapshot: AchievementSnapshot,
  counters: AchievementCounters,
  nowMs: number
): { snapshot: AchievementSnapshot; newlyUnlocked: AchievementId[] } {
  return evaluateAchievements({ ...snapshot, counters }, nowMs);
}

export function recordStudySessionCompleted(
  snapshot: AchievementSnapshot,
  amount = 1,
  nowMs = Date.now()
) {
  const delta = safeCount(amount) || 1;
  const counters = {
    ...snapshot.counters,
    lessonsCompleted: snapshot.counters.lessonsCompleted + delta,
  };
  return withEvaluation(snapshot, counters, nowMs);
}

export function recordQuestionAnswered(
  snapshot: AchievementSnapshot,
  amount = 1,
  nowMs = Date.now()
) {
  const delta = safeCount(amount);
  if (delta <= 0) {
    return { snapshot, newlyUnlocked: [] as AchievementId[] };
  }
  const counters = {
    ...snapshot.counters,
    questionsAnswered: snapshot.counters.questionsAnswered + delta,
  };
  return withEvaluation(snapshot, counters, nowMs);
}

export function recordCorrectAnswer(
  snapshot: AchievementSnapshot,
  amount = 1,
  nowMs = Date.now()
) {
  const delta = safeCount(amount);
  if (delta <= 0) {
    return { snapshot, newlyUnlocked: [] as AchievementId[] };
  }
  const counters = {
    ...snapshot.counters,
    correctAnswers: snapshot.counters.correctAnswers + delta,
  };
  return withEvaluation(snapshot, counters, nowMs);
}

export function recordReviewAnswered(
  snapshot: AchievementSnapshot,
  amount = 1,
  nowMs = Date.now()
) {
  const delta = safeCount(amount) || 1;
  const counters = {
    ...snapshot.counters,
    reviewsAnswered: snapshot.counters.reviewsAnswered + delta,
  };
  return withEvaluation(snapshot, counters, nowMs);
}

export function recordLifeRecoveredFromReview(
  snapshot: AchievementSnapshot,
  amount = 1,
  nowMs = Date.now()
) {
  const delta = safeCount(amount) || 1;
  const counters = {
    ...snapshot.counters,
    livesRecoveredFromReview:
      snapshot.counters.livesRecoveredFromReview + delta,
  };
  return withEvaluation(snapshot, counters, nowMs);
}

export function recordAllDailyMissionsCompleted(
  snapshot: AchievementSnapshot,
  nowMs = Date.now()
) {
  const counters = {
    ...snapshot.counters,
    allDailyMissionsCompleted:
      snapshot.counters.allDailyMissionsCompleted + 1,
  };
  return withEvaluation(snapshot, counters, nowMs);
}

/**
 * Evento de missão individual concluída.
 * As conquistas iniciais só premiarem “todas as missões do dia”
 * via `recordAllDailyMissionsCompleted`.
 */
export function recordDailyMissionCompleted(
  snapshot: AchievementSnapshot,
  _nowMs = Date.now()
) {
  return { snapshot, newlyUnlocked: [] as AchievementId[] };
}

export function recordXpChanged(
  snapshot: AchievementSnapshot,
  totalXp: number,
  nowMs = Date.now()
) {
  const xp = safeCount(totalXp);
  if (xp <= snapshot.counters.xpSeen) {
    return { snapshot, newlyUnlocked: [] as AchievementId[] };
  }
  const counters = { ...snapshot.counters, xpSeen: xp };
  return withEvaluation(snapshot, counters, nowMs);
}

export function recordStreakChanged(
  snapshot: AchievementSnapshot,
  streak: number,
  nowMs = Date.now()
) {
  const value = safeCount(streak);
  if (value <= snapshot.counters.maxStreakSeen) {
    return { snapshot, newlyUnlocked: [] as AchievementId[] };
  }
  const counters = { ...snapshot.counters, maxStreakSeen: value };
  return withEvaluation(snapshot, counters, nowMs);
}

export function clearRecentlyUnlocked(
  snapshot: AchievementSnapshot
): AchievementSnapshot {
  if (snapshot.recentlyUnlocked.length === 0) {
    return snapshot;
  }
  return { ...snapshot, recentlyUnlocked: [] };
}

export function getAchievementViews(
  snapshot: AchievementSnapshot
): AchievementView[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const unlocked = snapshot.unlocked.find((item) => item.id === definition.id);
    const progress = Math.min(
      definition.target,
      counterValueFor(definition.id, snapshot.counters)
    );
    return {
      ...definition,
      status: unlocked ? 'unlocked' : 'locked',
      progress,
      unlockedAt: unlocked?.unlockedAt ?? null,
    };
  });
}

export function unlockAchievementDev(
  snapshot: AchievementSnapshot,
  id: AchievementId,
  nowMs = Date.now()
): AchievementSnapshot {
  if (isAchievementUnlocked(snapshot.unlocked, id)) {
    return snapshot;
  }
  const definition = ACHIEVEMENT_DEFINITIONS.find((item) => item.id === id);
  if (!definition) {
    return snapshot;
  }
  const counters = { ...snapshot.counters };
  const needed = definition.target;
  switch (id) {
    case 'first_lesson':
    case 'lessons_5':
    case 'lessons_10':
      counters.lessonsCompleted = Math.max(counters.lessonsCompleted, needed);
      break;
    case 'questions_10':
    case 'questions_50':
    case 'questions_100':
      counters.questionsAnswered = Math.max(counters.questionsAnswered, needed);
      break;
    case 'correct_10':
    case 'correct_50':
      counters.correctAnswers = Math.max(counters.correctAnswers, needed);
      break;
    case 'first_review':
    case 'reviews_10':
      counters.reviewsAnswered = Math.max(counters.reviewsAnswered, needed);
      break;
    case 'life_recovered_from_review':
      counters.livesRecoveredFromReview = Math.max(
        counters.livesRecoveredFromReview,
        needed
      );
      break;
    case 'all_daily_missions':
      counters.allDailyMissionsCompleted = Math.max(
        counters.allDailyMissionsCompleted,
        needed
      );
      break;
    case 'streak_3':
    case 'streak_7':
      counters.maxStreakSeen = Math.max(counters.maxStreakSeen, needed);
      break;
    case 'xp_100':
    case 'xp_500':
      counters.xpSeen = Math.max(counters.xpSeen, needed);
      break;
  }
  return evaluateAchievements({ ...snapshot, counters }, nowMs).snapshot;
}
