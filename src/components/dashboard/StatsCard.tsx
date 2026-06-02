import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type StatsCardProps = {
  streak?: number;
  xp?: number;
  sessions?: number;
};

export default function StatsCard({
  streak = 3,
  xp = 120,
  sessions = 18,
}: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Estatísticas</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>dias</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statValue}>{sessions}</Text>
          <Text style={styles.statLabel}>sessões</Text>
        </View>
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

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },

  statValue: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },

  statLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
});