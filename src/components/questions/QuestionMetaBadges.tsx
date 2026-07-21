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
  /** Questão voltou por erro anterior (fila de retry). */
  isRetry?: boolean;
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
  isRetry = false,
}: QuestionMetaBadgesProps) {
  const resolvedSource = question?.source ?? source;
  const resolvedYear = question?.year ?? year;
  const resolvedArea = question?.area ?? area;

  const isOfficial =
    question?.originType === 'official_exam' && question?.verified === true;

  if (!isOfficial && question?.originType && !isRetry) {
    return null;
  }

  const sourceLabel = getSourceBadgeLabel(resolvedSource, resolvedYear);
  const areaLabel = resolvedArea?.trim();

  if (!sourceLabel && !areaLabel && !isRetry) {
    return null;
  }

  return (
    <View style={styles.row}>
      {isRetry ? (
        <View style={[styles.badge, styles.retryBadge]}>
          <Text style={[styles.badgeText, styles.retryBadgeText]}>
            Revisão de erro
          </Text>
        </View>
      ) : null}
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

  retryBadge: {
    backgroundColor: 'rgba(255, 184, 77, 0.12)',
    borderColor: 'rgba(255, 184, 77, 0.35)',
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

  retryBadgeText: {
    color: colors.warning,
  },
});
