import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
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

  const avatarInitial = (
    data.studentName.trim().charAt(0) || 'E'
  ).toUpperCase();

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
          label="Ajuda"
          accessibilityLabel="Abrir ajuda"
          onPress={showHelp}
          isLast
        />
      </View>

      <SectionTitle title="Planos e upgrade" />
      <View style={styles.proCard}>
        <Text style={styles.proEyebrow}>StudyLazy Pro</Text>
        <Text style={styles.proTitle}>Evolua com recursos avançados</Text>
        <Text style={styles.proDescription}>
          Estatísticas avançadas, plano adaptativo, sincronização em nuvem e
          muito mais — em desenvolvimento.
        </Text>
        <PrimaryButton
          label="Conhecer planos"
          onPress={() => router.push(ROUTES.plans)}
          style={styles.proButton}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
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

  proCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  proEyebrow: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },

  proTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },

  proDescription: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  proButton: {
    alignSelf: 'flex-start',
  },
});
