import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { MAX_LIVES } from '../../lives/livesTypes';
import { useLivesStore } from '../../store/livesStore';
import { useEntitlements } from '../../hooks/use-entitlements';

type LivesIndicatorProps = {
  /** Exibe contador textual `3/5`. */
  showCount?: boolean;
  /** Exibe tempo até a próxima vida quando < max. */
  showRegenHint?: boolean;
  compact?: boolean;
};

function Heart({ filled }: { filled: boolean }) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.heart, filled ? styles.heartFilled : styles.heartEmpty]}
    >
      {filled ? '♥' : '♡'}
    </Text>
  );
}

export default function LivesIndicator({
  showCount = true,
  showRegenHint = true,
  compact = false,
}: LivesIndicatorProps) {
  const { isPro } = useEntitlements();
  const currentLives = useLivesStore((state) => state.currentLives);
  const maxLives = useLivesStore((state) => state.maxLives);
  const isUnlimited = useLivesStore((state) => state.isUnlimited) || isPro;
  const hydrateRegeneration = useLivesStore((state) => state.hydrateRegeneration);
  const getTimeUntilNextLabel = useLivesStore(
    (state) => state.getTimeUntilNextLabel
  );

  useEffect(() => {
    hydrateRegeneration();
  }, [hydrateRegeneration]);

  const displayMax = maxLives > 0 ? maxLives : MAX_LIVES;
  const displayLives = isUnlimited ? displayMax : Math.min(currentLives, displayMax);
  const regenLabel =
    !isUnlimited && displayLives < displayMax && showRegenHint
      ? getTimeUntilNextLabel()
      : null;

  const accessibilityLabel = isUnlimited
    ? 'Vidas ilimitadas'
    : `Vidas: ${displayLives} de ${displayMax}${
        regenLabel ? `. Próxima vida em ${regenLabel}` : ''
      }`;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, compact && styles.containerCompact]}
    >
      <View style={styles.heartsRow}>
        {Array.from({ length: displayMax }, (_, index) => (
          <Heart key={index} filled={isUnlimited || index < displayLives} />
        ))}
      </View>
      {showCount ? (
        <Text style={styles.count}>
          {isUnlimited ? '∞' : `${displayLives}/${displayMax}`}
        </Text>
      ) : null}
      {regenLabel ? (
        <Text style={styles.regenHint}>+1 em {regenLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  containerCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  heart: {
    fontSize: 16,
    lineHeight: 18,
  },
  heartFilled: {
    color: colors.danger,
  },
  heartEmpty: {
    color: colors.text.muted,
  },
  count: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '800',
  },
  regenHint: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
