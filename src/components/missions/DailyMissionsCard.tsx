import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useMissionStore } from '../../store/missionStore';
import type { DailyMission } from '../../missions/missionTypes';
import { areAllMissionsCompleted } from '../../missions/missionLogic';

function MissionRow({
  mission,
  onClaim,
}: {
  mission: DailyMission;
  onClaim: (id: string) => void;
}) {
  const ratio =
    mission.target > 0
      ? Math.min(1, mission.progress / mission.target)
      : 0;
  const isClaimed = mission.status === 'claimed';
  const isCompleted = mission.status === 'completed';

  return (
    <View style={styles.missionRow}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.missionReward}>+{mission.xpReward} XP</Text>
      </View>
      <Text style={styles.missionDescription}>{mission.description}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
      </View>
      <View style={styles.missionFooter}>
        <Text style={styles.progressLabel}>
          {Math.min(mission.progress, mission.target)}/{mission.target}
          {isClaimed ? ' · Resgatada' : isCompleted ? ' · Concluída' : ''}
        </Text>
        {isCompleted ? (
          <PrimaryButton
            label="Resgatar"
            variant="secondary"
            onPress={() => onClaim(mission.id)}
            style={styles.claimButton}
          />
        ) : null}
      </View>
    </View>
  );
}

export default function DailyMissionsCard() {
  const ensureToday = useMissionStore((state) => state.ensureToday);
  const missions = useMissionStore((state) => state.missions);
  const dailyBonusClaimed = useMissionStore((state) => state.dailyBonusClaimed);
  const claimMission = useMissionStore((state) => state.claimMission);
  const claimAllMissionsBonus = useMissionStore(
    (state) => state.claimAllMissionsBonus
  );
  const dateKey = useMissionStore((state) => state.dateKey);

  useEffect(() => {
    ensureToday();
  }, [ensureToday]);

  const allDone = areAllMissionsCompleted({
    dateKey,
    missions,
    dailyBonusClaimed,
    dailyBonusClaimedAt: null,
  });
  const completedCount = missions.filter(
    (m) => m.status === 'completed' || m.status === 'claimed'
  ).length;

  function handleClaim(missionId: string) {
    claimMission(missionId);
  }

  function handleClaimBonus() {
    claimAllMissionsBonus();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Missões de hoje</Text>
      <Text style={styles.subtitle}>
        Complete tarefas simples para ganhar XP e recuperar fragmentos de vida.
      </Text>
      <Text style={styles.meta}>
        {completedCount}/{missions.length} concluídas · {dateKey}
      </Text>

      {missions.map((mission) => (
        <MissionRow
          key={mission.id}
          mission={mission}
          onClaim={handleClaim}
        />
      ))}

      <View style={styles.bonusBox}>
        <Text style={styles.bonusTitle}>Bônus do dia</Text>
        <Text style={styles.bonusText}>
          Complete todas as missões e ganhe +1 fragmento de vida.
        </Text>
        {dailyBonusClaimed ? (
          <Text style={styles.bonusDone}>Bônus resgatado</Text>
        ) : allDone ? (
          <PrimaryButton
            label="Resgatar fragmento"
            onPress={handleClaimBonus}
            style={styles.bonusButton}
          />
        ) : (
          <Text style={styles.bonusHint}>
            {completedCount}/{missions.length} missões prontas
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.text.primary,
    ...typography.title,
    fontSize: 20,
  },
  subtitle: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  meta: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  missionRow: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missionTitle: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
    flex: 1,
  },
  missionReward: {
    color: colors.xp,
    fontSize: 12,
    fontWeight: '800',
  },
  missionDescription: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.card.elevated,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  missionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  claimButton: {
    minWidth: 110,
    paddingVertical: 8,
  },
  bonusBox: {
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  bonusTitle: {
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 22,
  },
  bonusText: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  bonusDone: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
  bonusHint: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  bonusButton: {
    marginTop: spacing.xs,
  },
});
