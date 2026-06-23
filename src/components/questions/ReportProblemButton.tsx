import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { QuestionReportContext } from '../../store/questionReportStore';
import type { ReportableQuestion } from '../../utils/questionReports';

import ReportQuestionModal from './ReportQuestionModal';

type ReportProblemButtonProps = {
  question: ReportableQuestion | null;
  context: QuestionReportContext;
  style?: ViewStyle;
};

export default function ReportProblemButton({
  question,
  context,
  style,
}: ReportProblemButtonProps) {
  const [visible, setVisible] = useState(false);

  if (!question) {
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Relatar um problema nesta questão"
        onPress={() => setVisible(true)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.button,
          style,
          pressed && styles.buttonPressed,
        ]}
      >
        <SymbolView
          name={{
            ios: 'flag.fill',
            android: 'flag',
            web: 'flag',
          }}
          tintColor={colors.text.secondary}
          size={14}
        />
        <Text style={styles.label}>Relatar um problema</Text>
      </Pressable>

      <ReportQuestionModal
        visible={visible}
        question={question}
        context={context}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  label: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
