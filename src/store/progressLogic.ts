import { getLocalDateKey, getYesterdayDateKey } from '../utils/date';

/**
 * Lógica pura de progresso (XP, streak, histórico diário).
 *
 * Mantida separada do store Zustand para ser testável em Node sem depender de
 * AsyncStorage e para centralizar os cálculos de data/streak em um só lugar.
 */

export type LessonHistoryItem = {
  id: string;
  subject: string;
  minutes: number;
  totalQuestions: number;
  correctAnswers: number;
  earnedXp: number;
  date: string;
  isRepeat?: boolean;
};

export type CompleteLessonParams = {
  minutes: number;
  totalQuestions: number;
  correctAnswers: number;
  subject: string;
};

export type ProgressSnapshot = {
  studiedMinutesToday: number;
  answeredQuestionsToday: number;
  correctAnswersToday: number;
  completedTasksToday: string[];
  xp: number;
  sessionsCompleted: number;
  streak: number;
  lastStudyDate: string | null;
  dailyProgressDate: string | null;
  lessonHistory: LessonHistoryItem[];
};

export type CompleteLessonResult = {
  earnedXp: number;
  isRepeat: boolean;
};

export type CompleteLessonContext = {
  today: string;
  yesterday: string;
  timestamp: number;
};

const XP_PER_QUESTION = 5;
const XP_PER_CORRECT = 5;

/** Converte qualquer valor em inteiro não negativo seguro. */
export function toSafeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** XP sempre inteiro, nunca negativo; acertos nunca excedem o total. */
export function calculateXp(totalQuestions: number, correctAnswers: number) {
  const safeTotal = toSafeCount(totalQuestions);
  const safeCorrect = Math.min(toSafeCount(correctAnswers), safeTotal);

  return Math.max(0, safeTotal * XP_PER_QUESTION + safeCorrect * XP_PER_CORRECT);
}

/**
 * Streak: mantém no mesmo dia (sem incremento duplo), soma +1 em dia
 * consecutivo, e reinicia para 1 caso contrário.
 */
export function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number,
  today: string,
  yesterday: string
) {
  const safeStreak = toSafeCount(currentStreak);

  if (lastStudyDate === today) {
    return Math.max(1, safeStreak);
  }

  if (lastStudyDate === yesterday) {
    return safeStreak + 1;
  }

  return 1;
}

export function defaultCompleteLessonContext(): CompleteLessonContext {
  return {
    today: getLocalDateKey(),
    yesterday: getYesterdayDateKey(),
    timestamp: Date.now(),
  };
}

/**
 * Calcula o patch de estado e o resultado ao concluir uma lição. Função pura:
 * recebe o estado atual e um contexto de data injetável (determinístico).
 */
export function computeLessonResult(
  state: ProgressSnapshot,
  params: CompleteLessonParams,
  ctx: CompleteLessonContext
): { patch: Partial<ProgressSnapshot>; result: CompleteLessonResult } {
  const { today, yesterday, timestamp } = ctx;

  const minutes = toSafeCount(params.minutes);
  const totalQuestions = toSafeCount(params.totalQuestions);
  const correctAnswers = Math.min(toSafeCount(params.correctAnswers), totalQuestions);
  const subject = params.subject;

  const isNewDailyCycle = state.dailyProgressDate !== today;

  const baseStudiedMinutesToday = isNewDailyCycle ? 0 : toSafeCount(state.studiedMinutesToday);
  const baseAnsweredQuestionsToday = isNewDailyCycle
    ? 0
    : toSafeCount(state.answeredQuestionsToday);
  const baseCorrectAnswersToday = isNewDailyCycle
    ? 0
    : toSafeCount(state.correctAnswersToday);
  const baseCompletedTasksToday = isNewDailyCycle
    ? []
    : state.completedTasksToday ?? [];

  const taskWasAlreadyCompleted = baseCompletedTasksToday.includes(subject);

  const earnedXp = taskWasAlreadyCompleted
    ? 0
    : calculateXp(totalQuestions, correctAnswers);

  const safeBaseStreak = toSafeCount(state.streak);
  const safeBaseXp = toSafeCount(state.xp);
  const safeBaseSessions = toSafeCount(state.sessionsCompleted);

  const newStreak = calculateStreak(state.lastStudyDate, safeBaseStreak, today, yesterday);

  const updatedCompletedTasks = taskWasAlreadyCompleted
    ? baseCompletedTasksToday
    : [...baseCompletedTasksToday, subject];

  const newHistoryItem: LessonHistoryItem = {
    id: `${subject}-${timestamp}`,
    subject,
    minutes,
    totalQuestions,
    correctAnswers,
    earnedXp,
    date: today,
    isRepeat: taskWasAlreadyCompleted,
  };

  const patch: Partial<ProgressSnapshot> = {
    studiedMinutesToday: baseStudiedMinutesToday + minutes,
    answeredQuestionsToday: baseAnsweredQuestionsToday + totalQuestions,
    correctAnswersToday: baseCorrectAnswersToday + correctAnswers,
    completedTasksToday: updatedCompletedTasks,
    xp: safeBaseXp + earnedXp,
    sessionsCompleted: safeBaseSessions + 1,
    streak: newStreak,
    lastStudyDate: today,
    dailyProgressDate: today,
    lessonHistory: [newHistoryItem, ...(state.lessonHistory ?? [])],
  };

  return {
    patch,
    result: { earnedXp, isRepeat: taskWasAlreadyCompleted },
  };
}
