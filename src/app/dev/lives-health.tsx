import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import PrimaryButton from '../../components/ui/PrimaryButton';
import LivesIndicator from '../../components/lives/LivesIndicator';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatMsUntilNextLife } from '../../lives/livesLogic';
import { useLivesStore } from '../../store/livesStore';
import { useRetryQueueStore } from '../../store/retryQueueStore';

export default function LivesHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <LivesHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function LivesHealthContent() {
  const router = useRouter();
  const [, tick] = useState(0);
  const currentLives = useLivesStore((state) => state.currentLives);
  const maxLives = useLivesStore((state) => state.maxLives);
  const totalLivesLost = useLivesStore((state) => state.totalLivesLost);
  const isUnlimited = useLivesStore((state) => state.isUnlimited);
  const lastLifeLostAt = useLivesStore((state) => state.lastLifeLostAt);
  const lastLifeRegeneratedAt = useLivesStore(
    (state) => state.lastLifeRegeneratedAt
  );
  const lifeFragments = useLivesStore((state) => state.lifeFragments);
  const totalLivesRecoveredFromReview = useLivesStore(
    (state) => state.totalLivesRecoveredFromReview
  );
  const lastLifeRecoveredFromReviewAt = useLivesStore(
    (state) => state.lastLifeRecoveredFromReviewAt
  );
  const reviewRewardHistory = useLivesStore(
    (state) => state.reviewRewardHistory
  );
  const hydrateRegeneration = useLivesStore((state) => state.hydrateRegeneration);
  const loseOneLife = useLivesStore((state) => state.loseOneLife);
  const restoreOne = useLivesStore((state) => state.restoreOne);
  const resetLivesDev = useLivesStore((state) => state.resetLivesDev);
  const setUnlimited = useLivesStore((state) => state.setUnlimited);
  const addFragmentDev = useLivesStore((state) => state.addFragmentDev);
  const completeLifeFromReviewDev = useLivesStore(
    (state) => state.completeLifeFromReviewDev
  );
  const clearReviewRewardsDev = useLivesStore(
    (state) => state.clearReviewRewardsDev
  );
  const getMsUntilNextLife = useLivesStore((state) => state.getMsUntilNextLife);

  const retryItems = useRetryQueueStore((state) => state.items);
  const recordMiss = useRetryQueueStore((state) => state.recordMiss);
  const clearQueueDev = useRetryQueueStore((state) => state.clearQueueDev);

  useEffect(() => {
    hydrateRegeneration();
    const id = setInterval(() => {
      hydrateRegeneration();
      tick((value) => value + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [hydrateRegeneration]);

  const waitMs = getMsUntilNextLife();
  const waitLabel = formatMsUntilNextLife(waitMs) ?? '—';
  const activeRetries = retryItems.filter((item) => item.active);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Lives Health</Text>
      <Text style={styles.subtitle}>/dev/lives-health</Text>

      <LivesIndicator />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estado</Text>
        <Row label="Vidas atuais" value={String(currentLives)} />
        <Row label="Máximo" value={String(maxLives)} />
        <Row label="Fragmentos" value={String(lifeFragments)} />
        <Row label="Próxima vida" value={waitLabel} />
        <Row label="Total perdidas" value={String(totalLivesLost)} />
        <Row
          label="Recuperadas (revisão)"
          value={String(totalLivesRecoveredFromReview)}
        />
        <Row
          label="Último recover revisão"
          value={
            lastLifeRecoveredFromReviewAt
              ? lastLifeRecoveredFromReviewAt.slice(11, 19)
              : '—'
          }
        />
        <Row label="Unlimited" value={isUnlimited ? 'sim' : 'não'} />
        <Row
          label="Última perda"
          value={lastLifeLostAt ? lastLifeLostAt.slice(11, 19) : '—'}
        />
        <Row
          label="Última regen"
          value={
            lastLifeRegeneratedAt ? lastLifeRegeneratedAt.slice(11, 19) : '—'
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Histórico de rewards ({reviewRewardHistory.length})
        </Text>
        {reviewRewardHistory.length === 0 ? (
          <Text style={styles.empty}>Nenhuma recompensa ainda</Text>
        ) : (
          reviewRewardHistory.slice(0, 12).map((item) => (
            <Text
              key={`${item.stableQuestionId}-${item.rewardedAt}`}
              style={styles.retryLine}
            >
              {item.stableQuestionId} · {item.rewardedAt.slice(11, 19)}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Retry queue ({activeRetries.length} ativos)</Text>
        {activeRetries.length === 0 ? (
          <Text style={styles.empty}>Fila vazia</Text>
        ) : (
          activeRetries.slice(0, 8).map((item) => (
            <Text key={`${item.subject}-${item.stableQuestionId}`} style={styles.retryLine}>
              {item.subject} · {item.stableQuestionId} · ×{item.errorCount}
            </Text>
          ))
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Perder 1 vida"
          onPress={() => loseOneLife(`dev-${Date.now()}`)}
        />
        <PrimaryButton
          label="Recuperar 1 vida"
          variant="secondary"
          onPress={() => restoreOne()}
        />
        <PrimaryButton
          label="Adicionar fragmento"
          variant="secondary"
          onPress={() => addFragmentDev()}
        />
        <PrimaryButton
          label="Completar 1 vida por revisão"
          variant="secondary"
          onPress={() => completeLifeFromReviewDev()}
        />
        <PrimaryButton
          label="Limpar histórico de recompensa"
          variant="secondary"
          onPress={() => clearReviewRewardsDev()}
        />
        <PrimaryButton
          label="Resetar vidas"
          variant="secondary"
          onPress={() => resetLivesDev()}
        />
        <PrimaryButton
          label={isUnlimited ? 'Desligar unlimited' : 'Ligar unlimited (Pro)'}
          variant="secondary"
          onPress={() => setUnlimited(!isUnlimited)}
        />
        <PrimaryButton
          label="Simular erro (Matemática)"
          variant="secondary"
          onPress={() =>
            recordMiss(`DEV-RETRY-${Date.now()}`, 'Matemática')
          }
        />
        <PrimaryButton
          label="Limpar retry queue"
          variant="secondary"
          onPress={() => clearQueueDev()}
        />
        <PrimaryButton
          label="Feedback / NPS"
          variant="secondary"
          onPress={() => router.push(ROUTES.feedback)}
        />
        <PrimaryButton
          label="Feedback dashboard"
          variant="secondary"
          onPress={() => router.push('/dev/feedback-dashboard' as never)}
        />
        <PrimaryButton
          label="Missions health"
          variant="secondary"
          onPress={() => router.push('/dev/missions-health' as never)}
        />
        <PrimaryButton
          label="Achievements health"
          variant="secondary"
          onPress={() => router.push('/dev/achievements-health' as never)}
        />
      </View>

      <Text style={styles.note}>
        Dev only — não exibe tokens, chaves ou enunciados de questões.
        Revisão de erros não consome vidas; acerto dá 1/2 vida (2 = +1).
      </Text>
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
    flexShrink: 1,
    textAlign: 'right',
  },
  empty: { color: colors.text.muted, ...typography.bodySmall },
  retryLine: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  actions: { gap: spacing.sm },
  note: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
