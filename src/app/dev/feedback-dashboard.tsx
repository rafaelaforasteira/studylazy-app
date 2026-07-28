import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import {
  countByStatus,
  mentionsLives,
  summarizeNps,
} from '../../feedback/feedbackLogic';
import { useFeedbackStore } from '../../store/feedbackStore';

export default function FeedbackDashboardScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <FeedbackDashboardContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function FeedbackDashboardContent() {
  const entries = useFeedbackStore((state) => state.entries);
  const resetFeedbackDev = useFeedbackStore((state) => state.resetFeedbackDev);

  const scores = entries
    .filter((entry) => entry.kind === 'nps' && entry.score != null)
    .map((entry) => entry.score as number);
  const summary = summarizeNps(scores);
  const pending = countByStatus(entries, 'pending');
  const failed = countByStatus(entries, 'failed');
  const synced = countByStatus(entries, 'synced');

  const bugs = entries.filter((entry) => entry.kind === 'bug');
  const suggestions = entries.filter((entry) => entry.kind === 'suggestion');
  const recentComments = entries
    .filter((entry) => entry.comment)
    .slice(0, 8);
  const livesMentions = entries.filter(
    (entry) =>
      mentionsLives(entry.comment) || mentionsLives(entry.improvement)
  );

  // Extrai “dores” simples por palavras-chave (sem PII).
  const painKeywords = [
    'vida',
    'vidas',
    'bug',
    'travou',
    'lento',
    'confuso',
    'difícil',
    'sync',
    'login',
    'questão',
  ];
  const painCounts = new Map<string, number>();
  entries.forEach((entry) => {
    const text = `${entry.comment ?? ''} ${entry.improvement ?? ''}`.toLowerCase();
    painKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        painCounts.set(keyword, (painCounts.get(keyword) ?? 0) + 1);
      }
    });
  });
  const topPains = Array.from(painCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Feedback Dashboard</Text>
      <Text style={styles.subtitle}>/dev/feedback-dashboard</Text>
      <Text style={styles.lead}>
        Dados locais do beta. Não exibe tokens, chaves, e-mail completo ou
        enunciados de questões.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo NPS</Text>
        <Row label="Respostas" value={String(summary.total)} />
        <Row
          label="Média"
          value={
            summary.average != null ? summary.average.toFixed(1) : '—'
          }
        />
        <Row
          label="NPS"
          value={summary.nps != null ? String(summary.nps) : '—'}
        />
        <Row label="Promotores" value={String(summary.promoters)} />
        <Row label="Neutros" value={String(summary.passives)} />
        <Row label="Detratores" value={String(summary.detractors)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fila de sync</Text>
        <Row label="Total local" value={String(entries.length)} />
        <Row label="Pendentes" value={String(pending)} />
        <Row label="Falhas" value={String(failed)} />
        <Row label="Sincronizados" value={String(synced)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tipos</Text>
        <Row label="Bugs" value={String(bugs.length)} />
        <Row label="Sugestões" value={String(suggestions.length)} />
        <Row
          label="Mencionam vidas"
          value={String(livesMentions.length)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Principais dores (keywords)</Text>
        {topPains.length === 0 ? (
          <Text style={styles.empty}>Ainda sem padrões claros</Text>
        ) : (
          topPains.map(([keyword, count]) => (
            <Row key={keyword} label={keyword} value={String(count)} />
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comentários recentes</Text>
        {recentComments.length === 0 ? (
          <Text style={styles.empty}>Nenhum comentário ainda</Text>
        ) : (
          recentComments.map((entry) => (
            <View key={entry.id} style={styles.commentBlock}>
              <Text style={styles.commentMeta}>
                {entry.kind} · {entry.status} · {entry.score ?? '—'} ·{' '}
                {entry.createdAt.slice(0, 10)}
              </Text>
              <Text style={styles.commentText} numberOfLines={4}>
                {entry.comment}
              </Text>
              {entry.improvement ? (
                <Text style={styles.commentText} numberOfLines={3}>
                  Melhoria: {entry.improvement}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      <PrimaryButton
        label="Resetar feedback local (dev)"
        variant="secondary"
        onPress={() => resetFeedbackDev()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  blockedText: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.muted, ...typography.bodySmall },
  lead: { color: colors.text.secondary, ...typography.bodySmall },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLabel: { color: colors.text.secondary, ...typography.bodySmall },
  rowValue: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '700',
  },
  empty: { color: colors.text.muted, ...typography.bodySmall },
  commentBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
    gap: 4,
  },
  commentMeta: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  commentText: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
});
