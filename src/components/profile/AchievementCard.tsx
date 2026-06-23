import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';

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
      <View style={styles.iconBox}>
        <Text style={styles.icon}>
          {achievement.unlocked ? '✓' : '○'}
        </Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {achievement.title}
      </Text>

      {showProgress ? (
        <Text style={styles.progress}>
          {achievement.progress}/{achievement.target}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    minHeight: 116,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unlocked: {
    borderColor: colors.border.default,
  },

  locked: {
    borderColor: colors.border.default,
    opacity: 0.38,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  icon: {
    color: colors.primarySoft,
    fontSize: 20,
    fontWeight: '700',
  },

  title: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  progress: {
    color: colors.progress,
    fontSize: 10,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
