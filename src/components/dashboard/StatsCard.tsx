import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type StatsCardProps = {
  streak?: number;
  xp?: number;
  sessions?: number;
};

export default function StatsCard({
  streak = 0,
  xp = 0,
  sessions = 0,
}: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Estatísticas</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <SymbolView
            name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
            tintColor={colors.warning}
            size={24}
          />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>dias</Text>
        </View>

        <View style={styles.statItem}>
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            tintColor={colors.xp}
            size={24}
          />
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>

        <View style={styles.statItem}>
          <SymbolView
            name={{ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }}
            tintColor={colors.primary}
            size={24}
          />
          <Text style={styles.statValue}>{sessions}</Text>
          <Text style={styles.statLabel}>lições</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
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
    gap: spacing.sm,
  },

  statValue: {
    color: colors.text.primary,
    ...typography.stat,
  },

  statLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
});
