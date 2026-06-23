import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AchievementCard from '../../components/profile/AchievementCard';
import EvolutionLineChart from '../../components/profile/EvolutionLineChart';
import PerformanceRadarChart from '../../components/profile/PerformanceRadarChart';
import ProfileStatCard from '../../components/profile/ProfileStatCard';
import AppScreen from '../../components/ui/AppScreen';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';

import { useDashboardData } from '../../hooks/use-dashboard-data';
import { getDateKeysForLastDays, formatShortWeekday } from '../../utils/date';
import {
  getGoalLabel,
  getPreparationLabel,
} from '../../utils/onboardingFormatters';
import {
  calculateAccuracy,
  calculateAchievements,
  calculateAverageSessionMinutes,
  calculatePeriodComparison,
  calculateSubjectPerformance,
  calculateTotalMinutes,
  calculateTotalQuestions,
  getAverageSessionMessage,
  getBestEvolutionPoint,
  getEvolutionSeries,
  getStrongestSubject,
  getWeakestSubject,
  getWeeklyStudyProgress,
  type EvolutionPeriod,
} from '../../utils/profileAnalytics';

const PERIOD_OPTIONS: { key: EvolutionPeriod; label: string; days: number }[] =
  [
    { key: '7d', label: '7 dias', days: 7 },
    { key: '30d', label: '30 dias', days: 30 },
    { key: '90d', label: '3 meses', days: 90 },
  ];

