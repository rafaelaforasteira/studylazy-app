import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import ActivityFeedItem from '../../components/activity/ActivityFeedItem';
import AppCard from '../../components/ui/AppCard';
import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useStartStudy } from '../../hooks/use-start-study';
import { getGreeting } from '../../utils/date';

export default function AtividadeScreen() {
  const router = useRouter();
  const { startNextTask } = useStartStudy();
  const data = useDashboardData();

  const recentHistory = data.lessonHistory.slice(0, 5);

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <Text style={styles.greeting}>
        {getGreeting()}, {data.studentName}
      </Text>

      <Text style={styles.subtitle}>
        O que está acontecendo na sua jornada agora?
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{data.xp}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Nível</Text>
          <Text style={styles.statValue}>{data.levelData.level}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{data.displayStreak}</Text>
        </View>
      </View>

      <AppCard title="Meta diária">
        <Text style={styles.cardText}>
          {data.studiedMinutesToday} de {data.dailyGoalMinutes} minutos
        </Text>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${data.dailyProgressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.helper}>
          {data.dailyProgressPercent}% da meta diária
        </Text>
      </AppCard>

      <AppCard title="Próxima atividade recomendada">
        {data.isDailyPlanCompleted ? (
          <Text style={styles.cardText}>
            Plano do dia concluído. Você pode continuar revisando ou
            praticando.
          </Text>
        ) : (
          <>
            <Text style={styles.cardTitle}>{data.nextTask.subject}</Text>
            <Text style={styles.cardText}>
              {data.nextTask.duration} min • {data.nextTask.type}
            </Text>
          </>
        )}
      </AppCard>

      <AppCard title="Revisão pendente">
        {data.mistakeCount > 0 ? (
          <Text style={styles.warningText}>
            {data.mistakeCount}{' '}
            {data.mistakeCount === 1 ? 'erro pendente' : 'erros pendentes'}
          </Text>
        ) : (
          <Text style={styles.cardText}>Nenhuma revisão pendente.</Text>
        )}
      </AppCard>

      <AppCard title="Atividade recente">
        {recentHistory.length === 0 ? (
          <Text style={styles.emptyText}>
            Você ainda não concluiu nenhuma atividade. Comece sua primeira
            sessão para acompanhar sua evolução.
          </Text>
        ) : (
          recentHistory.map((lesson) => (
            <ActivityFeedItem key={lesson.id} lesson={lesson} />
          ))
        )}
      </AppCard>

      <PrimaryButton
        label="Continuar estudando"
        onPress={() => startNextTask(data.nextTask)}
        style={styles.action}
      />

      <PrimaryButton
        label="Ver histórico completo"
        variant="secondary"
        onPress={() => router.push(ROUTES.history)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },

  greeting: {
    color: colors.text.primary,
    ...typography.hero,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  statPill: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  statLabel: {
    color: colors.text.secondary,
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  statValue: {
    color: colors.text.primary,
    ...typography.stat,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body,
  },

  cardTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  helper: {
    color: colors.text.muted,
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },

  progressBackground: {
    height: 8,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.progress,
  },

  warningText: {
    color: colors.warning,
    ...typography.body,
    fontWeight: '700',
  },

  emptyText: {
    color: colors.text.secondary,
    ...typography.body,
  },

  action: {
    marginBottom: spacing.sm,
  },
});
