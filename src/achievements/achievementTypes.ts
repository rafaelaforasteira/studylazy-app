/** Tipos do sistema de conquistas. */

export type AchievementId =
  | 'first_lesson'
  | 'lessons_5'
  | 'lessons_10'
  | 'questions_10'
  | 'questions_50'
  | 'questions_100'
  | 'correct_10'
  | 'correct_50'
  | 'first_review'
  | 'reviews_10'
  | 'life_recovered_from_review'
  | 'all_daily_missions'
  | 'streak_3'
  | 'streak_7'
  | 'xp_100'
  | 'xp_500';

export type AchievementCategory =
  | 'study'
  | 'questions'
  | 'review'
  | 'streak'
  | 'lives'
  | 'missions'
  | 'xp';

export type AchievementStatus = 'locked' | 'unlocked';

export type AchievementDefinition = {
  id: AchievementId;
  category: AchievementCategory;
  title: string;
  description: string;
  /** Meta numérica para barra de progresso (1 = binário). */
  target: number;
  icon: string;
};

export type UnlockedAchievement = {
  id: AchievementId;
  unlockedAt: string;
};

export type AchievementCounters = {
  lessonsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  reviewsAnswered: number;
  livesRecoveredFromReview: number;
  allDailyMissionsCompleted: number;
  maxStreakSeen: number;
  xpSeen: number;
};

export type AchievementSnapshot = {
  counters: AchievementCounters;
  unlocked: UnlockedAchievement[];
  /** IDs desbloqueados recentemente (feedback UI); limpos após exibir. */
  recentlyUnlocked: AchievementId[];
};

export type AchievementView = AchievementDefinition & {
  status: AchievementStatus;
  progress: number;
  unlockedAt: string | null;
};
