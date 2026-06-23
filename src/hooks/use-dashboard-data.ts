import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { useMistakeStore } from '../store/mistakeStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useProfileStore } from '../store/profileStore';
import { useStudyProgressStore } from '../store/studyProgressStore';

import {
  getDailyGoalMinutes,
  getGoalLabel,
  getPreparationLabel,
} from '../utils/onboardingFormatters';
import {
  generateTodayPlan,
  getNextTask,
} from '../utils/studyPlanGenerator';
import { getLevelData, getPlanDayStatus } from '../utils/profileAnalytics';
import { getDisplayStreak } from '../utils/streak';

export function useDashboardData() {
  const ensureTodayProgress = useStudyProgressStore(
    (state) => state.ensureTodayProgress
  );

  useFocusEffect(
    useCallback(() => {
      ensureTodayProgress();
    }, [ensureTodayProgress])
  );

  const studentName = useProfileStore((state) => state.name);
  const answers = useOnboardingStore((state) => state.answers);

  const studiedMinutesToday = useStudyProgressStore(
    (state) => state.studiedMinutesToday
  );
  const answeredQuestionsToday = useStudyProgressStore(
    (state) => state.answeredQuestionsToday
  );
  const correctAnswersToday = useStudyProgressStore(
    (state) => state.correctAnswersToday
  );
  const completedTasksToday =
    useStudyProgressStore((state) => state.completedTasksToday) || [];
  const xp = useStudyProgressStore((state) => state.xp);
  const sessionsCompleted = useStudyProgressStore(
    (state) => state.sessionsCompleted
  );
  const storedStreak = useStudyProgressStore((state) => state.streak);
  const lastStudyDate = useStudyProgressStore(
    (state) => state.lastStudyDate
  );
  const lessonHistory =
    useStudyProgressStore((state) => state.lessonHistory) || [];
  const mistakes = useMistakeStore((state) => state.mistakes);
  const mistakeCount = mistakes.length;

  const displayStreak = getDisplayStreak(lastStudyDate, storedStreak);
  const dailyGoalMinutes = getDailyGoalMinutes(answers.dailyGoal);
  const goalLabel = getGoalLabel(answers.goal);
  const preparationLabel = getPreparationLabel(answers.preparationLevel);

  const todayPlan = generateTodayPlan({
    dailyGoal: answers.dailyGoal,
    goal: answers.goal,
    preparationLevel: answers.preparationLevel,
  });

  const nextTask = getNextTask(todayPlan, completedTasksToday);
  const isDailyPlanCompleted = todayPlan.every((task) =>
    completedTasksToday.includes(task.subject)
  );

  const dailyProgressPercent = Math.min(
    Math.round((studiedMinutesToday / dailyGoalMinutes) * 100),
    100
  );

  const levelData = getLevelData(xp);
  const planDayStatus = getPlanDayStatus({
    completedTasksToday,
    todayPlanLength: todayPlan.length,
    studiedMinutesToday,
  });

  return {
    studentName,
    answers,
    studiedMinutesToday,
    answeredQuestionsToday,
    correctAnswersToday,
    completedTasksToday,
    xp,
    sessionsCompleted,
    storedStreak,
    lastStudyDate,
    lessonHistory,
    mistakes,
    mistakeCount,
    displayStreak,
    dailyGoalMinutes,
    goalLabel,
    preparationLabel,
    todayPlan,
    nextTask,
    isDailyPlanCompleted,
    dailyProgressPercent,
    levelData,
    planDayStatus,
  };
}
