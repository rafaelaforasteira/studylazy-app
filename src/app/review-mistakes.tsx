import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
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
import QuestionMetaBadges from '../components/questions/QuestionMetaBadges';
import QuestionContent from '../components/questions/QuestionContent';
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
import {
  findQuestionReference,
  selectReviewMistakes,
} from '../data/questionBank';
import { toReportableFromMistake } from '../utils/questionReports';
import { mistakeToQuestion } from '../utils/questionMistake';
import {
  resolveEntitlementState,
  sliceReviewQueue,
} from '../entitlements/entitlementLogic';
import { useEntitlementStore } from '../entitlements/entitlementStore';
import {
  getStableQuestionId,
  isOfficialVerifiedQuestion,
  type Question,
} from '../data/questionTypes';
import { useLivesStore } from '../store/livesStore';
import LivesIndicator from '../components/lives/LivesIndicator';
import { useMissionStore } from '../store/missionStore';

const Q177_EXTERNAL_ID = 'ENEM-2023-D2-C5-Q177';

function isEligibleForReviewLifeReward(
  question: Question | null | undefined
): boolean {
  if (!question) {
    return false;
  }
  if (question.externalId === Q177_EXTERNAL_ID) {
    return false;
  }
  if (question.officialStatus === 'annulled') {
    return false;
  }
  if (question.originType !== 'official_exam') {
    return false;
  }
  return isOfficialVerifiedQuestion(question);
}

export default function ReviewMistakesScreen() {
  const router = useRouter();

  const mistakes = useMistakeStore((state) => state.mistakes);
  const removeMistake = useMistakeStore(
    (state) => state.removeMistake
  );
  const rewardFromReviewCorrect = useLivesStore(
    (state) => state.rewardFromReviewCorrect
  );

  const [reviewQueue] = useState<MistakeItem[]>(() => {
    const resolved = resolveEntitlementState(useEntitlementStore.getState());
    return sliceReviewQueue(
      selectReviewMistakes({
        mistakes: useMistakeStore.getState().mistakes,
      }),
      resolved
    );
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] =
    useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctedCount, setCorrectedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lifeRewardMessage, setLifeRewardMessage] = useState<string | null>(
    null
  );
  // Trava de reentrância contra toque duplo em "Responder"/"Continuar".
  const answerLockRef = useRef(false);
  const rewardedKeysRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

  const currentMistake: MistakeItem | undefined =
    reviewQueue[currentIndex];

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });
  }, [currentIndex, currentMistake?.id]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!isFinished) {
          router.replace(ROUTES.tabsRevisar);
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [isFinished, router]);

  const pendingCount = mistakes.length;

  const progress =
    reviewQueue.length > 0
      ? ((currentIndex + 1) / reviewQueue.length) * 100
      : 0;

  const matchedQuestion = useMemo(
    () =>
      currentMistake
        ? findQuestionReference({
            externalId: currentMistake.externalId,
            statement: currentMistake.question,
          })
        : null,
    [currentMistake]
  );

  const displayQuestion = useMemo(() => {
    if (!currentMistake) {
      return null;
    }

    return matchedQuestion ?? mistakeToQuestion(currentMistake);
  }, [currentMistake, matchedQuestion]);

  const questionForBadges = displayQuestion;

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
    if (hasAnswered || answerLockRef.current) return;
    answerLockRef.current = true;

    const isCorrect =
      selectedOption === currentMistake.correctAnswer;

    setLifeRewardMessage(null);

    // Missões: conta cada resposta na revisão (acerto ou erro), uma vez.
    useMissionStore.getState().recordReviewAnswer();

    if (isCorrect) {
      removeMistake(currentMistake.id);
      setCorrectedCount((value) => value + 1);

      const eligible = isEligibleForReviewLifeReward(matchedQuestion);
      const stableId = matchedQuestion
        ? getStableQuestionId(matchedQuestion)
        : currentMistake.externalId?.trim() || '';

      if (
        eligible &&
        stableId &&
        !rewardedKeysRef.current.has(stableId)
      ) {
        rewardedKeysRef.current.add(stableId);
        const reward = rewardFromReviewCorrect({
          stableQuestionId: stableId,
          isEligibleOfficial: true,
        });
        if (reward.applied && reward.message) {
          setLifeRewardMessage(reward.message);
        }
      }
    }

    setHasAnswered(true);
  }

  function handleNextQuestion() {
    if (!answerLockRef.current) return;
    answerLockRef.current = false;

    const isLastQuestion =
      currentIndex === reviewQueue.length - 1;

    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedOption(null);
    setHasAnswered(false);
    setLifeRewardMessage(null);
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
            label="Voltar para Revisar"
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
            label="Voltar para Revisar"
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
          ref={scrollRef}
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

            <View style={styles.livesRow}>
              <LivesIndicator showCount showRegenHint compact />
            </View>

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
            {displayQuestion ? (
              <>
                <QuestionMetaBadges question={questionForBadges ?? undefined} />
                <QuestionContent question={displayQuestion} />
              </>
            ) : null}

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
              {lifeRewardMessage ? (
                <Text style={styles.lifeRewardText}>{lifeRewardMessage}</Text>
              ) : null}
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
            label="Voltar para Revisar"
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
    marginBottom: spacing.md,
  },

  livesRow: {
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
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
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
    backgroundColor: colors.card.background,
    padding: 22,
    borderRadius: radii.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  optionButton: {
    width: '100%',
    minWidth: 0,
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
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
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

  lifeRewardText: {
    color: colors.xp,
    textAlign: 'center',
    ...typography.bodySmall,
    fontWeight: '700',
    marginTop: spacing.sm,
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
