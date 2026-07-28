import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import AccountCard from '../../components/auth/AccountCard';
import UpgradeCard from '../../components/entitlements/UpgradeCard';
import LivesIndicator from '../../components/lives/LivesIndicator';
import DailyMissionsCard from '../../components/missions/DailyMissionsCard';
import NpsPrompt from '../../components/feedback/NpsPrompt';
import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useMistakeStore } from '../../store/mistakeStore';
import { useRetryQueueStore } from '../../store/retryQueueStore';
import { useStudyProgressStore } from '../../store/studyProgressStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useLivesStore } from '../../store/livesStore';
import {
  getGoalLabel,
  getPreparationLabel,
} from '../../utils/onboardingFormatters';

type MenuItem = {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  isLast?: boolean;
};

function MenuRow({
  label,
  onPress,
  accessibilityLabel,
  isLast = false,
}: MenuItem) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        isLast && styles.menuRowLast,
        pressed && styles.menuRowPressed,
      ]}
    >
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function VoceScreen() {
  const router = useRouter();
  const data = useDashboardData();
  const mistakesCount = useMistakeStore((state) => state.mistakes.length);
  const activeRetries = useRetryQueueStore((state) =>
    state.items.filter((item) => item.active).length
  );
  const completedSessions = useStudyProgressStore(
    (state) => state.lessonHistory.length
  );
  const canShowNps = useFeedbackStore((state) => state.canShowNps);
  const [showNps, setShowNps] = useState(false);
  const currentLives = useLivesStore((state) => state.currentLives);
  const maxLives = useLivesStore((state) => state.maxLives);
  const lifeFragments = useLivesStore((state) => state.lifeFragments);
  const isUnlimited = useLivesStore((state) => state.isUnlimited);
  const getTimeUntilNextLabel = useLivesStore(
    (state) => state.getTimeUntilNextLabel
  );
  const nextLifeLabel = getTimeUntilNextLabel();

  const avatarInitial = (
    data.studentName.trim().charAt(0) || 'E'
  ).toUpperCase();

  function handleOpenNps() {
    // Manual: sempre pode abrir o formulário.
    canShowNps({ completedSessions, trigger: 'manual' });
    setShowNps(true);
  }

  function showComingSoon(feature: string) {
    Alert.alert(
      feature,
      'Este recurso ainda está em desenvolvimento e estará disponível em breve.'
    );
  }

  function showHelp() {
    Alert.alert(
      'Ajuda StudyLazy',
      'Use as abas para acompanhar sua evolução em Atividade, seguir o plano diário, estudar e revisar erros. Aqui em Você você gerencia sua conta e preferências.'
    );
  }

  function showGoalsInfo() {
    Alert.alert(
      'Meta e preferências',
      `Objetivo: ${getGoalLabel(data.answers.goal)}\nMeta diária: ${data.dailyGoalMinutes} min\nPreparação: ${getPreparationLabel(data.answers.preparationLevel)}${
        data.answers.startPreference
          ? `\nPreferência inicial: ${data.answers.startPreference}`
          : ''
      }\n\nPara alterar, acesse Configurações ou refaça o onboarding nas configurações.`
    );
  }

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Você</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
          onPress={() => router.push(ROUTES.settings)}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.settingsButtonPressed,
          ]}
          hitSlop={8}
        >
          <SymbolView
            name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
            tintColor={colors.text.primary}
            size={20}
          />
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={styles.avatarGlow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        </View>

        <Text style={styles.name}>{data.studentName}</Text>
        <Text style={styles.level}>
          Nível {data.levelData.level} • {data.levelData.title}
        </Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>
            {data.displayStreak} dias de sequência
          </Text>
        </View>
      </View>

      <AccountCard />

      <DailyMissionsCard />

      <View style={styles.livesCard}>
        <Text style={styles.livesCardTitle}>Vidas e revisão</Text>
        <LivesIndicator showCount showRegenHint />
        <Text style={styles.livesCardMeta}>
          Vidas atuais: {isUnlimited ? 'ilimitadas' : `${currentLives}/${maxLives}`}
        </Text>
        <Text style={styles.livesCardMeta}>
          {isUnlimited
            ? 'Sem espera de recarga (Pro / unlimited).'
            : currentLives >= maxLives
              ? 'Vidas no máximo — próxima recarga pausada.'
              : nextLifeLabel
                ? `Tempo até próxima vida: ${nextLifeLabel}`
                : 'Tempo até próxima vida: —'}
        </Text>
        {lifeFragments === 1 && !isUnlimited ? (
          <Text style={styles.livesCardMeta}>
            Fragmento de vida: +1/2 (acerte mais uma revisão para recuperar 1 vida)
          </Text>
        ) : null}
        <Text style={styles.livesCardMeta}>
          {activeRetries > 0
            ? `${activeRetries} ${activeRetries === 1 ? 'questão' : 'questões'} com prioridade de revisão`
            : 'Nenhuma questão prioritária na fila de retry'}
        </Text>
        <Text style={styles.livesCardMeta}>
          {mistakesCount > 0
            ? `${mistakesCount} ${mistakesCount === 1 ? 'erro salvo' : 'erros salvos'} para revisar`
            : 'Nenhum erro pendente na revisão'}
        </Text>
        <Text style={styles.livesCardHint}>
          Dica: acerte revisões para recuperar vidas. No Pro futuro: vidas
          ilimitadas, sem precisar esperar recarga.
        </Text>
      </View>

      <View style={styles.livesCard}>
        <Text style={styles.livesCardTitle}>Avaliar o StudyLazy</Text>
        <Text style={styles.livesCardMeta}>
          Conte como está sendo o beta — leva menos de um minuto.
        </Text>
        {showNps ? (
          <NpsPrompt
            screen="voce"
            onSubmitted={() => setShowNps(false)}
            onDismissed={() => setShowNps(false)}
          />
        ) : (
          <>
            <PrimaryButton label="Avaliar experiência" onPress={handleOpenNps} />
            <PrimaryButton
              label="Enviar feedback / bug"
              variant="secondary"
              onPress={() => router.push(ROUTES.feedback)}
            />
          </>
        )}
      </View>

      <SectionTitle title="Minha conta" />
      <View style={styles.menuCard}>
        <MenuRow
          label="Editar perfil"
          accessibilityLabel="Editar perfil"
          onPress={() => router.push(ROUTES.profile)}
        />
        <MenuRow
          label="Configurações"
          accessibilityLabel="Abrir configurações"
          onPress={() => router.push(ROUTES.settings)}
        />
        <MenuRow
          label="Histórico completo"
          accessibilityLabel="Ver histórico completo"
          onPress={() => router.push(ROUTES.history)}
          isLast
        />
      </View>

      <SectionTitle title="Minha experiência" />
      <View style={styles.menuCard}>
        <MenuRow
          label="Meta e preferências"
          accessibilityLabel="Ver meta e preferências"
          onPress={showGoalsInfo}
        />
        <MenuRow
          label="Notificações"
          accessibilityLabel="Configurar notificações"
          onPress={() => showComingSoon('Notificações')}
        />
        <MenuRow
          label="Personalização"
          accessibilityLabel="Personalizar experiência"
          onPress={() => showComingSoon('Personalização')}
        />
        <MenuRow
          label="Meus relatos de questões"
          accessibilityLabel="Ver meus relatos de questões"
          onPress={() => router.push(ROUTES.questionReports)}
        />
        <MenuRow
          label="Feedback do beta"
          accessibilityLabel="Abrir feedback do beta"
          onPress={() => router.push(ROUTES.feedback)}
        />
        <MenuRow
          label="Ajuda"
          accessibilityLabel="Abrir ajuda"
          onPress={showHelp}
          isLast
        />
      </View>

      <SectionTitle title="Planos e upgrade" />
      <UpgradeCard />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },

  livesCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  livesCardTitle: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
  },

  livesCardMeta: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },

  livesCardHint: {
    color: colors.primarySoft,
    ...typography.bodySmall,
    fontWeight: '600',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  pageTitle: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsButtonPressed: {
    opacity: 0.85,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  avatarGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: '900',
  },

  name: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  level: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 3,
  },

  streakBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 93, 59, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 59, 0.22)',
  },

  streakText: {
    color: '#FFBEAF',
    fontSize: 12,
    fontWeight: '800',
  },

  sectionTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },

  menuRowLast: {
    borderBottomWidth: 0,
  },

  menuRowPressed: {
    backgroundColor: colors.surfaceSecondary,
  },

  menuLabel: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '600',
  },

  menuArrow: {
    color: colors.text.secondary,
    fontSize: 20,
  },
});
