import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import {
  useQuestionReportStore,
  type QuestionReportCategory,
  type QuestionReportContext,
} from '../../store/questionReportStore';
import {
  REPORT_CATEGORIES,
  type ReportableQuestion,
} from '../../utils/questionReports';

type ReportQuestionModalProps = {
  visible: boolean;
  question: ReportableQuestion | null;
  context: QuestionReportContext;
  onClose: () => void;
  onSubmitted?: () => void;
};

export default function ReportQuestionModal({
  visible,
  question,
  context,
  onClose,
  onSubmitted,
}: ReportQuestionModalProps) {
  const insets = useSafeAreaInsets();
  const addReport = useQuestionReportStore((state) => state.addReport);

  const [category, setCategory] = useState<QuestionReportCategory | null>(
    null
  );
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  function handleClose() {
    setCategory(null);
    setDescription('');
    setIsSuccess(false);
    onClose();
  }

  function handleSubmit() {
    if (!question || !category) {
      return;
    }

    addReport({
      questionId: question.id,
      subject: question.subject,
      source: question.source,
      year: question.year,
      area: question.area,
      topic: question.topic,
      context,
      category,
      description,
      questionSnapshot: {
        statement: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
      },
    });

    setIsSuccess(true);
    onSubmitted?.();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar modal de relato"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          {isSuccess ? (
            <View style={styles.successBox}>
              <SymbolView
                name={{
                  ios: 'checkmark.circle.fill',
                  android: 'check_circle',
                  web: 'check_circle',
                }}
                tintColor={colors.success}
                size={40}
              />
              <Text style={styles.successTitle}>Relato salvo</Text>
              <Text style={styles.successText}>
                Obrigado por ajudar a melhorar as questões do StudyLazy. O
                relato ficará pendente até a próxima sincronização.
              </Text>
              <PrimaryButton label="Fechar" onPress={handleClose} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Relatar um problema</Text>
              <Text style={styles.subtitle}>
                O que parece estar errado nesta questão?
              </Text>

              <View style={styles.categoryList}>
                {REPORT_CATEGORIES.map((item) => {
                  const isSelected = category === item.key;

                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="radio"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setCategory(item.key)}
                      style={[
                        styles.categoryRow,
                        isSelected && styles.categoryRowSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}
                      />
                      <Text style={styles.categoryLabel}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>
                Conte mais detalhes, se desejar
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Explique brevemente o que encontrou..."
                placeholderTextColor={colors.text.muted}
                multiline
                textAlignVertical="top"
                style={styles.textArea}
                accessibilityLabel="Descrição opcional do problema"
              />

              <View style={styles.actions}>
                <PrimaryButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={handleClose}
                  style={styles.actionButton}
                />
                <PrimaryButton
                  label="Enviar relato"
                  onPress={handleSubmit}
                  disabled={!category}
                  style={styles.actionButton}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },

  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.xs,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  categoryList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
  },

  categoryRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card.selected,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.text.secondary,
  },

  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  categoryLabel: {
    color: colors.text.primary,
    ...typography.body,
    flex: 1,
  },

  fieldLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    marginBottom: spacing.sm,
  },

  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  actionButton: {
    flex: 1,
  },

  successBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },

  successTitle: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  successText: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
