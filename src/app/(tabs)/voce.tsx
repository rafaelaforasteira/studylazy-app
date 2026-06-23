import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import AchievementCard from '../../components/profile/AchievementCard';
import EvolutionLineChart from '../../components/profile/EvolutionLineChart';
import PerformanceRadarChart from '../../components/profile/PerformanceRadarChart';
import ProfileStatCard from '../../components/profile/ProfileStatCard';
import AppCard from '../../components/ui/AppCard';
import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
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
import { getPreparationLabel, getGoalLabel } from '../../utils/onboardingFormatters';

const PERIOD_OPTIONS: { key: EvolutionPeriod; label: string; days: number }[] =
  [
    { key: '7d', label: '7 dias', days: 7 },
    { key: '30d', label: '30 dias', days: 30 },
    { key: '90d', label: '3 meses', days: 90 },
  ];

export default function VoceScreen() {
  const router = useRouter();
  const data = useDashboardData();
  const [period, setPeriod] = useState<EvolutionPeriod>('7d');

  const accuracy = calculateAccuracy(data.lessonHistory);
  const totalMinutes = calculateTotalMinutes(data.lessonHistory);
  const averageMinutes = calculateAverageSessionMinutes(data.lessonHistory);
  const totalQuestions = calculateTotalQuestions(data.lessonHistory);
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

  const comparisonValue = comparison.hasComparison
    ? `${comparison.changePercent}%`
    : 'Sem comparação anterior';

  function handleHelp() {
    Alert.alert(
      'Ajuda StudyLazy',
      'Use as abas para acompanhar sua atividade, seguir o plano diário, estudar, revisar erros e acompanhar sua evolução aqui em Você.'
    );
  }

  function handleNotifyPro() {
    Alert.alert(
      'Em breve',
      'Obrigado pelo interesse! Avisaremos quando o StudyLazy Pro estiver disponível.'
    );
  }

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(data.studentName.trim().charAt(0) || 'E').toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.name}>{data.studentName}</Text>
          <Text style={styles.level}>
            Nível {data.levelData.level} • {data.levelData.title}
          </Text>
          <Text style={styles.streak}>
            {data.displayStreak} dias de sequência
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <ProfileStatCard
          label="XP total"
          value={String(data.xp)}
        />
        <ProfileStatCard
          label="Sessões"
          value={String(data.sessionsCompleted)}
        />
        <ProfileStatCard
          label="Aproveitamento"
          value={
            totalQuestions > 0 ? `${accuracy}%` : 'Sem dados suficientes'
          }
        />
        <ProfileStatCard
          label="Tempo registrado"
          value={
            totalMinutes > 0 ? `${totalMinutes} min` : 'Sem dados suficientes'
          }
        />
      </View>

      <AppCard title="Progresso semanal">
        <Text style={styles.cardText}>
          {weeklyProgress.activeDays} de {weeklyProgress.goal} dias ativos
        </Text>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${weeklyProgress.percent}%` },
            ]}
          />
        </View>
        <Text style={styles.cardText}>{weeklyProgress.message}</Text>
      </AppCard>

      <AppCard title="Evolução por período">
        <View style={styles.periodRow}>
          {PERIOD_OPTIONS.map((option) => (
            <PrimaryButton
              key={option.key}
              label={option.label}
              variant={period === option.key ? 'primary' : 'secondary'}
              onPress={() => setPeriod(option.key)}
              style={styles.periodButton}
            />
          ))}
        </View>

        <EvolutionLineChart
          points={evolutionPoints}
          totalLabel={`Total do período: ${comparison.currentTotal} min`}
          bestLabel={
            bestPoint
              ? `Melhor resultado: ${bestPoint.minutes} min`
              : 'Melhor resultado: 0 min'
          }
          comparisonLabel="Comparação com período anterior"
          comparisonValue={comparisonValue}
        />
      </AppCard>

      <AppCard title="Tempo médio por sessão">
        <Text style={styles.metric}>
          {averageMinutes > 0
            ? `${averageMinutes} min por sessão`
            : 'Ainda não há sessões suficientes para calcular sua média.'}
        </Text>
        {averageMinutes > 0 ? (
          <>
            <Text style={styles.cardText}>
              Meta diária: {data.dailyGoalMinutes} min
            </Text>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      Math.round(
                        (averageMinutes / data.dailyGoalMinutes) * 100
                      ),
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.cardText}>
              {getAverageSessionMessage(
                averageMinutes,
                data.dailyGoalMinutes
              )}
            </Text>
          </>
        ) : null}
      </AppCard>

      <AppCard title="Desempenho por matéria">
        <PerformanceRadarChart performance={subjectPerformance} />
      </AppCard>

      <AppCard title="Pontos fortes e de atenção">
        {strongest && weakest ? (
          <>
            <Text style={styles.cardText}>
              Ponto forte: {strongest.subject} ({strongest.accuracy}%)
            </Text>
            <Text style={styles.cardText}>
              Ponto de atenção: {weakest.subject} ({weakest.accuracy}%)
            </Text>
          </>
        ) : (
          <Text style={styles.cardText}>
            Continue estudando. Precisamos de mais respostas para identificar
            seus pontos fortes e conteúdos que precisam de atenção.
          </Text>
        )}
      </AppCard>

      <AppCard title="Conquistas">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </ScrollView>
      </AppCard>

      <AppCard title="Objetivo e preferências">
        <Text style={styles.cardText}>
          Objetivo: {getGoalLabel(data.answers.goal)}
        </Text>
        <Text style={styles.cardText}>
          Meta diária: {data.dailyGoalMinutes} min
        </Text>
        <Text style={styles.cardText}>
          Preparação: {getPreparationLabel(data.answers.preparationLevel)}
        </Text>
        <Text style={styles.cardText}>
          Preferência inicial:{' '}
          {data.answers.startPreference ?? 'Não informada'}
        </Text>
      </AppCard>

      <AppCard title="Atalhos">
        <PrimaryButton
          label="Editar perfil"
          variant="secondary"
          onPress={() => router.push(ROUTES.profile)}
          style={styles.shortcut}
        />
        <PrimaryButton
          label="Configurações"
          variant="secondary"
          onPress={() => router.push(ROUTES.settings)}
          style={styles.shortcut}
        />
        <PrimaryButton
          label="Histórico completo"
          variant="secondary"
          onPress={() => router.push(ROUTES.history)}
          style={styles.shortcut}
        />
        <PrimaryButton
          label="Planos e upgrade"
          variant="secondary"
          onPress={() => router.push(ROUTES.plans)}
          style={styles.shortcut}
        />
        <PrimaryButton
          label="Ajuda"
          variant="secondary"
          onPress={handleHelp}
        />
      </AppCard>

      <AppCard title="StudyLazy Pro">
        <Text style={styles.cardText}>
          Recursos avançados estão em desenvolvimento.
        </Text>
        <PrimaryButton
          label="Avise-me quando estiver disponível"
          onPress={handleNotifyPro}
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: '700',
  },

  headerText: {
    flex: 1,
  },

  name: {
    color: colors.text.primary,
    ...typography.title,
  },

  level: {
    color: colors.primarySoft,
    ...typography.body,
    marginTop: 2,
  },

  streak: {
    color: colors.streak,
    ...typography.bodySmall,
    marginTop: 2,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.xs,
  },

  metric: {
    color: colors.text.primary,
    ...typography.stat,
    marginBottom: spacing.sm,
  },

  progressBackground: {
    height: 8,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  periodButton: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  shortcut: {
    marginBottom: spacing.sm,
  },
});
