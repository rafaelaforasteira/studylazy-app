import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useOnboardingStore } from '../store/onboardingStore';

export default function GeneratingPlanScreen() {
  const router = useRouter();

  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      completeOnboarding();
      router.replace('/dashboard');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />

      <Text style={styles.title}>Montando seu plano...</Text>

      <Text style={styles.step}>🔍 Analisando suas respostas</Text>
      <Text style={styles.step}>📚 Organizando seus estudos</Text>
      <Text style={styles.step}>🎯 Definindo metas personalizadas</Text>
      <Text style={styles.step}>🚀 Preparando sua jornada</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },

  step: {
    color: colors.text.secondary,
    fontSize: 16,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});