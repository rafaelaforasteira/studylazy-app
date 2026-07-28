import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import type { AchievementView } from '../../achievements/achievementTypes';

type AchievementBadgeProps = {
  achievement: AchievementView;
  compact?: boolean;
};

export default function AchievementBadge({
  achievement,
  compact = false,
}: AchievementBadgeProps) {
  const unlocked = achievement.status === 'unlocked';
  const ratio =
    achievement.target > 0
      ? Math.min(1, achievement.progress / achievement.target)
      : 0;

  return (
    <View
      style={[
        styles.badge,
        unlocked ? styles.badgeUnlocked : styles.badgeLocked,
        compact && styles.badgeCompact,
      ]}
      accessibilityLabel={`${achievement.title}. ${
        unlocked ? 'Desbloqueada' : `Progresso ${achievement.progress} de ${achievement.target}`
      }`}
    >
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {achievement.title}
        </Text>
        {!compact ? (
          <Text style={styles.description} numberOfLines={2}>
            {achievement.description}
          </Text>
        ) : null}
        {!unlocked && achievement.target > 1 ? (
          <>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
            </View>
            <Text style={styles.progress}>
              {achievement.progress}/{achievement.target}
            </Text>
          </>
        ) : (
          <Text style={styles.status}>
            {unlocked ? 'Desbloqueada' : 'Bloqueada'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.backgroundElevated,
  },
  badgeCompact: {
    padding: spacing.sm,
  },
  badgeUnlocked: {
    borderColor: colors.xp,
  },
  badgeLocked: {
    borderColor: colors.border.default,
    opacity: 0.85,
  },
  icon: {
    fontSize: 22,
    lineHeight: 26,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '800',
  },
  description: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  status: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.card.elevated,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progress: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
  },
});
