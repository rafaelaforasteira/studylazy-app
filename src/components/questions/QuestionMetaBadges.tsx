import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';

import type { Question } from '../../data/questionTypes';

type QuestionMetaBadgesProps = {
  question?: Pick<
    Question,
    'originType' | 'verified' | 'source' | 'year' | 'area'
  >;
  source?: string;
  year?: number;
  area?: string;
};

function getSourceBadgeLabel(source?: string, year?: number) {
  const trimmed = source?.trim();

  if (trimmed) {
    if (year && !trimmed.includes(String(year))) {
      return `${trimmed} ${year}`;
    }

    return trimmed;
  }

  if (year) {
    return `ENEM ${year}`;
  }

  return null;
}

export default function QuestionMetaBadges({
  question,
  source,
  year,
  area,
}: QuestionMetaBadgesProps) {
  const resolvedSource = question?.source ?? source;
  const resolvedYear = question?.year ?? year;
  const resolvedArea = question?.area ?? area;

  const isOfficial =
    question?.originType === 'official_exam' && question?.verified === true;

  if (!isOfficial && question?.originType) {
    return null;
  }

  const sourceLabel = getSourceBadgeLabel(resolvedSource, resolvedYear);
  const areaLabel = resolvedArea?.trim();

  if (!sourceLabel && !areaLabel) {
    return null;
  }

  return (
    <View style={styles.row}>
      {sourceLabel ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{sourceLabel}</Text>
        </View>
      ) : null}
      {areaLabel ? (
        <View style={[styles.badge, styles.areaBadge]}>
          <Text style={[styles.badgeText, styles.areaBadgeText]}>
            {areaLabel}
          </Text>
        </View>
      ) : null}
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
