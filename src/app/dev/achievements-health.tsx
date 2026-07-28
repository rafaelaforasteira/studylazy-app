import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import PrimaryButton from '../../components/ui/PrimaryButton';
import LevelProgressCard from '../../components/levels/LevelProgressCard';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useAchievementStore } from '../../store/achievementStore';
import { useStudyProgressStore } from '../../store/studyProgressStore';
import { computeStudentLevel } from '../../levels/levelLogic';
import { ACHIEVEMENT_DEFINITIONS } from '../../achievements/achievementLogic';

export default function AchievementsHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <AchievementsHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function AchievementsHealthContent() {
  const router = useRouter();
  const [, tick] = useState(0);
  const xp = useStudyProgressStore((state) => state.xp);
  const addBonusXp = useStudyProgressStore((state) => state.addBonusXp);
  const counters = useAchievementStore((state) => state.counters);
  const unlocked = useAchievementStore((state) => state.unlocked);
  const getViews = useAchievementStore((state) => state.getViews);
  const simulateLessonDev = useAchievementStore(
    (state) => state.simulateLessonDev
  );
  const simulateQuestionsDev = useAchievementStore(
    (state) => state.simulateQuestionsDev
  );
  const simulateReviewDev = useAchievementStore(
    (state) => state.simulateReviewDev
  );
  const simulateAllMissionsDev = useAchievementStore(
    (state) => state.simulateAllMissionsDev
  );
  const unlockTestAchievementDev = useAchievementStore(
    (state) => state.unlockTestAchievementDev
  );
  const resetAchievementsDev = useAchievementStore(
    (state) => state.resetAchievementsDev
  );
  const recordXpChanged = useAchievementStore((state) => state.recordXpChanged);

  useEffect(() => {
    recordXpChanged(xp);
    const id = setInterval(() => tick((v) => v + 1), 2000);
    return () => clearInterval(id);
  }, [xp, recordXpChanged]);

  const level = computeStudentLevel(xp);
  const views = getViews();
  const unlockedViews = views.filter((v) => v.status === 'unlocked');
  const lockedViews = views.filter((v) => v.status === 'locked');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Achievements Health</Text>
      <Text style={styles.subtitle}>/dev/achievements-health</Text>

      <LevelProgressCard xp={xp} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nível / XP</Text>
        <Row label="XP atual" value={String(xp)} />
        <Row label="Nível" value={`${level.level} — ${level.name}`} />
        <Row
          label="Próximo"
          value={
            level.isMaxLevel
              ? 'máximo'
              : `${level.nextLevelXpRequired} XP (−${level.xpRemaining})`
          }
        />
        <Row label="Progresso" value={`${level.progressPercent}%`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contadores</Text>
        <Row label="Lições" value={String(counters.lessonsCompleted)} />
        <Row label="Questões" value={String(counters.questionsAnswered)} />
        <Row label="Acertos" value={String(counters.correctAnswers)} />
        <Row label="Revisões" value={String(counters.reviewsAnswered)} />
        <Row
          label="Vidas (revisão)"
          value={String(counters.livesRecoveredFromReview)}
        />
        <Row
          label="Missões completas"
          value={String(counters.allDailyMissionsCompleted)}
        />
        <Row label="Streak máx." value={String(counters.maxStreakSeen)} />
        <Row label="XP visto" value={String(counters.xpSeen)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Desbloqueadas ({unlockedViews.length}/{ACHIEVEMENT_DEFINITIONS.length})
        </Text>
        {unlockedViews.length === 0 ? (
          <Text style={styles.empty}>Nenhuma</Text>
        ) : (
          unlockedViews.map((item) => (
            <Text key={item.id} style={styles.line}>
              {item.icon} {item.title}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bloqueadas ({lockedViews.length})</Text>
        {lockedViews.slice(0, 8).map((item) => (
          <Text key={item.id} style={styles.line}>
            {item.icon} {item.title} · {item.progress}/{item.target}
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Adicionar +50 XP"
          onPress={() => addBonusXp(50)}
        />
        <PrimaryButton
          label="Simular lição"
          variant="secondary"
          onPress={() => simulateLessonDev()}
        />
        <PrimaryButton
          label="Simular questões respondidas"
          variant="secondary"
          onPress={() => simulateQuestionsDev(10)}
        />
        <PrimaryButton
          label="Simular revisão"
          variant="secondary"
          onPress={() => simulateReviewDev()}
        />
        <PrimaryButton
          label="Simular missão completa (todas)"
          variant="secondary"
          onPress={() => simulateAllMissionsDev()}
        />
        <PrimaryButton
          label="Desbloquear conquista teste"
          variant="secondary"
          onPress={() => unlockTestAchievementDev('first_lesson')}
        />
        <PrimaryButton
          label="Resetar conquistas"
          variant="secondary"
          onPress={() => resetAchievementsDev()}
        />
        <PrimaryButton
          label="Missions health"
          variant="secondary"
          onPress={() => router.push('/dev/missions-health' as never)}
        />
        <PrimaryButton
          label="Voltar para Você"
          variant="secondary"
          onPress={() => router.replace(ROUTES.tabsVoce)}
        />
      </View>

      <Text style={styles.note}>
        Dev only — sem tokens, e-mails ou enunciados. Unlocks: {unlocked.length}.
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
  line: { color: colors.text.secondary, ...typography.bodySmall },
  actions: { gap: spacing.sm },
  note: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
