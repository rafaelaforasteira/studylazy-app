import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AchievementBadge from './AchievementBadge';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { ACHIEVEMENT_DEFINITIONS } from '../../achievements/achievementLogic';
import { useAchievementStore } from '../../store/achievementStore';
import { useStudyProgressStore } from '../../store/studyProgressStore';

export default function AchievementsCard() {
  const unlocked = useAchievementStore((state) => state.unlocked);
  const counters = useAchievementStore((state) => state.counters);
  const recentlyUnlocked = useAchievementStore(
    (state) => state.recentlyUnlocked
  );
  const clearRecentUnlocks = useAchievementStore(
    (state) => state.clearRecentUnlocks
  );
  const getViews = useAchievementStore((state) => state.getViews);
  const recordXpChanged = useAchievementStore((state) => state.recordXpChanged);
  const recordStreakChanged = useAchievementStore(
    (state) => state.recordStreakChanged
  );
  const xp = useStudyProgressStore((state) => state.xp);
  const streak = useStudyProgressStore((state) => state.streak);

  useEffect(() => {
    recordXpChanged(xp);
    recordStreakChanged(streak);
  }, [xp, streak, recordXpChanged, recordStreakChanged]);

  const views = getViews();
  const unlockedViews = views.filter((item) => item.status === 'unlocked');
  const lockedViews = views
    .filter((item) => item.status === 'locked')
    .slice(0, 4);

  useEffect(() => {
    if (recentlyUnlocked.length === 0) {
      return;
    }
    const timer = setTimeout(() => {
      clearRecentUnlocks();
    }, 6000);
    return () => clearTimeout(timer);
  }, [recentlyUnlocked, clearRecentUnlocks]);

  const recentTitles = recentlyUnlocked
    .map(
      (id) => ACHIEVEMENT_DEFINITIONS.find((item) => item.id === id)?.title
    )
    .filter(Boolean);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Conquistas</Text>
      <Text style={styles.subtitle}>
        {unlocked.length}/{views.length} desbloqueadas · progresso local
      </Text>

      {recentTitles.length > 0 ? (
        <View style={styles.toast}>
          <Text style={styles.toastTitle}>Nova conquista desbloqueada!</Text>
          <Text style={styles.toastBody}>{recentTitles.join(' · ')}</Text>
        </View>
      ) : null}

      {unlockedViews.length === 0 ? (
        <Text style={styles.empty}>
          Ainda sem conquistas. Estude, revise e complete missões para
          desbloquear as primeiras.
        </Text>
      ) : (
        <View style={styles.list}>
          {unlockedViews.slice(0, 6).map((item) => (
            <AchievementBadge key={item.id} achievement={item} compact />
          ))}
        </View>
      )}

      {lockedViews.length > 0 ? (
        <>
          <Text style={styles.section}>Próximas</Text>
          <View style={styles.list}>
            {lockedViews.map((item) => (
              <AchievementBadge key={item.id} achievement={item} />
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.meta}>
        Lições {counters.lessonsCompleted} · Questões{' '}
        {counters.questionsAnswered} · Revisões {counters.reviewsAnswered}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text.primary,
    ...typography.title,
    fontSize: 20,
  },
  subtitle: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  toast: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.xp,
    padding: spacing.md,
    gap: 4,
  },
  toastTitle: {
    color: colors.xp,
    fontWeight: '800',
    fontSize: 13,
  },
  toastBody: {
    color: colors.text.primary,
    ...typography.bodySmall,
  },
  empty: {
    color: colors.text.muted,
    ...typography.bodySmall,
  },
  section: {
    color: colors.text.secondary,
    fontWeight: '800',
    fontSize: 13,
    marginTop: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  meta: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
});
