import { StyleSheet, Text, View } from 'react-native';

import AppCard from '../../components/ui/AppCard';
import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useStartStudy } from '../../hooks/use-start-study';

export default function PlanoScreen() {
  const { startStudy } = useStartStudy();
  const data = useDashboardData();

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <Text style={styles.title}>Plano de estudos</Text>
      <Text style={styles.subtitle}>
        O que está planejado para você estudar hoje?
      </Text>

      <AppCard title="Resumo do dia">
        <Text style={styles.status}>Status: {data.planDayStatus}</Text>
        <Text style={styles.cardText}>
          Meta diária: {data.dailyGoalMinutes} min
        </Text>
        <Text style={styles.cardText}>
          Progresso: {data.studiedMinutesToday} min (
          {data.dailyProgressPercent}%)
        </Text>
      </AppCard>

      <AppCard title="Próxima tarefa">
        {data.isDailyPlanCompleted ? (
          <Text style={styles.successText}>
            Meta do dia concluída! Você finalizou todas as lições de hoje.
          </Text>
        ) : (
          <>
            <Text style={styles.taskTitle}>{data.nextTask.subject}</Text>
            <Text style={styles.cardText}>
              {data.nextTask.duration} min • {data.nextTask.type}
            </Text>
            <PrimaryButton
              label="Iniciar próxima tarefa"
              onPress={() => startStudy(data.nextTask)}
              style={styles.taskButton}
            />
          </>
        )}
      </AppCard>

      <AppCard title="Plano de hoje">
        {data.todayPlan.map((task, index) => {
          const isCompleted = data.completedTasksToday.includes(
            task.subject
          );

          return (
            <View key={`${task.subject}-${index}`} style={styles.taskRow}>
              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskTitle,
                    isCompleted && styles.taskCompleted,
                  ]}
                >
                  {task.subject}
                </Text>
                <Text style={styles.cardText}>
                  {task.duration} min • {task.type}
                </Text>
              </View>

              {isCompleted ? (
                <Text style={styles.doneTag}>Concluída</Text>
              ) : (
                <PrimaryButton
                  label="Iniciar"
                  variant="secondary"
                  onPress={() => startStudy(task)}
                  style={styles.inlineButton}
                />
              )}
            </View>
          );
        })}
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  status: {
    color: colors.primarySoft,
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.xs,
  },

  successText: {
    color: colors.success,
    ...typography.body,
    fontWeight: '700',
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },

  taskInfo: {
    flex: 1,
  },

  taskTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },

  taskCompleted: {
    color: colors.text.muted,
    textDecorationLine: 'line-through',
  },

  doneTag: {
    color: colors.success,
    ...typography.bodySmall,
    fontWeight: '700',
  },

  taskButton: {
    marginTop: spacing.md,
  },

  inlineButton: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
