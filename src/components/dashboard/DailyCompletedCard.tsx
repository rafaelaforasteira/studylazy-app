import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
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
      <SymbolView
        name={{ ios: 'checkmark.seal.fill', android: 'check', web: 'check' }}
        tintColor={colors.success}
        size={52}
      />

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
        Volte amanhã para manter sua sequência.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.xl,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.successTone.border,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  resultBox: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },

  resultText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  footer: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
