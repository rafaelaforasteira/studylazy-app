import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useMissionStore } from '../../store/missionStore';
import { getMissionDateKey } from '../../missions/missionLogic';

export default function MissionsHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <MissionsHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function MissionsHealthContent() {
  const router = useRouter();
  const [, tick] = useState(0);
  const ensureToday = useMissionStore((state) => state.ensureToday);
  const dateKey = useMissionStore((state) => state.dateKey);
  const missions = useMissionStore((state) => state.missions);
  const dailyBonusClaimed = useMissionStore((state) => state.dailyBonusClaimed);
  const dailyBonusClaimedAt = useMissionStore(
    (state) => state.dailyBonusClaimedAt
  );
  const simulateLessonDev = useMissionStore((state) => state.simulateLessonDev);
  const simulateAnswersDev = useMissionStore(
    (state) => state.simulateAnswersDev
  );
  const simulateCorrectDev = useMissionStore(
    (state) => state.simulateCorrectDev
  );
  const simulateReviewsDev = useMissionStore(
    (state) => state.simulateReviewsDev
  );
  const claimAllRewardsDev = useMissionStore(
    (state) => state.claimAllRewardsDev
  );
  const resetMissionsDev = useMissionStore((state) => state.resetMissionsDev);
  const forceNewDayDev = useMissionStore((state) => state.forceNewDayDev);

  useEffect(() => {
    ensureToday();
    const id = setInterval(() => tick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [ensureToday]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Missions Health</Text>
      <Text style={styles.subtitle}>/dev/missions-health</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estado</Text>
        <Row label="dateKey store" value={dateKey} />
        <Row label="dateKey local" value={getMissionDateKey()} />
        <Row
          label="Bônus diário"
          value={dailyBonusClaimed ? 'resgatado' : 'pendente'}
        />
        <Row
          label="Bônus em"
          value={
            dailyBonusClaimedAt ? dailyBonusClaimedAt.slice(11, 19) : '—'
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Missões ({missions.length})</Text>
        {missions.map((mission) => (
          <View key={mission.id} style={styles.missionBlock}>
            <Text style={styles.missionLine}>
              {mission.title} · {mission.status}
            </Text>
            <Text style={styles.missionMeta}>
              {mission.progress}/{mission.target} · +{mission.xpReward} XP ·{' '}
              {mission.type}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Simular lição concluída"
          onPress={() => simulateLessonDev()}
        />
        <PrimaryButton
          label="Simular 10 questões"
          variant="secondary"
          onPress={() => simulateAnswersDev(10)}
        />
        <PrimaryButton
          label="Simular 7 acertos"
          variant="secondary"
          onPress={() => simulateCorrectDev(7)}
        />
        <PrimaryButton
          label="Simular 3 revisões"
          variant="secondary"
          onPress={() => simulateReviewsDev(3)}
        />
        <PrimaryButton
          label="Resgatar recompensas"
          variant="secondary"
          onPress={() => claimAllRewardsDev()}
        />
        <PrimaryButton
          label="Resetar missões do dia"
          variant="secondary"
          onPress={() => resetMissionsDev()}
        />
        <PrimaryButton
          label="Forçar novo dia"
          variant="secondary"
          onPress={() => forceNewDayDev()}
        />
        <PrimaryButton
          label="Lives health"
          variant="secondary"
          onPress={() => router.push('/dev/lives-health' as never)}
        />
        <PrimaryButton
          label="Voltar para Você"
          variant="secondary"
          onPress={() => router.replace(ROUTES.tabsVoce)}
        />
      </View>

      <Text style={styles.note}>
        Dev only — sem tokens, e-mails ou enunciados. Recompensas: +10 XP por
        missão; bônus = +1 fragmento de vida.
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
  missionBlock: { gap: 2, marginBottom: spacing.xs },
  missionLine: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '700',
  },
  missionMeta: { color: colors.text.muted, fontSize: 12 },
  actions: { gap: spacing.sm },
  note: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