function formatStudyDuration(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return '0 min';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${totalMinutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${minutes}`;
}

function formatGrowthLabel(
  hasComparison: boolean,
  changePercent: number | null
) {
  if (!hasComparison || changePercent === null) {
    return 'Sem comparação anterior';
  }

  if (changePercent > 0) {
    return `+${changePercent}%`;
  }

  return `${changePercent}%`;
}

function getWeeklyGoalMessage(activeDays: number, goal: number) {
  if (activeDays >= goal) {
    return 'Meta semanal concluída!';
  }

  const remaining = goal - activeDays;

  if (remaining === 1) {
    return 'Você está a 1 dia de concluir';
  }

  return `Faltam ${remaining} dias para concluir`;
}

function SectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {trailing ? (
        <Text style={styles.sectionTrailing}>{trailing}</Text>
      ) : null}
    </View>
  );
}

export default function AtividadeScreen() {
  const data = useDashboardData();
  const [period, setPeriod] = useState<EvolutionPeriod>('7d');

  const accuracy = calculateAccuracy(data.lessonHistory);
  const totalMinutes = calculateTotalMinutes(data.lessonHistory);
  const totalQuestions = calculateTotalQuestions(data.lessonHistory);
  const averageMinutes = calculateAverageSessionMinutes(data.lessonHistory);
  const weeklyProgress = getWeeklyStudyProgress(data.lessonHistory);
  const evolutionPoints = getEvolutionSeries(data.lessonHistory, period);
  const periodDays =
    PERIOD_OPTIONS.find((item) => item.key === period)?.days ?? 7;
  const comparison = calculatePeriodComparison(
    data.lessonHistory,
    periodDays
  );
  const bestPoint = getBestEvolutionPoint(evolutionPoints);
  const subjectPerformance = useMemo(
    () => calculateSubjectPerformance(data.lessonHistory),
    [data.lessonHistory]
  );
  const strongest = getStrongestSubject(subjectPerformance);
  const weakest = getWeakestSubject(subjectPerformance);
  const achievements = calculateAchievements({
    history: data.lessonHistory,
    sessionsCompleted: data.sessionsCompleted,
    streak: data.displayStreak,
    xp: data.xp,
  });

  const growthLabel = formatGrowthLabel(
    comparison.hasComparison,
    comparison.changePercent
  );
  const growthPositive =
    comparison.hasComparison &&
    comparison.changePercent !== null &&
    comparison.changePercent > 0;

  const weekDays = useMemo(() => {
    const keys = getDateKeysForLastDays(7);
    const activeDates = new Set(data.lessonHistory.map((item) => item.date));

    return keys.map((key, index) => ({
      key,
      label: formatShortWeekday(key).charAt(0).toUpperCase(),
      isActive: activeDates.has(key),
      dayNumber: index + 1,
    }));
  }, [data.lessonHistory]);

  const averagePercent =
    averageMinutes > 0 && data.dailyGoalMinutes > 0
      ? Math.min(
          Math.round((averageMinutes / data.dailyGoalMinutes) * 100),
          100
        )
      : 0;

  const avatarInitial = (
    data.studentName.trim().charAt(0) || 'E'
  ).toUpperCase();

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <Text style={styles.pageTitle}>Minha atividade</Text>

      <View style={styles.hero}>
        <View style={styles.avatarGlow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        </View>
        <Text style={styles.name}>{data.studentName}</Text>
        <Text style={styles.level}>
          Nível {data.levelData.level} • {data.levelData.title}
        </Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>
            {data.displayStreak} dias de sequência
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <ProfileStatCard icon="★" label="XP total" value={String(data.xp)} />
        <ProfileStatCard
          icon="▣"
          label="Lições"
          value={String(data.sessionsCompleted)}
        />
        <ProfileStatCard
          icon="◎"
          label="Acertos"
          value={
            totalQuestions > 0 ? `${accuracy}%` : 'Sem dados suficientes'
          }
        />
        <ProfileStatCard
          icon="◷"
          label="Tempo estudado"
          value={
            totalMinutes > 0
              ? formatStudyDuration(totalMinutes)
              : '0 min'
          }
        />
      </View>

      <SectionHeader
        title="Progresso semanal"
        trailing={`${weeklyProgress.activeDays} de ${weeklyProgress.goal} dias`}
      />
      <View style={styles.card}>
        <View style={styles.weekRow}>
          {weekDays.map((day) => (
            <View key={day.key} style={styles.dayCol}>
              <Text style={styles.dayLabel}>{day.label}</Text>
              <View
                style={[styles.dayDot, day.isActive && styles.dayDotActive]}
              >
                <Text
                  style={[
                    styles.dayDotText,
                    day.isActive && styles.dayDotTextActive,
                  ]}
                >
                  {day.isActive ? '✓' : String(day.dayNumber)}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.weeklyGoal}>
          <View style={styles.weeklyGoalCopy}>
            <Text style={styles.goalLabel}>META SEMANAL</Text>
            <Text style={styles.goalText}>
              {getWeeklyGoalMessage(
                weeklyProgress.activeDays,
                weeklyProgress.goal
              )}
            </Text>
          </View>
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>
              {weeklyProgress.percent}%
            </Text>
          </View>
        </View>
      </View>

      <SectionHeader
        title="Evolução por período"
        trailing={comparison.hasComparison ? growthLabel : undefined}
      />
      <View style={styles.card}>
        <View style={styles.periodTabs}>
          {PERIOD_OPTIONS.map((option) => {
            const isActive = period === option.key;

            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityLabel={`Período ${option.label}`}
                accessibilityState={{ selected: isActive }}
                onPress={() => setPeriod(option.key)}
                style={[styles.periodTab, isActive && styles.periodTabActive]}
              >
                <Text
                  style={[
                    styles.periodTabText,
                    isActive && styles.periodTabTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.evolutionTitle}>
          {growthPositive
            ? 'Seu ritmo está crescendo'
            : 'Acompanhe seu ritmo de estudo'}
        </Text>

        <EvolutionLineChart
          points={evolutionPoints}
          bestMinutes={bestPoint?.minutes ?? 0}
          growthLabel={growthLabel}
          growthPositive={growthPositive}
        />
      </View>

      <SectionHeader title="Tempo médio de estudo" trailing="Por sessão" />
      <View style={[styles.card, styles.averageCard]}>
        {averageMinutes > 0 ? (
          <>
            <View style={styles.averageHead}>
              <View style={styles.averageIcon}>
                <Text style={styles.averageIconText}>◷</Text>
              </View>
              <View style={styles.averageCopy}>
                <Text style={styles.averageValue}>{averageMinutes} min</Text>
                <Text style={styles.averageLabel}>média por sessão</Text>
              </View>
              <View style={styles.recommendedBox}>
                <Text style={styles.recommendedValue}>
                  {data.dailyGoalMinutes} min
                </Text>
                <Text style={styles.recommendedLabel}>meta diária</Text>
              </View>
            </View>
            <View style={styles.track}>
              <View
                style={[styles.trackFill, { width: `${averagePercent}%` }]}
              />
            </View>
            <Text style={styles.averageMsg}>
              {getAverageSessionMessage(
                averageMinutes,
                data.dailyGoalMinutes
              )}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyInline}>
            Ainda não há sessões suficientes para calcular sua média.
          </Text>
        )}
      </View>

      <SectionHeader title="Mapa de desempenho" trailing="Visão geral" />
      <View style={styles.card}>
        <Text style={styles.chartDescription}>
          Quanto mais próximo da borda, melhor está seu desempenho naquela
          matéria.
        </Text>
        <PerformanceRadarChart performance={subjectPerformance} />
      </View>

      <View style={styles.insights}>
        {strongest && weakest ? (
          <>
            <View style={[styles.card, styles.insightCard, styles.insightGreen]}>
              <View style={styles.insightIcon}>
                <Text style={styles.insightIconText}>✦</Text>
              </View>
              <Text style={styles.insightLabel}>SEU PONTO FORTE</Text>
              <Text style={styles.insightTitle}>{strongest.subject}</Text>
              <Text style={styles.insightDesc}>
                {strongest.accuracy}% de aproveitamento
              </Text>
            </View>
            <View
              style={[styles.card, styles.insightCard, styles.insightYellow]}
            >
              <View style={styles.insightIcon}>
                <Text style={styles.insightIconText}>!</Text>
              </View>
              <Text style={styles.insightLabel}>PRECISA DE ATENÇÃO</Text>
              <Text style={styles.insightTitle}>{weakest.subject}</Text>
              <Text style={styles.insightDesc}>
                {weakest.accuracy}% de aproveitamento
              </Text>
            </View>
          </>
        ) : (
          <View style={[styles.card, styles.insightFull]}>
            <Text style={styles.insightTitle}>Continue estudando</Text>
            <Text style={styles.insightDesc}>
              Precisamos de mais respostas para identificar seus pontos fortes
              e conteúdos que precisam de atenção.
            </Text>
          </View>
        )}
      </View>

      <SectionHeader title="Conquistas" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsRow}
      >
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>

      <SectionHeader title="Seu objetivo" />
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Objetivo atual</Text>
          <Text style={styles.infoValue}>
            {getGoalLabel(data.answers.goal)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Meta diária</Text>
          <Text style={styles.infoValue}>
            {data.dailyGoalMinutes} minutos
          </Text>
        </View>
        <View style={[styles.infoRow, styles.infoRowLast]}>
          <Text style={styles.infoLabel}>Preparação</Text>
          <Text style={styles.infoValue}>
            {getPreparationLabel(data.answers.preparationLevel)}
          </Text>
        </View>
        {data.answers.startPreference ? (
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Preferência inicial</Text>
            <Text style={styles.infoValue}>
              {data.answers.startPreference}
            </Text>
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },

  pageTitle: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginBottom: spacing.lg,
  },

  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  avatarGlow: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.text.primary,
    fontSize: 34,
    fontWeight: '900',
  },

  name: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  level: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 3,
  },

  streakBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 93, 59, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 59, 0.22)',
  },

  streakText: {
    color: '#FFBEAF',
    fontSize: 12,
    fontWeight: '800',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },

  sectionTrailing: {
    color: colors.text.secondary,
    fontSize: 12,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.xl,
    padding: spacing.md,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },

  dayCol: {
    flex: 1,
    alignItems: 'center',
  },

  dayLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    marginBottom: 6,
  },

  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayDotActive: {
    backgroundColor: colors.success,
    borderColor: 'transparent',
  },

  dayDotText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '900',
  },

  dayDotTextActive: {
    color: '#111111',
  },

  weeklyGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },

  weeklyGoalCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  goalLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  goalText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  goalBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.successTone.background,
    borderWidth: 1,
    borderColor: colors.successTone.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  goalBadgeText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },

  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing.md,
    gap: 4,
  },

  periodTab: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  periodTabActive: {
    backgroundColor: colors.primary,
  },

  periodTabText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '800',
  },

  periodTabTextActive: {
    color: colors.text.primary,
  },

  evolutionTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 2,
  },

  averageCard: {
    backgroundColor: 'rgba(45, 212, 255, 0.045)',
    borderColor: 'rgba(45, 212, 255, 0.14)',
  },

  averageHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  averageIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(45, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  averageIconText: {
    color: colors.progress,
    fontSize: 22,
  },

  averageCopy: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  averageValue: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
  },

  averageLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },

  recommendedBox: {
    minWidth: 76,
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },

  recommendedValue: {
    color: colors.progress,
    fontSize: 17,
    fontWeight: '900',
  },

  recommendedLabel: {
    color: colors.text.secondary,
    fontSize: 8,
    fontWeight: '700',
  },

  track: {
    height: 9,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
    marginTop: spacing.lg,
  },

  trackFill: {
    height: '100%',
    backgroundColor: colors.progress,
    borderRadius: radii.pill,
  },

  averageMsg: {
    color: colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.sm,
  },

  chartDescription: {
    color: colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },

  insights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  insightCard: {
    flex: 1,
    minWidth: '46%',
    minHeight: 150,
  },

  insightFull: {
    flex: 1,
    minWidth: '100%',
  },

  insightGreen: {
    backgroundColor: 'rgba(182, 255, 74, 0.07)',
    borderColor: 'rgba(182, 255, 74, 0.16)',
  },

  insightYellow: {
    backgroundColor: 'rgba(255, 184, 77, 0.07)',
    borderColor: 'rgba(255, 184, 77, 0.16)',
  },

  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  insightIconText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  insightLabel: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  insightTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5,
  },

  insightDesc: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },

  achievementsRow: {
    paddingBottom: 2,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.sm,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    flex: 1,
  },

  infoValue: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },

  emptyInline: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
