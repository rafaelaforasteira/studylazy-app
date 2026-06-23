import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppCard from '../../components/ui/AppCard';
import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useStartStudy } from '../../hooks/use-start-study';

const QUICK_DURATIONS = [5, 10, 15] as const;

const QUICK_SUBJECTS = [
  { subject: 'Português', type: 'Teoria' },
  { subject: 'Matemática', type: 'Exercícios' },
  { subject: 'Redação', type: 'Revisão' },
] as const;

export default function EstudarScreen() {
  const router = useRouter();
  const { startStudy, startNextTask } = useStartStudy();
  const data = useDashboardData();

  const hasPlan = data.todayPlan.length > 0;

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <Text style={styles.title}>Hub de estudos</Text>
      <Text style={styles.subtitle}>
        Escolha como continuar sua jornada de aprendizado.
      </Text>

      {hasPlan ? (
        <AppCard title="Próxima atividade recomendada">
          <Text style={styles.taskTitle}>{data.nextTask.subject}</Text>
          <Text style={styles.cardText}>
            {data.nextTask.duration} min • {data.nextTask.type}
          </Text>
          <PrimaryButton
            label="Continuar meu plano"
            onPress={() => startNextTask(data.nextTask)}
            style={styles.button}
          />
        </AppCard>
      ) : (
        <AppCard title="Plano indisponível">
          <Text style={styles.cardText}>
            Não foi possível gerar um plano agora. Use uma sessão rápida
            abaixo para começar.
          </Text>
        </AppCard>
      )}

      <AppCard title="Matérias disponíveis">
        {QUICK_SUBJECTS.map((item) => (
          <View key={item.subject} style={styles.row}>
            <View>
              <Text style={styles.taskTitle}>{item.subject}</Text>
              <Text style={styles.cardText}>{item.type}</Text>
            </View>
            <PrimaryButton
              label="Estudar"
              variant="secondary"
              onPress={() =>
                startStudy({
                  subject: item.subject,
                  duration: 5,
                  type: item.type,
                })
              }
              style={styles.inlineButton}
            />
          </View>
        ))}
      </AppCard>

      <AppCard title="Sessões rápidas">
        {QUICK_DURATIONS.map((duration) => (
          <PrimaryButton
            key={duration}
            label={`${duration} minutos com ${data.nextTask.subject}`}
            variant="secondary"
            onPress={() =>
              startStudy({
                subject: data.nextTask.subject,
                duration,
                type: data.nextTask.type,
              })
            }
            style={styles.button}
          />
        ))}
      </AppCard>

      {data.mistakeCount > 0 ? (
        <AppCard title="Revisão disponível">
          <Text style={styles.cardText}>
            Você tem {data.mistakeCount} questões para reforçar.
          </Text>
          <PrimaryButton
            label="Ir para revisão"
            variant="secondary"
            onPress={() => router.push(ROUTES.reviewMistakes)}
          />
        </AppCard>
      ) : null}
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

  taskTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.sm,
  },

  button: {
    marginBottom: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  inlineButton: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
