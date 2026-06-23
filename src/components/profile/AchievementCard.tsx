import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { AchievementDefinition } from '../../utils/profileAnalytics';

type AchievementCardProps = {
  achievement: AchievementDefinition;
};

export default function AchievementCard({
  achievement,
}: AchievementCardProps) {
  const showProgress =
    achievement.target !== undefined &&
    achievement.progress !== undefined &&
    !achievement.unlocked;

  return (
    <View
      style={[
        styles.card,
        achievement.unlocked ? styles.unlocked : styles.locked,
      ]}
    >
      <Text style={styles.title}>{achievement.title}</Text>
      <Text style={styles.description}>{achievement.description}</Text>

      {showProgress ? (
        <Text style={styles.progress}>
          {achievement.progress}/{achievement.target}
        </Text>
      ) : null}

      <Text style={styles.status}>
        {achievement.unlocked ? 'Desbloqueada' : 'Bloqueada'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
  },

  unlocked: {
    borderColor: colors.successTone.border,
  },

  locked: {
    borderColor: colors.border.default,
    opacity: 0.75,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  description: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    marginBottom: spacing.sm,
  },

  progress: {
    color: colors.progress,
    ...typography.bodySmall,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  status: {
    color: colors.text.muted,
    ...typography.label,
    textTransform: 'uppercase',
  },
});
