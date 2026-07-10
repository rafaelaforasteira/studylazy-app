import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import QuestionMetaBadges from '../components/questions/QuestionMetaBadges';
import QuestionContent from '../components/questions/QuestionContent';
import ReportProblemButton from '../components/questions/ReportProblemButton';

import { colors } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useStudyProgressStore } from '../store/studyProgressStore';
import {
  LessonMistakeInput,
  useMistakeStore,
} from '../store/mistakeStore';

import { ROUTES } from '../constants/routes';

import { getQuestionsForLesson, getStableQuestionId } from '../data/questionBank';
import { toReportableQuestion } from '../utils/questionReports';
import { questionToLessonMistake } from '../utils/questionMistake';

export default function StudySessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { subject, duration, type, startedAt } = useLocalSearchParams<{
    subject: string;
    duration: string;
    type: string;
    startedAt?: string;
  }>();

  const completeLesson = useStudyProgressStore(
    (state) => state.completeLesson
  );
  const recordQuestionResult = useStudyProgressStore(
    (state) => state.recordQuestionResult
  );
  const addLessonMistakes = useMistakeStore(
    (state) => state.addLessonMistakes
  );

  const lessonSubject = subject || 'Português';
  const lessonDuration = Number(duration) || 5;
  const lessonType = type || 'Teoria';
  const sessionShuffleSeed = startedAt
    ? Number(startedAt) % 2147483647
    : undefined;

  // Snapshot do histórico capturado no início da sessão, para que a seleção
  // permaneça estável enquanto o usuário responde (sem re-selecionar a cada
  // resposta registrada).
  const [selectionHistory] = useState(() => {
    const state = useStudyProgressStore.getState();
    return {
      performanceByQuestion: state.questionPerformance,
      recentQuestionIds: state.recentQuestionIds,
    };
  });

  const questions = useMemo(() => {
    return getQuestionsForLesson({
      subject: lessonSubject,
      amount: lessonDuration,
      shuffleSeed: sessionShuffleSeed,
      performanceByQuestion: selectionHistory.performanceByQuestion,
      recentQuestionIds: selectionHistory.recentQuestionIds,
    });
  }, [lessonSubject, lessonDuration, sessionShuffleSeed, selectionHistory]);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  const [selectedOption, setSelectedOption] =
    useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lessonMistakes, setLessonMistakes] = useState<
    LessonMistakeInput[]
  >([]);
  const [lessonResult, setLessonResult] = useState({
    earnedXp: 0,
    isRepeat: false,
  });
  const [showExitModal, setShowExitModal] = useState(false);

  const hasSavedProgress = useRef(false);
  // Trava de reentrância: bloqueia toque duplo em "Responder"/"Continuar",
  // evitando registrar resposta/XP duas vezes ou pular questões.
  const answerLockRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });
  }, [currentQuestionIndex, currentQuestion?.externalId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (showExitModal) {
          setShowExitModal(false);
          return true;
        }
        if (!isFinished) {
          setShowExitModal(true);
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [showExitModal, isFinished]);

  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const accuracy =
    questions.length > 0
      ? Math.round(
          (correctAnswers / questions.length) * 100
        )
      : 0;

  function handleSelectOption(option: string) {
    if (hasAnswered) return;
    setSelectedOption(option);
  }

  function handleConfirmAnswer() {
    if (!selectedOption || !currentQuestion) return;
    if (hasAnswered || answerLockRef.current) return;
    answerLockRef.current = true;

    const isCorrect =
      selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers((current) => current + 1);
    } else {
      setLessonMistakes((currentMistakes) => [
        ...currentMistakes,
        questionToLessonMistake(currentQuestion, selectedOption),
      ]);
    }

    recordQuestionResult({
      stableQuestionId: getStableQuestionId(currentQuestion),
      isCorrect,
      topic: currentQuestion.topic,
      subject: lessonSubject,
    });

    setHasAnswered(true);
  }

  function saveLessonProgress() {
    if (hasSavedProgress.current) return;

    const result = completeLesson({
      minutes: lessonDuration,
      totalQuestions: questions.length,
      correctAnswers,
      subject: lessonSubject,
    });

    addLessonMistakes(lessonSubject, lessonMistakes);

    setLessonResult(result);
    hasSavedProgress.current = true;
  }

  function handleNextQuestion() {
    // Só avança se houve resposta confirmada; consome a trava para impedir
    // que toques rápidos pulem questões ou concluam a sessão duas vezes.
    if (!answerLockRef.current) return;
    answerLockRef.current = false;

    const isLastQuestion =
      currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      saveLessonProgress();
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((current) => current + 1);
    setSelectedOption(null);
    setHasAnswered(false);
  }

  function handleFinishLesson() {
    router.replace(ROUTES.tabsAtividade);
  }

  function handleExitLesson() {
    setShowExitModal(true);
  }

  function handleDismissExit() {
    setShowExitModal(false);
  }

  function handleConfirmExit() {
    setShowExitModal(false);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.tabsEstudar);
  }

  if (questions.length === 0) {
    return (
      <AppScreen>
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableTitle}>
            Questões oficiais em preparação
          </Text>
          <Text style={styles.unavailableMessage}>
            Ainda não há questões oficiais validadas suficientes para esta
            matéria. Novos conteúdos serão adicionados em breve.
          </Text>
          <PrimaryButton
            label="Voltar para Estudar"
            onPress={() => router.replace(ROUTES.tabsEstudar)}
          />
        </View>
      </AppScreen>
    );
  }

  if (isFinished) {
    return (
      <AppScreen>
        <View style={styles.finishedCard}>
          <SymbolView
            name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
            tintColor={colors.xp}
            size={56}
          />

          <Text style={styles.finishedTitle}>Lição concluída!</Text>

          <View style={styles.resultRow}>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Questões</Text>
              <Text style={styles.resultValue}>
                {questions.length}
              </Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Acertos</Text>
              <Text style={styles.resultValue}>
                {correctAnswers}
              </Text>
            </View>
          </View>

          <View style={styles.accuracyBox}>
            <Text style={styles.accuracyLabel}>
              Aproveitamento
            </Text>
            <Text style={styles.accuracyValue}>{accuracy}%</Text>
          </View>

          {lessonResult.isRepeat ? (
            <View style={styles.repeatBox}>
              <Text style={styles.repeatText}>
                Repetição do dia • sem XP adicional
              </Text>
            </View>
          ) : (
            <View style={styles.xpBox}>
              <Text style={styles.xpText}>
                +{lessonResult.earnedXp} XP
              </Text>
            </View>
          )}

          {lessonMistakes.length > 0 ? (
            <Text style={styles.reviewMessage}>
              Você tem {lessonMistakes.length}{' '}
              {lessonMistakes.length === 1
                ? 'questão para revisar.'
                : 'questões para revisar.'}
            </Text>
          ) : (
            <Text style={styles.perfectMessage}>
              Lição perfeita! Nenhum erro para revisar.
            </Text>
          )}

          <Text style={styles.finishedDescription}>
            Seu progresso já foi salvo.
          </Text>
        </View>

        <PrimaryButton
          label="Voltar para Atividade"
          onPress={handleFinishLesson}
        />

        {lessonMistakes.length > 0 && (
          <PrimaryButton
            label="Revisar erros agora"
            variant="secondary"
            onPress={() => router.replace(ROUTES.reviewMistakes)}
            style={styles.secondaryFinishButton}
          />
        )}
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da lição"
            hitSlop={12}
            onPress={handleExitLesson}
            style={styles.closeButton}
          >
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              tintColor={colors.text.primary}
              size={20}
            />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={styles.label}>{lessonSubject}</Text>
            <Text style={styles.description}>
              {lessonType} • {questions.length} questões
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              Questão {currentQuestionIndex + 1} de{' '}
              {questions.length}
            </Text>
          </View>

          <View style={styles.questionCard}>
            <QuestionMetaBadges question={currentQuestion} />
            <QuestionContent question={currentQuestion} />

            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect =
                option === currentQuestion.correctAnswer;
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
              question={toReportableQuestion(
                currentQuestion,
                lessonSubject
              )}
              context="study"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {hasAnswered && (
            <View
              style={[
                styles.feedbackBox,
                selectedOption === currentQuestion.correctAnswer
                  ? styles.feedbackCorrect
                  : styles.feedbackWrong,
              ]}
            >
              <Text style={styles.feedbackText}>
                {selectedOption ===
                currentQuestion.correctAnswer
                  ? 'Boa! Você acertou.'
                  : `A resposta correta é: ${currentQuestion.correctAnswer}`}
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
                currentQuestionIndex === questions.length - 1
                  ? 'Concluir lição'
                  : 'Continuar'
              }
              onPress={handleNextQuestion}
            />
          )}
        </View>

        <Modal
          visible={showExitModal}
          transparent
          animationType="fade"
          onRequestClose={handleDismissExit}
        >
          <View
            style={[
              styles.modalOverlay,
              {
                paddingTop: Math.max(insets.top, spacing.lg),
                paddingBottom: Math.max(insets.bottom, spacing.lg),
              },
            ]}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Sair da lição?</Text>
              <Text style={styles.modalMessage}>
                O progresso da sessão atual não será concluído. Nenhum XP,
                histórico ou sequência será alterado.
              </Text>

              <PrimaryButton
                label="Continuar estudando"
                onPress={handleDismissExit}
              />

              <PrimaryButton
                label="Sair da lição"
                variant="secondary"
                onPress={handleConfirmExit}
                style={styles.modalSecondaryButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
    zIndex: 2,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
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
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },

  progressText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
    ...typography.bodySmall,
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
    borderWidth: 1,
  },

  feedbackCorrect: {
    backgroundColor: colors.successTone.background,
    borderColor: colors.successTone.border,
  },

  feedbackWrong: {
    backgroundColor: colors.error.background,
    borderColor: colors.error.border,
  },

  feedbackText: {
    color: colors.text.primary,
    textAlign: 'center',
    ...typography.body,
    fontWeight: '700',
  },

  finishedCard: {
    backgroundColor: colors.card.background,
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.md,
  },

  finishedTitle: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  resultRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
  },

  resultBox: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },

  resultLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    marginBottom: 4,
  },

  resultValue: {
    color: colors.text.primary,
    ...typography.stat,
  },

  accuracyBox: {
    width: '100%',
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },

  accuracyLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    marginBottom: 4,
  },

  accuracyValue: {
    color: colors.text.primary,
    ...typography.stat,
  },

  xpBox: {
    backgroundColor: colors.xp,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
  },

  xpText: {
    color: colors.background,
    fontSize: 22,
    fontWeight: 'bold',
  },

  repeatBox: {
    backgroundColor: colors.card.elevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  repeatText: {
    color: colors.text.secondary,
    ...typography.body,
    fontWeight: '700',
  },

  reviewMessage: {
    color: colors.warning,
    ...typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },

  perfectMessage: {
    color: colors.success,
    ...typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },

  finishedDescription: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    textAlign: 'center',
  },

  secondaryFinishButton: {
    marginTop: spacing.sm,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
  },

  modalTitle: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  modalMessage: {
    color: colors.text.secondary,
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  modalSecondaryButton: {
    marginTop: spacing.sm,
  },

  unavailableCard: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },

  unavailableTitle: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  unavailableMessage: {
    color: colors.text.secondary,
    ...typography.body,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
