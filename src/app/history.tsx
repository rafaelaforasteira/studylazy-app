import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useStudyProgressStore } from '../store/studyProgressStore';

function formatDate(date: string) {
  return date.split('-').reverse().join('/');
}

export default function HistoryScreen() {
  const router = useRouter();

  const lessonHistory =
    useStudyProgressStore((state) => state.lessonHistory) || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>

        <Text style={styles.subtitle}>
          Veja todas as lições que você já concluiu.
        </Text>
      </View>

      {lessonHistory.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📚</Text>

          <Text style={styles.emptyTitle}>Nenhuma lição concluída ainda</Text>

          <Text style={styles.emptyDescription}>
            Quando você finalizar sua primeira lição, ela vai aparecer aqui.
          </Text>
        </View>
      ) : (
        lessonHistory.map((lesson) => (
          <View key={lesson.id} style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <Text style={styles.subject}>{lesson.subject}</Text>

              <Text style={styles.date}>{formatDate(lesson.date)}</Text>
            </View>

            <Text style={styles.description}>
              {lesson.minutes} min • {lesson.totalQuestions} questões
            </Text>

            <Text style={styles.result}>
              {lesson.correctAnswers} acertos • +{lesson.earnedXp} XP
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
  },

  emptyCard: {
    backgroundColor: colors.card.background,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  emptyDescription: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },

  lessonCard: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
  },

  date: {
    color: colors.text.secondary,
    fontSize: 14,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.sm,
  },

  result: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  buttonText: {
    color: colors.background,
    ...typography.button,
  },
});