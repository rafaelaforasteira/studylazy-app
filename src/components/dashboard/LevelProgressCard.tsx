import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { getLevelInfo } from '../../utils/gamification';

type LevelProgressCardProps = {
  xp: number;
};

export default function LevelProgressCard({ xp }: LevelProgressCardProps) {
  const levelInfo = getLevelInfo(xp);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Seu nível</Text>
          <Text style={styles.level}>Nível {levelInfo.level}</Text>
        </View>

        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{xp} XP</Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${levelInfo.progress}%` },
          ]}
        />
      </View>

      <Text style={styles.description}>
        Faltam {levelInfo.remainingXp} XP para o próximo nível
      </Text>
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  label: {
    color: colors.text.secondary,
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  level: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: 'bold',
  },

  xpBadge: {
    backgroundColor: colors.xp,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },

  xpBadgeText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 10,
    backgroundColor: colors.card.elevated,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: spacing.sm,
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
});
