import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useOnboardingStore } from '../store/onboardingStore';
import { useStudyProgressStore } from '../store/studyProgressStore';

export default function SettingsScreen() {
  const router = useRouter();

  const resetAnswers = useOnboardingStore((state) => state.resetAnswers);
  const resetProgress = useStudyProgressStore((state) => state.resetProgress);

  function handleResetProgress() {
    resetProgress();
    router.replace('/dashboard');
  }

  function handleResetOnboarding() {
    resetProgress();
    resetAnswers();
    router.replace('/onboarding-1');
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Configurações</Text>

        <Text style={styles.subtitle}>
          Use esta tela para testar o app do zero ou limpar seu progresso.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progresso</Text>

        <Text style={styles.cardDescription}>
          Apaga XP, streak, sessões, histórico e lições concluídas.
        </Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleResetProgress}>
          <Text style={styles.secondaryButtonText}>Resetar progresso</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Onboarding</Text>

        <Text style={styles.cardDescription}>
          Apaga suas respostas e volta para o início do app.
        </Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleResetOnboarding}>
          <Text style={styles.dangerButtonText}>Refazer onboarding</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
        <Text style={styles.primaryButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.xl,
  },

  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 'auto',
  },

  primaryButtonText: {
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
});