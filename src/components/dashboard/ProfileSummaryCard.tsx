import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type ProfileSummaryCardProps = {
  goal: string;
  preparation: string;
  dailyGoal: number;
};

export default function ProfileSummaryCard({
  goal,
  preparation,
  dailyGoal,
}: ProfileSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Seu perfil</Text>

      <View style={styles.item}>
        <Text style={styles.label}>Objetivo</Text>
        <Text style={styles.value}>{goal}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Nível atual</Text>
        <Text style={styles.value}>{preparation}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Meta diária</Text>
        <Text style={styles.value}>{dailyGoal} min/dia</Text>
      </View>
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
    marginBottom: spacing.md,
  },

  item: {
    marginBottom: spacing.md,
  },

  label: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 4,
  },

  value: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});