import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';

type QuestionSourceBadgesProps = {
  source?: string;
  area?: string;
};

export default function QuestionSourceBadges({
  source,
  area,
}: QuestionSourceBadgesProps) {
  if (!source || !area) {
    return null;
  }

  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{source}</Text>
      </View>
      <View style={[styles.badge, styles.areaBadge]}>
        <Text style={[styles.badgeText, styles.areaBadgeText]}>{area}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  areaBadge: {
    backgroundColor: 'rgba(45, 212, 255, 0.08)',
    borderColor: 'rgba(45, 212, 255, 0.2)',
  },

  badgeText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  areaBadgeText: {
    color: colors.progress,
  },
});
