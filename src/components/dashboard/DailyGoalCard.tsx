import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type DailyGoalCardProps = {
  studiedMinutes?: number;
  targetMinutes?: number;
};

export default function DailyGoalCard({
  studiedMinutes = 0,
  targetMinutes = 20,
}: DailyGoalCardProps) {
  const rawProgress = (studiedMinutes / targetMinutes) * 100;
  const progress = Math.min(rawProgress, 100);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Meta diária</Text>

      <Text style={styles.minutes}>
        {studiedMinutes} de {targetMinutes} minutos
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.percentage}>
        {Math.round(progress)}% concluído
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
  },

  minutes: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  percentage: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
    ...typography.body,
  },
});