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
import {
  getRecentMistakeDate,
  groupMistakesBySubject,
} from '../../utils/profileAnalytics';

export default function RevisarScreen() {
  const router = useRouter();
  const data = useDashboardData();
  const groupedMistakes = groupMistakesBySubject(data.mistakes);
  const recentMistakeDate = getRecentMistakeDate(data.mistakes);

  if (data.mistakeCount === 0) {
    return (
      <AppScreen hasTabBar contentStyle={styles.content}>
        <Text style={styles.title}>Tudo revisado!</Text>
        <Text style={styles.subtitle}>
          Você não possui questões pendentes. Continue estudando para manter
          seu desempenho.
        </Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <Text style={styles.title}>Revisar erros</Text>
      <Text style={styles.subtitle}>
        O que você precisa reforçar para evoluir com segurança.
      </Text>

      <AppCard title="Resumo">
        <Text style={styles.highlight}>
          {data.mistakeCount}{' '}
          {data.mistakeCount === 1 ? 'erro pendente' : 'erros pendentes'}
        </Text>
        {recentMistakeDate ? (
          <Text style={styles.cardText}>
            Erro mais recente:{' '}
            {new Date(recentMistakeDate).toLocaleDateString('pt-BR')}
          </Text>
        ) : null}
        <Text style={styles.cardText}>
          Revisar erros ajuda a transformar falhas em aprendizado duradouro.
        </Text>
      </AppCard>

      <AppCard title="Erros por matéria">
        {groupedMistakes.map((group) => (
          <View key={group.subject} style={styles.row}>
            <Text style={styles.subject}>{group.subject}</Text>
            <Text style={styles.count}>{group.count}</Text>
          </View>
        ))}
      </AppCard>

      <PrimaryButton
        label="Começar revisão"
        onPress={() => router.push(ROUTES.reviewMistakes)}
      />
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

  highlight: {
    color: colors.warning,
    ...typography.stat,
    marginBottom: spacing.sm,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.xs,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },

  subject: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
  },

  count: {
    color: colors.primarySoft,
    ...typography.body,
    fontWeight: '700',
  },
});
