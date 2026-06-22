import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';

import { colors } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { formatDisplayDate } from '../utils/date';

import { useStudyProgressStore } from '../store/studyProgressStore';

export default function HistoryScreen() {
  const router = useRouter();

  const lessonHistory =
    useStudyProgressStore((state) => state.lessonHistory) || [];

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>
          Veja todas as lições que você já concluiu.
        </Text>
      </View>

      {lessonHistory.length === 0 ? (
        <View style={styles.emptyCard}>
          <SymbolView
            name={{ ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' }}
            tintColor={colors.primary}
            size={48}
          />

          <Text style={styles.emptyTitle}>
            Nenhuma lição concluída ainda
          </Text>

          <Text style={styles.emptyDescription}>
            Quando você finalizar sua primeira lição, ela
            vai aparecer aqui.
          </Text>
        </View>
      ) : (
        lessonHistory.map((lesson) => (
          <View key={lesson.id} style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <Text style={styles.subject}>{lesson.subject}</Text>
              <Text style={styles.date}>
                {formatDisplayDate(lesson.date)}
              </Text>
            </View>

            <Text style={styles.description}>
              {lesson.minutes} min • {lesson.totalQuestions}{' '}
              questões
            </Text>

            <Text
              style={[
                styles.result,
                lesson.earnedXp === 0 && styles.resultRepeat,
              ]}
            >
              {lesson.correctAnswers} acertos •{' '}
              {lesson.earnedXp > 0
                ? `+${lesson.earnedXp} XP`
                : 'Repetição • sem XP'}
            </Text>
          </View>
        ))
      )}

      <PrimaryButton
        label="Voltar"
        onPress={() => router.back()}
        style={styles.button}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: radii.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.md,
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  emptyDescription: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },

  lessonCard: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
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
    color: colors.xp,
    fontSize: 16,
    fontWeight: '700',
  },

  resultRepeat: {
    color: colors.text.muted,
  },

  button: {
    marginTop: spacing.lg,
  },
});
