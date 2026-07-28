import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import {
  computeStudentLevel,
  getMotivationalMessage,
} from '../../levels/levelLogic';

type LevelProgressCardProps = {
  xp: number;
};

export default function LevelProgressCard({ xp }: LevelProgressCardProps) {
  const info = computeStudentLevel(xp);
  const motivational = getMotivationalMessage(info);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.label}>Seu nível</Text>
          <Text style={styles.level}>
            Nível {info.level} — {info.name}
          </Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{info.totalXp} XP</Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[styles.progressFill, { width: `${info.progressPercent}%` }]}
        />
      </View>

      <Text style={styles.description}>
        {info.isMaxLevel
          ? 'Nível máximo alcançado'
          : `${info.xpIntoLevel}/${info.xpSpanToNext} XP neste nível · faltam ${info.xpRemaining} XP`}
      </Text>
      <Text style={styles.motivation}>{motivational}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  label: {
    color: colors.text.secondary,
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  level: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  xpBadge: {
    backgroundColor: colors.xp,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  xpBadgeText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
  },
  progressBackground: {
    height: 10,
    backgroundColor: colors.card.elevated,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  description: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  motivation: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
