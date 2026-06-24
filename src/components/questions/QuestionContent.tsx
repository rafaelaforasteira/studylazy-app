import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import {
  getQuestionPrompt,
  type Question,
} from '../../data/questionTypes';

type QuestionContentProps = {
  question: Question;
};

export default function QuestionContent({ question }: QuestionContentProps) {
  const hasStructuredContent = Boolean(
    question.supportText ||
      question.supportTitle ||
      question.sourceCitation ||
      question.prompt
  );

  if (!hasStructuredContent) {
    return (
      <Text style={styles.promptFallback}>{getQuestionPrompt(question)}</Text>
    );
  }

  return (
    <View style={styles.container}>
      {question.supportTitle ? (
        <Text style={styles.supportTitle}>{question.supportTitle}</Text>
      ) : null}

      {question.supportText ? (
        <Text
          style={
            question.contentFormat === 'verse'
              ? styles.verseText
              : styles.proseText
          }
        >
          {question.supportText}
        </Text>
      ) : null}

      {question.sourceCitation ? (
        <Text style={styles.citation}>{question.sourceCitation}</Text>
      ) : null}

      <Text style={styles.prompt}>{getQuestionPrompt(question)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
    gap: spacing.md,
  },

  supportTitle: {
    color: colors.text.primary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
  },

  verseText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },

  proseText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 27,
  },

  citation: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
  },

  prompt: {
    color: colors.text.primary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: spacing.xs,
  },

  promptFallback: {
    color: colors.text.primary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 28,
  },
});
