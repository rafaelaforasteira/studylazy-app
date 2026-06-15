import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { LessonHistoryItem } from '../../store/studyProgressStore';

type LessonHistoryCardProps = {
  history: LessonHistoryItem[];
  onSeeAllPress?: () => void;
};

function formatDate(date: string) {
  return date.split('-').reverse().join('/');
}

export default function LessonHistoryCard({
  history,
  onSeeAllPress,
}: LessonHistoryCardProps) {
  const recentHistory = history.slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico recente</Text>

        {history.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentHistory.length === 0 ? (
        <Text style={styles.emptyText}>
          Suas lições concluídas vão aparecer aqui.
        </Text>
      ) : (
        recentHistory.map((lesson) => (
          <View key={lesson.id} style={styles.lessonItem}>
            <View style={styles.lessonHeader}>
              <Text style={styles.subject}>{lesson.subject}</Text>

              <Text style={styles.date}>{formatDate(lesson.date)}</Text>
            </View>

            <Text style={styles.description}>
              {lesson.minutes} min • {lesson.correctAnswers}/{lesson.totalQuestions} acertos
            </Text>

            <Text style={styles.xp}>+{lesson.earnedXp} XP</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
  },

  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  emptyText: {
    color: colors.text.secondary,
    ...typography.body,
  },

  lessonItem: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },

  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  subject: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  date: {
    color: colors.text.secondary,
    fontSize: 13,
  },

  description: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },

  xp: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});