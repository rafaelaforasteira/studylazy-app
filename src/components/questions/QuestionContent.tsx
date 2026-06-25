import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import QuestionContentBlocks from './QuestionContentBlocks';
import {
  getQuestionPrompt,
  type Question,
} from '../../data/questionTypes';

type QuestionContentProps = {
  question: Question;
};

export default function QuestionContent({ question }: QuestionContentProps) {
  const hasStructuredContent = Boolean(
    question.contentBlocks?.length ||
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

  const usesBlocks = Boolean(question.contentBlocks?.length);

  return (
    <View style={styles.container}>
      {usesBlocks ? (
        <QuestionContentBlocks blocks={question.contentBlocks ?? []} />
      ) : (
        <>
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
        </>
      )}

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
    marginBottom: spacing.lg,
  },

  supportTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },

  verseText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },

  proseText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },

  citation: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },

  prompt: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
    marginTop: 20,
    marginBottom: 18,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },

  promptFallback: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
    marginBottom: 18,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
});
