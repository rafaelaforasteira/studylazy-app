import type { LessonHistoryItem } from '../store/studyProgressStore';
import { colors } from '../constants/colors';
import {
  getCurrentWeekDateKeys,
  getDateKeysForLastDays,
  getLocalDateKey,
  getWeekStartKey,
  isFutureDateKey,
  isTodayKey,
  parseLocalDateKey,
  WEEKDAY_CHART_LABELS,
  WEEKDAY_SHORT_LABELS,
} from './date';
import { getLevelInfo } from './gamification';

/** Product rule: default weekly study-day goal when user preference is unavailable. */
export const DEFAULT_WEEKLY_STUDY_DAY_GOAL = 5;

export const RADAR_SUBJECTS = [
  'Português',
  'Matemática',
  'Redação',
  'Ciências Humanas',
  'Ciências da Natureza',
] as const;

export type RadarSubject = (typeof RADAR_SUBJECTS)[number];

export const RADAR_SUBJECT_COLORS: Record<RadarSubject, string> = {
  Português: colors.primary,
  Matemática: colors.progress,
  Redação: colors.warning,
  'Ciências Humanas': colors.success,
  'Ciências da Natureza': colors.danger,
};

export type SubjectPerformance = {
  subject: RadarSubject;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  hasData: boolean;
};

export type PeriodComparison = {
  currentTotal: number;
  previousTotal: number;
  changePercent: number | null;
  hasComparison: boolean;
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
};

export type EvolutionPeriod = '7d' | '30d' | '90d';

export type EvolutionPoint = {
  label: string;
  minutes: number;
  key: string;
};

function safeDivide(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function roundPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function calculateTotalQuestions(history: LessonHistoryItem[]) {
  return history.reduce((sum, item) => sum + item.totalQuestions, 0);
}

export function calculateTotalCorrectAnswers(history: LessonHistoryItem[]) {
  return history.reduce((sum, item) => sum + item.correctAnswers, 0);
}

export function calculateAccuracy(history: LessonHistoryItem[]) {
  const totalQuestions = calculateTotalQuestions(history);
  const totalCorrect = calculateTotalCorrectAnswers(history);
  return roundPercent(safeDivide(totalCorrect, totalQuestions) * 100);
}

export function calculateTotalMinutes(history: LessonHistoryItem[]) {
  return history.reduce((sum, item) => sum + item.minutes, 0);
}

export function calculateAverageSessionMinutes(history: LessonHistoryItem[]) {
  if (history.length === 0) return 0;
  return Math.round(safeDivide(calculateTotalMinutes(history), history.length));
}

export function aggregateStudyByDay(
  history: LessonHistoryItem[],
  days: number,
  fromDate = new Date()
) {
  const keys = getDateKeysForLastDays(days, fromDate);
  const totals = new Map(keys.map((key) => [key, 0]));

  history.forEach((item) => {
    if (totals.has(item.date)) {
      totals.set(item.date, (totals.get(item.date) ?? 0) + item.minutes);
    }
  });

  return keys.map((key) => ({
    key,
    minutes: totals.get(key) ?? 0,
  }));
}

export function aggregateStudyByCurrentWeek(history: LessonHistoryItem[]) {
  const keys = getCurrentWeekDateKeys();
  const totals = new Map(keys.map((key) => [key, 0]));

  history.forEach((item) => {
    if (totals.has(item.date)) {
      totals.set(item.date, (totals.get(item.date) ?? 0) + item.minutes);
    }
  });

  return keys.map((key, index) => ({
    key,
    minutes: totals.get(key) ?? 0,
    label: WEEKDAY_CHART_LABELS[index],
  }));
}

export function aggregateStudyByWeek(history: LessonHistoryItem[], weeks: number) {
  const points: EvolutionPoint[] = [];
  const today = new Date();

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const weekAnchor = new Date(today);
    weekAnchor.setDate(today.getDate() - index * 7);
    const weekStart = getWeekStartKey(weekAnchor);
    const weekStartDate = parseLocalDateKey(weekStart);

    let minutes = 0;

    history.forEach((item) => {
      const itemDate = parseLocalDateKey(item.date);
      const diffDays = Math.floor(
        (itemDate.getTime() - weekStartDate.getTime()) / 86400000
      );

      if (diffDays >= 0 && diffDays < 7) {
        minutes += item.minutes;
      }
    });

    points.push({
      key: weekStart,
      label: formatWeekLabel(weekStartDate),
      minutes,
    });
  }

  return points;
}

export function aggregateStudyByMonth(
  history: LessonHistoryItem[],
  months: number
) {
  const points: EvolutionPoint[] = [];
  const today = new Date();

  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const minutes = history
      .filter((item) => {
        const itemDate = parseLocalDateKey(item.date);
        return (
          itemDate.getFullYear() === year && itemDate.getMonth() === month
        );
      })
      .reduce((sum, item) => sum + item.minutes, 0);

    points.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: monthDate.toLocaleDateString('pt-BR', { month: 'short' }),
      minutes,
    });
  }

  return points;
}

function formatWeekLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function getEvolutionSeries(
  history: LessonHistoryItem[],
  period: EvolutionPeriod
) {
  if (period === '7d') {
    return aggregateStudyByCurrentWeek(history);
  }

  if (period === '30d') {
    const daily = aggregateStudyByDay(history, 30);
    return daily.map((item) => ({
      ...item,
      label: formatShortDayMonthLabel(item.key),
    }));
  }

  return aggregateStudyByWeek(history, 13);
}

function formatShortDayMonthLabel(dateKey: string) {
  const date = parseLocalDateKey(dateKey);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function calculatePeriodComparison(
  history: LessonHistoryItem[],
  period: EvolutionPeriod
) {
  if (period === '7d') {
    const currentKeys = new Set(getCurrentWeekDateKeys());
    const previousWeekStart = parseLocalDateKey(getWeekStartKey());
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousKeys = new Set(getCurrentWeekDateKeys(previousWeekStart));

    const currentTotal = sumMinutesForKeys(history, currentKeys);
    const previousTotal = sumMinutesForKeys(history, previousKeys);

    return buildPeriodComparison(currentTotal, previousTotal);
  }

  const periodDays = period === '30d' ? 30 : 90;
  const currentKeys = new Set(getDateKeysForLastDays(periodDays));
  const previousAnchor = new Date();
  previousAnchor.setDate(previousAnchor.getDate() - periodDays);
  const previousKeys = new Set(
    getDateKeysForLastDays(periodDays, previousAnchor)
  );

  const currentTotal = sumMinutesForKeys(history, currentKeys);
  const previousTotal = sumMinutesForKeys(history, previousKeys);

  return buildPeriodComparison(currentTotal, previousTotal);
}

function sumMinutesForKeys(
  history: LessonHistoryItem[],
  keys: Set<string>
) {
  return history
    .filter((item) => keys.has(item.date))
    .reduce((sum, item) => sum + item.minutes, 0);
}

function buildPeriodComparison(
  currentTotal: number,
  previousTotal: number
): PeriodComparison {
  if (previousTotal <= 0) {
    return {
      currentTotal,
      previousTotal,
      changePercent: null,
      hasComparison: false,
    };
  }

  const changePercent = roundPercent(
    ((currentTotal - previousTotal) / previousTotal) * 100
  );

  return {
    currentTotal,
    previousTotal,
    changePercent,
    hasComparison: true,
  };
}

export function calculateSubjectPerformance(
  history: LessonHistoryItem[]
): SubjectPerformance[] {
  return RADAR_SUBJECTS.map((subject) => {
    const items = history.filter((item) => item.subject === subject);
    const totalQuestions = calculateTotalQuestions(items);
    const correctAnswers = calculateTotalCorrectAnswers(items);

    return {
      subject,
      totalQuestions,
      correctAnswers,
      accuracy: roundPercent(safeDivide(correctAnswers, totalQuestions) * 100),
      hasData: totalQuestions > 0,
    };
  });
}

export function getStrongestSubject(performance: SubjectPerformance[]) {
  const valid = performance.filter((item) => item.totalQuestions >= 5);

  if (valid.length < 2) {
    return null;
  }

  return [...valid].sort((a, b) => b.accuracy - a.accuracy)[0];
}

export function getWeakestSubject(performance: SubjectPerformance[]) {
  const valid = performance.filter((item) => item.totalQuestions >= 5);

  if (valid.length < 2) {
    return null;
  }

  return [...valid].sort((a, b) => a.accuracy - b.accuracy)[0];
}

export function getLevelTitle(level: number) {
  if (level <= 1) return 'Começando';
  if (level === 2) return 'Em evolução';
  if (level <= 4) return 'Consistente';
  if (level <= 7) return 'Focada';
  return 'Imparável';
}

export function calculateAchievements(params: {
  history: LessonHistoryItem[];
  sessionsCompleted: number;
  streak: number;
  xp: number;
}) {
  const { history, sessionsCompleted, streak, xp } = params;
  const totalQuestions = calculateTotalQuestions(history);
  const hasPerfectLesson = history.some(
    (item) =>
      item.totalQuestions > 0 &&
      item.correctAnswers === item.totalQuestions
  );

  const definitions: AchievementDefinition[] = [
    {
      id: 'first-lesson',
      title: 'Primeira lição',
      description: 'Conclua sua primeira sessão de estudos.',
      unlocked: sessionsCompleted >= 1,
      progress: Math.min(sessionsCompleted, 1),
      target: 1,
    },
    {
      id: 'five-lessons',
      title: '5 lições concluídas',
      description: 'Complete cinco sessões de estudo.',
      unlocked: sessionsCompleted >= 5,
      progress: Math.min(sessionsCompleted, 5),
      target: 5,
    },
    {
      id: 'hundred-questions',
      title: '100 questões respondidas',
      description: 'Responda 100 questões no total.',
      unlocked: totalQuestions >= 100,
      progress: Math.min(totalQuestions, 100),
      target: 100,
    },
    {
      id: 'perfect-lesson',
      title: 'Lição perfeita',
      description: 'Acerte todas as questões em uma sessão.',
      unlocked: hasPerfectLesson,
    },
    {
      id: 'seven-streak',
      title: '7 dias de sequência',
      description: 'Mantenha uma sequência de 7 dias.',
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    },
    {
      id: 'thousand-xp',
      title: '1.000 XP',
      description: 'Acumule 1.000 pontos de experiência.',
      unlocked: xp >= 1000,
      progress: Math.min(xp, 1000),
      target: 1000,
    },
  ];

  return definitions;
}

export type WeekCalendarDay = {
  key: string;
  weekdayLabel: string;
  dayOfMonth: number;
  isActive: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export function getWeekCalendarDays(history: LessonHistoryItem[]) {
  const keys = getCurrentWeekDateKeys();
  const activeDates = new Set(
    history
      .filter((item) => keys.includes(item.date))
      .map((item) => item.date)
  );

  return keys.map((key, index) => {
    const date = parseLocalDateKey(key);

    return {
      key,
      weekdayLabel: WEEKDAY_SHORT_LABELS[index],
      dayOfMonth: date.getDate(),
      isActive: activeDates.has(key),
      isToday: isTodayKey(key),
      isFuture: isFutureDateKey(key),
    } satisfies WeekCalendarDay;
  });
}

export function getActiveDaysInCurrentWeek(history: LessonHistoryItem[]) {
  const keys = getCurrentWeekDateKeys();
  const active = new Set(
    history.filter((item) => keys.includes(item.date)).map((item) => item.date)
  );

  return {
    activeDays: active.size,
    totalDays: keys.length,
    activeDateKeys: keys.filter((key) => active.has(key)),
  };
}

export function getActiveDaysInLastWeek(history: LessonHistoryItem[]) {
  return getActiveDaysInCurrentWeek(history);
}

export function getWeeklyStudyProgress(history: LessonHistoryItem[]) {
  const { activeDays } = getActiveDaysInLastWeek(history);
  const goal = DEFAULT_WEEKLY_STUDY_DAY_GOAL;
  const percent = roundPercent(safeDivide(activeDays, goal) * 100);

  return {
    activeDays,
    goal,
    percent: Math.min(percent, 100),
    message:
      activeDays >= goal
        ? 'Excelente constância nesta semana!'
        : `Você estudou ${activeDays} de ${goal} dias nesta semana.`,
  };
}

export function getBestEvolutionPoint(points: EvolutionPoint[]) {
  if (points.length === 0) {
    return null;
  }

  return [...points].sort((a, b) => b.minutes - a.minutes)[0];
}

export function getLevelData(xp: number) {
  const levelInfo = getLevelInfo(xp);

  return {
    ...levelInfo,
    title: getLevelTitle(levelInfo.level),
  };
}

export function getRecentMistakeDate(
  mistakes: { lastAnsweredAt: string }[]
) {
  if (mistakes.length === 0) {
    return null;
  }

  const sorted = [...mistakes].sort(
    (a, b) =>
      new Date(b.lastAnsweredAt).getTime() -
      new Date(a.lastAnsweredAt).getTime()
  );

  return sorted[0]?.lastAnsweredAt ?? null;
}

export function groupMistakesBySubject(
  mistakes: { subject: string }[]
) {
  const groups = new Map<string, number>();

  mistakes.forEach((mistake) => {
    groups.set(mistake.subject, (groups.get(mistake.subject) ?? 0) + 1);
  });

  return [...groups.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPlanDayStatus(params: {
  completedTasksToday: string[];
  todayPlanLength: number;
  studiedMinutesToday: number;
}) {
  const { completedTasksToday, todayPlanLength, studiedMinutesToday } = params;

  if (todayPlanLength > 0 && completedTasksToday.length >= todayPlanLength) {
    return 'Concluído' as const;
  }

  if (studiedMinutesToday > 0 || completedTasksToday.length > 0) {
    return 'Em andamento' as const;
  }

  return 'Não iniciado' as const;
}

export function getAverageSessionMessage(
  averageMinutes: number,
  dailyGoalMinutes: number
) {
  if (averageMinutes <= 0 || dailyGoalMinutes <= 0) {
    return 'Ainda não há sessões suficientes para calcular sua média.';
  }

  const percent = roundPercent(
    safeDivide(averageMinutes, dailyGoalMinutes) * 100
  );

  return `Sua sessão média representa ${percent}% da sua meta diária.`;
}

export function getTodayKey() {
  return getLocalDateKey();
}
