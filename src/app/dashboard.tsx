import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DailyGoalCard from '../components/dashboard/DailyGoalCard';
import NextStudyCard from '../components/dashboard/NextStudyCard';
import StatsCard from '../components/dashboard/StatsCard';
import ProfileSummaryCard from '../components/dashboard/ProfileSummaryCard';
import TodayPlanCard from '../components/dashboard/TodayPlanCard';
import DailyCompletedCard from '../components/dashboard/DailyCompletedCard';
import LessonHistoryCard from '../components/dashboard/LessonHistoryCard';
import LevelProgressCard from '../components/dashboard/LevelProgressCard';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

import { useOnboardingStore } from '../store/onboardingStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import { useProfileStore } from '../store/profileStore';

import {
  getDailyGoalMinutes,
  getGoalLabel,
  getPreparationLabel,
} from '../utils/onboardingFormatters';

import {
  generateTodayPlan,
  getNextTask,
} from '../utils/studyPlanGenerator';

export default function DashboardScreen() {
  const router = useRouter();

  const ensureTodayProgress = useStudyProgressStore(
    (state) => state.ensureTodayProgress
  );

  useEffect(() => {
    ensureTodayProgress();
  }, [ensureTodayProgress]);

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
    useStudyProgressStore(
      (state) => state.completedTasksToday
    ) || [];

  const xp = useStudyProgressStore((state) => state.xp);

  const sessionsCompleted = useStudyProgressStore(
    (state) => state.sessionsCompleted
  );

  const streak = useStudyProgressStore((state) => state.streak);

  const lessonHistory =
    useStudyProgressStore((state) => state.lessonHistory) || [];

  const dailyGoalMinutes = getDailyGoalMinutes(answers.dailyGoal);

  const goalLabel = getGoalLabel(answers.goal);

  const preparationLabel = getPreparationLabel(
    answers.preparationLevel
  );

  const todayPlan = generateTodayPlan({
    dailyGoal: answers.dailyGoal,
    goal: answers.goal,
    preparationLevel: answers.preparationLevel,
  });

  const nextTask = getNextTask(
    todayPlan,
    completedTasksToday
  );

  const isDailyPlanCompleted = todayPlan.every((task) =>
    completedTasksToday.includes(task.subject)
  );

  function handleStartStudy() {
    router.push({
      pathname: '/study-session',
      params: {
        subject: nextTask.subject,
        duration: String(nextTask.duration),
        type: nextTask.type,
      },
    });
  }

  function handleOpenSettings() {
    router.push('/settings');
  }

  function handleOpenHistory() {
    router.push('/history');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader
        name={studentName}
        streak={streak || 1}
        onSettingsPress={handleOpenSettings}
      />

      <LevelProgressCard xp={xp} />

      <ProfileSummaryCard
        goal={goalLabel}
        preparation={preparationLabel}
        dailyGoal={dailyGoalMinutes}
      />

      <DailyGoalCard
        studiedMinutes={studiedMinutesToday}
        targetMinutes={dailyGoalMinutes}
      />

      {isDailyPlanCompleted ? (
        <DailyCompletedCard
          answeredQuestions={answeredQuestionsToday}
          correctAnswers={correctAnswersToday}
        />
      ) : (
        <NextStudyCard
          subject={nextTask.subject}
          duration={nextTask.duration}
          type={nextTask.type}
          onPress={handleStartStudy}
        />
      )}

      <TodayPlanCard
        tasks={todayPlan}
        completedTasks={completedTasksToday}
      />

      <StatsCard
        streak={streak}
        xp={xp}
        sessions={sessionsCompleted}
      />

      <LessonHistoryCard
        history={lessonHistory}
        onSeeAllPress={handleOpenHistory}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
  },
});