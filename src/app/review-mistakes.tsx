import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import QuestionSourceBadges from '../components/questions/QuestionSourceBadges';
import ReportProblemButton from '../components/questions/ReportProblemButton';

import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import {
  MistakeItem,
  useMistakeStore,
} from '../store/mistakeStore';
import { findQuestionByStatement } from '../data/questionBank';
import { toReportableFromMistake } from '../utils/questionReports';

export default function ReviewMistakesScreen() {
  const router = useRouter();

  const mistakes = useMistakeStore((state) => state.mistakes);
  const removeMistake = useMistakeStore(
    (state) => state.removeMistake
  );

  const [reviewQueue] = useState<MistakeItem[]>(() => [
    ...useMistakeStore.getState().mistakes,
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] =
    useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctedCount, setCorrectedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentMistake: MistakeItem | undefined =
    reviewQueue[currentIndex];

  const pendingCount = mistakes.length;

  const progress =
    reviewQueue.length > 0
      ? ((currentIndex + 1) / reviewQueue.length) * 100
      : 0;

  const matchedQuestion = useMemo(
    () =>
      currentMistake
        ? findQuestionByStatement(currentMistake.question)
        : null,
    [currentMistake]
  );

  const reportableQuestion = useMemo(
    () =>
      currentMistake
        ? toReportableFromMistake(currentMistake, matchedQuestion)
        : null,
    [currentMistake, matchedQuestion]
  );

  function handleSelectOption(option: string) {
    if (hasAnswered) return;
    setSelectedOption(option);
  }

  function handleConfirmAnswer() {
    if (!selectedOption || !currentMistake) return;

    const isCorrect =
      selectedOption === currentMistake.correctAnswer;

    if (isCorrect) {
      removeMistake(currentMistake.id);
      setCorrectedCount((value) => value + 1);
    }

    setHasAnswered(true);
  }

  function handleNextQuestion() {
    const isLastQuestion =
      currentIndex === reviewQueue.length - 1;

    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedOption(null);
    setHasAnswered(false);
  }

  function handleFinish() {
    router.replace(ROUTES.tabsRevisar);
  }

  if (reviewQueue.length === 0) {
    return (
      <AppScreen>
        <View style={styles.emptyState}>
          <SymbolView
            name={{ ios: 'checkmark.circle.fill', android: 'check', web: 'check' }}
            tintColor={colors.success}
            size={64}
          />

          <Text style={styles.emptyTitle}>
            Nenhum erro para revisar
          </Text>

          <Text style={styles.emptyDescription}>
            Continue estudando e volte aqui quando
            precisar reforçar alguma questão.
          </Text>

          <PrimaryButton
            label="Voltar ao dashboard"
            onPress={handleFinish}
            style={styles.finishButton}
          />
        </View>
      </AppScreen>
    );
  }

  if (isFinished) {
    const stillPending = pendingCount;

    return (
      <AppScreen>
        <View style={styles.summaryCard}>
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            tintColor={colors.xp}
            size={56}
          />

          <Text style={styles.summaryTitle}>
            Revisão concluída
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>
                {correctedCount}
              </Text>
              <Text style={styles.summaryLabel}>
                Corrigidas
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>
                {stillPending}
              </Text>
              <Text style={styles.summaryLabel}>
                Pendentes
              </Text>
            </View>
          </View>

          <Text style={styles.summaryDescription}>
            {stillPending > 0
              ? 'Continue revisando para eliminar os erros restantes.'
              : 'Excelente! Você corrigiu todas as questões desta revisão.'}
          </Text>

          <PrimaryButton
            label="Voltar ao dashboard"
            onPress={handleFinish}
            style={styles.finishButton}
          />
        </View>
      </AppScreen>
    );
  }

  if (!currentMistake) {
    return null;
  }

  const isCorrectAnswer =
    selectedOption === currentMistake.correctAnswer;

  return (
    <AppScreen scroll={false}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={styles.label}>Revisão de erros</Text>

            <Text style={styles.description}>
              {currentMistake.subject} • questão{' '}
              {currentIndex + 1} de {reviewQueue.length}
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.questionCard}>
            <QuestionSourceBadges
              source={matchedQuestion?.source}
              area={matchedQuestion?.area}
            />
            <Text style={styles.question}>
              {currentMistake.question}
            </Text>

            {currentMistake.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect =
                option === currentMistake.correctAnswer;
              const isWrongSelected =
                hasAnswered && isSelected && !isCorrect;
              const shouldShowCorrect =
                hasAnswered && isCorrect;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionSelected,
                    shouldShowCorrect && styles.optionCorrect,
                    isWrongSelected && styles.optionWrong,
                  ]}
                  onPress={() => handleSelectOption(option)}
                  disabled={hasAnswered}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      (shouldShowCorrect || isWrongSelected) &&
                        styles.feedbackOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <ReportProblemButton
              question={reportableQuestion}
              context="review"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {hasAnswered && (
            <View
              style={[
                styles.feedbackBox,
                isCorrectAnswer
                  ? styles.feedbackCorrect
                  : styles.feedbackWrong,
              ]}
            >
              <Text style={styles.feedbackText}>
                {isCorrectAnswer
                  ? 'Ótimo! Erro corrigido.'
                  : `Ainda pendente. Resposta correta: ${currentMistake.correctAnswer}`}
              </Text>
            </View>
          )}

          {!hasAnswered ? (
            <PrimaryButton
              label="Responder"
              onPress={handleConfirmAnswer}
              disabled={!selectedOption}
            />
          ) : (
            <PrimaryButton
              label={
                currentIndex === reviewQueue.length - 1
                  ? 'Concluir revisão'
                  : 'Continuar'
              }
              onPress={handleNextQuestion}
            />
          )}

          <PrimaryButton
            label="Voltar ao dashboard"
            variant="secondary"
            onPress={handleFinish}
            style={styles.secondaryAction}
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing.lg,
  },

  label: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: colors.card.elevated,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: radii.pill,
  },

  questionCard: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  question: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 30,
    marginBottom: spacing.lg,
  },

  optionButton: {
    backgroundColor: colors.card.elevated,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },

  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card.selected,
  },

  optionCorrect: {
    borderColor: colors.successTone.border,
    backgroundColor: colors.successTone.background,
  },

  optionWrong: {
    borderColor: colors.error.border,
    backgroundColor: colors.error.background,
  },

  optionText: {
    color: colors.text.primary,
    ...typography.option,
  },

  optionTextSelected: {
    color: colors.primary,
  },

  feedbackOptionText: {
    color: colors.text.primary,
  },

  footer: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  feedbackBox: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },

  feedbackCorrect: {
    backgroundColor: colors.successTone.background,
    borderWidth: 1,
    borderColor: colors.successTone.border,
  },

  feedbackWrong: {
    backgroundColor: colors.error.background,
    borderWidth: 1,
    borderColor: colors.error.border,
  },

  feedbackText: {
    color: colors.text.primary,
    textAlign: 'center',
    ...typography.body,
    fontWeight: '700',
  },

  secondaryAction: {
    marginTop: spacing.xs,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },

  emptyTitle: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  emptyDescription: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  summaryCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card.background,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.md,
  },

  summaryTitle: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
  },

  summaryValue: {
    color: colors.text.primary,
    ...typography.stat,
  },

  summaryLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },

  summaryDescription: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },

  finishButton: {
    width: '100%',
    marginTop: spacing.md,
  },
});
