import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useStudyProgressStore } from '../store/studyProgressStore';

import { getQuestionsForLesson } from '../data/questionBank';

export default function StudySessionScreen() {
  const router = useRouter();

  const { subject, duration, type } = useLocalSearchParams<{
    subject: string;
    duration: string;
    type: string;
  }>();

  const completeLesson = useStudyProgressStore((state) => state.completeLesson);

  const lessonSubject = subject || 'Português';
  const lessonDuration = Number(duration) || 5;
  const lessonType = type || 'Teoria';

  const questions = useMemo(() => {
    return getQuestionsForLesson({
      subject: lessonSubject,
      amount: lessonDuration,
    });
  }, [lessonSubject, lessonDuration]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const earnedXp = questions.length * 5 + correctAnswers * 5;

  function handleSelectOption(option: string) {
    if (hasAnswered) return;

    setSelectedOption(option);
  }

  function handleConfirmAnswer() {
    if (!selectedOption) return;

    if (selectedOption === currentQuestion.correctAnswer) {
      setCorrectAnswers((current) => current + 1);
    }

    setHasAnswered(true);
  }

  function handleNextQuestion() {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((current) => current + 1);
    setSelectedOption(null);
    setHasAnswered(false);
  }

  function handleFinishLesson() {
    if (!hasSavedProgress) {
      completeLesson({
        minutes: lessonDuration,
        totalQuestions: questions.length,
        correctAnswers,
        subject: lessonSubject,
      });

      setHasSavedProgress(true);
    }

    router.replace('/dashboard');
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.finishedCard}>
          <Text style={styles.finishedEmoji}>🎉</Text>

          <Text style={styles.finishedTitle}>Meta concluída!</Text>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Questões respondidas</Text>
            <Text style={styles.resultValue}>{questions.length}</Text>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Acertos</Text>
            <Text style={styles.resultValue}>{correctAnswers}</Text>
          </View>

          <View style={styles.xpBox}>
            <Text style={styles.xpText}>+{earnedXp} XP</Text>
          </View>

          <Text style={styles.finishedDescription}>
            Cada questão respondida te deixa mais perto da aprovação.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleFinishLesson}>
          <Text style={styles.primaryButtonText}>Voltar para o dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>{lessonSubject}</Text>

        <Text style={styles.description}>
          {lessonType} • {questions.length} questões
        </Text>

        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.progressText}>
          Questão {currentQuestionIndex + 1} de {questions.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQuestion.correctAnswer;
          const isWrongSelected = hasAnswered && isSelected && !isCorrect;
          const shouldShowCorrect = hasAnswered && isCorrect;

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
                  shouldShowCorrect && styles.feedbackOptionText,
                  isWrongSelected && styles.feedbackOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View>
        {hasAnswered && (
          <Text style={styles.feedbackText}>
            {selectedOption === currentQuestion.correctAnswer
              ? 'Boa! Você acertou ✅'
              : `Quase! A resposta certa é: ${currentQuestion.correctAnswer}`}
          </Text>
        )}

        {!hasAnswered ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !selectedOption && styles.primaryButtonDisabled,
            ]}
            onPress={handleConfirmAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.primaryButtonText}>Responder</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleNextQuestion}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Sair da lição</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
    justifyContent: 'space-between',
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
    backgroundColor: colors.card.background,
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  progressText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
    ...typography.body,
  },

  questionCard: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 24,
  },

  question: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: spacing.lg,
  },

  optionButton: {
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card.selected,
  },

  optionCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#14532d',
  },

  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#7f1d1d',
  },

  optionText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  optionTextSelected: {
    color: colors.primary,
  },

  feedbackOptionText: {
    color: '#ffffff',
  },

  feedbackText: {
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    ...typography.body,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  primaryButtonDisabled: {
    backgroundColor: colors.button.disabled,
  },

  primaryButtonText: {
    color: colors.background,
    ...typography.button,
  },

  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: colors.text.secondary,
    ...typography.body,
  },

  finishedCard: {
    backgroundColor: colors.card.background,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },

  finishedEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },

  finishedTitle: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  resultBox: {
    width: '100%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    alignItems: 'center',
  },

  resultLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 4,
  },

  resultValue: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },

  xpBox: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    marginBottom: spacing.lg,
  },

  xpText: {
    color: colors.background,
    fontSize: 22,
    fontWeight: 'bold',
  },

  finishedDescription: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
});