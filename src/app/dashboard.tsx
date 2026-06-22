import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DailyGoalCard from '../components/dashboard/DailyGoalCard';
import NextStudyCard from '../components/dashboard/NextStudyCard';
import StatsCard from '../components/dashboard/StatsCard';
import ProfileSummaryCard from '../components/dashboard/ProfileSummaryCard';
import TodayPlanCard from '../components/dashboard/TodayPlanCard';
import DailyCompletedCard from '../components/dashboard/DailyCompletedCard';
import LessonHistoryCard from '../components/dashboard/LessonHistoryCard';
import LevelProgressCard from '../components/dashboard/LevelProgressCard';
import MistakeReviewCard from '../components/dashboard/MistakeReviewCard';

import { colors } from '../constants/colors';

import { useOnboardingStore } from '../store/onboardingStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import { useProfileStore } from '../store/profileStore';
import { useMistakeStore } from '../store/mistakeStore';

import {
  getDailyGoalMinutes,
  getGoalLabel,
  getPreparationLabel,
} from '../utils/onboardingFormatters';

import {
  generateTodayPlan,
  getNextTask,
} from '../utils/studyPlanGenerator';
import { getDisplayStreak } from '../utils/streak';

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
  const mistakeCount = useMistakeStore(
    (state) => state.mistakes.length
  );

  const displayStreak = getDisplayStreak(
    lastStudyDate,
    storedStreak
  );

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

  const nextTask = getNextTask(todayPlan, completedTasksToday);

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

  return (
    <AppScreen contentStyle={styles.content}>
      <DashboardHeader
        name={studentName}
        streak={displayStreak}
        onSettingsPress={() => router.push('/settings')}
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

      <MistakeReviewCard
        mistakeCount={mistakeCount}
        onPress={() => router.push('/review-mistakes')}
      />

      <LevelProgressCard xp={xp} />

      <StatsCard
        streak={displayStreak}
        xp={xp}
        sessions={sessionsCompleted}
      />

      <LessonHistoryCard
        history={lessonHistory}
        onSeeAllPress={() => router.push('/history')}
      />

      <ProfileSummaryCard
        goal={goalLabel}
        preparation={preparationLabel}
        dailyGoal={dailyGoalMinutes}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },
});
