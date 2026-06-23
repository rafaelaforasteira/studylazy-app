import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';

import { colors } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useQuestionReportStore } from '../store/questionReportStore';
import {
  formatReportDate,
  getCategoryLabel,
  getContextLabel,
  getStatusLabel,
  truncateStatement,
} from '../utils/questionReports';

export default function QuestionReportsScreen() {
  const router = useRouter();
  const reports = useQuestionReportStore((state) => state.reports);
  const removeReport = useQuestionReportStore((state) => state.removeReport);
  const clearReports = useQuestionReportStore((state) => state.clearReports);
  const pendingCount = useQuestionReportStore((state) =>
    state.getPendingReports().length
  );

  const sortedReports = [...reports].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function confirmRemove(id: string) {
    Alert.alert(
      'Excluir relato',
      'Deseja remover este relato salvo localmente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removeReport(id),
        },
      ]
    );
  }

  function confirmClearAll() {
    Alert.alert(
      'Limpar relatos',
      'Todos os relatos salvos neste dispositivo serão removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar relatos',
          style: 'destructive',
          onPress: () => clearReports(),
        },
      ]
    );
  }

  return (
    <AppScreen>
      <Text style={styles.title}>Meus relatos</Text>
      <Text style={styles.subtitle}>
        {pendingCount > 0
          ? `${pendingCount} relato${pendingCount === 1 ? '' : 's'} pendente${pendingCount === 1 ? '' : 's'}`
          : 'Nenhum relato pendente'}
      </Text>

      {sortedReports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum relato registrado</Text>
          <Text style={styles.emptyText}>
            Quando você encontrar um problema em uma questão, seus relatos
            aparecerão aqui.
          </Text>
        </View>
      ) : (
        <>
          {sortedReports.map((report) => (
            <View key={report.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.subject}>{report.subject}</Text>
                <Text style={styles.status}>
                  {getStatusLabel(report.status)}
                </Text>
              </View>

              <Text style={styles.category}>
                {getCategoryLabel(report.category)}
              </Text>
              <Text style={styles.statement} numberOfLines={2}>
                {truncateStatement(report.questionSnapshot.statement)}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {formatReportDate(report.createdAt)}
                </Text>
                <Text style={styles.meta}>
                  {getContextLabel(report.context)}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Excluir relato"
                onPress={() => confirmRemove(report.id)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                ]}
              >
                <Text style={styles.deleteLabel}>Excluir relato</Text>
              </Pressable>
            </View>
          ))}

          <PrimaryButton
            label="Limpar relatos"
            variant="secondary"
            onPress={confirmClearAll}
            style={styles.clearButton}
          />
        </>
      )}

      <PrimaryButton
        label="Voltar"
        variant="secondary"
        onPress={() => router.back()}
        style={styles.backButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  emptyTitle: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },

  emptyText: {
    color: colors.text.secondary,
    ...typography.body,
    lineHeight: 22,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  subject: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
    flex: 1,
  },

  status: {
    color: colors.progress,
    ...typography.bodySmall,
    fontWeight: '700',
  },

  category: {
    color: colors.primarySoft,
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },

  statement: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.sm,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  meta: {
    color: colors.text.muted,
    ...typography.bodySmall,
  },

  deleteButton: {
    alignSelf: 'flex-start',
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },

  deleteButtonPressed: {
    opacity: 0.75,
  },

  deleteLabel: {
    color: colors.danger,
    ...typography.bodySmall,
    fontWeight: '700',
  },

  clearButton: {
    marginBottom: spacing.sm,
  },

  backButton: {
    marginTop: spacing.sm,
  },
});
