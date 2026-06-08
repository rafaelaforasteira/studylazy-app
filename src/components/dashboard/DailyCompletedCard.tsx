import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type DailyCompletedCardProps = {
  answeredQuestions: number;
  correctAnswers: number;
};

export default function DailyCompletedCard({
  answeredQuestions,
  correctAnswers,
}: DailyCompletedCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>🎉</Text>

      <Text style={styles.title}>Meta do dia concluída!</Text>

      <Text style={styles.description}>
        Você finalizou todas as lições de hoje.
      </Text>

      <View style={styles.resultBox}>
        <Text style={styles.resultText}>
          {correctAnswers} acertos em {answeredQuestions} questões
        </Text>
      </View>

      <Text style={styles.footer}>
        Volte amanhã para manter sua sequência 🔥
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.xl,
    borderRadius: 24,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },

  emoji: {
    fontSize: 52,
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  resultBox: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },

  resultText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  footer: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
});