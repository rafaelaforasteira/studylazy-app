import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { LessonHistoryItem } from '../../store/studyProgressStore';

type ActivityFeedItemProps = {
  lesson: LessonHistoryItem;
};

export default function ActivityFeedItem({ lesson }: ActivityFeedItemProps) {
  const xpLabel =
    lesson.earnedXp > 0
      ? `+${lesson.earnedXp} XP`
      : 'Repetição • sem XP';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{lesson.subject} concluído</Text>

      <Text style={styles.description}>
        {lesson.totalQuestions} questões • {lesson.correctAnswers} acertos •{' '}
        {xpLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },

  description: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
});
