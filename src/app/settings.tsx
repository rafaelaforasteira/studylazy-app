import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useOnboardingStore } from '../store/onboardingStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import { useProfileStore } from '../store/profileStore';

export default function SettingsScreen() {
  const router = useRouter();

  const resetAnswers = useOnboardingStore((state) => state.resetAnswers);
  const resetProgress = useStudyProgressStore(
    (state) => state.resetProgress
  );
  const resetProfile = useProfileStore((state) => state.resetProfile);

  function handleOpenProfile() {
    router.push('/profile');
  }

  function handleResetProgress() {
    resetProgress();
    router.replace('/dashboard');
  }

  function handleResetOnboarding() {
    resetProgress();
    resetProfile();
    resetAnswers();

    router.replace('/onboarding-1');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>

        <Text style={styles.subtitle}>
          Personalize sua experiência ou reinicie os dados do aplicativo.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEmoji}>👤</Text>

        <Text style={styles.cardTitle}>Meu perfil</Text>

        <Text style={styles.cardDescription}>
          Altere seu nome e acompanhe suas principais estatísticas.
        </Text>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleOpenProfile}
        >
          <Text style={styles.profileButtonText}>Abrir perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEmoji}>📊</Text>

        <Text style={styles.cardTitle}>Progresso</Text>

        <Text style={styles.cardDescription}>
          Apaga XP, sequência, sessões, histórico e lições concluídas.
          Suas respostas do onboarding serão mantidas.
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResetProgress}
        >
          <Text style={styles.secondaryButtonText}>
            Resetar progresso
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEmoji}>🔄</Text>

        <Text style={styles.cardTitle}>Recomeçar o aplicativo</Text>

        <Text style={styles.cardDescription}>
          Apaga o perfil, o progresso e todas as respostas do
          onboarding.
        </Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetOnboarding}
        >
          <Text style={styles.dangerButtonText}>
            Refazer onboarding
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Voltar ao dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
  },

  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },

  cardEmoji: {
    fontSize: 30,
    marginBottom: spacing.sm,
  },

  cardTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },

  cardDescription: {
    color: colors.text.secondary,
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  profileButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  profileButtonText: {
    color: colors.background,
    ...typography.button,
  },

  secondaryButton: {
    backgroundColor: colors.background,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: colors.primary,
    ...typography.button,
  },

  dangerButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  dangerButtonText: {
    color: '#ffffff',
    ...typography.button,
  },

  backButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  backButtonText: {
    color: colors.text.secondary,
    ...typography.body,
  },
});